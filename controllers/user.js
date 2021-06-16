const User = require('../model/user')
const { errorHandler } = require('../helpers/dbErrorHandler');
const Blog = require('../model/blog');
const _ = require('lodash')
const formidable = require('formidable')
const fs = require('fs')
exports.read = (req, res) => {
    req.profile.hashed_password = undefined;
    return res.json({
        user: req.profile
    })
}

exports.publicProfile = (req, res) => {
    let username = req.params.username
    let user
    let blogs
    User.findOne({ username })
        .exec((err, data) => {
            if (err) {
                return res.status(400).json({
                    err: errorHandler(err)
                })
            }

            user = data
            user.hashed_password = undefined
            user.salt = undefined
            Blog.find({ postedBy: user._id })
                .populate('catagories', '_id name slug')
                .populate('tags', '_id name slug')
                .populate('postedBy', '_id name')
                .limit(10)
                .select('-photo -body')
                .exec((err, blog) => {
                    if (err) {
                        return res.status(400).json({
                            err: errorHandler(err)
                        })
                    }
                    res.json({
                        user,
                        blogs: blog
                    })
                })

        })
}
exports.update = (req, res) => {
    let form = new formidable.IncomingForm()
    form.keepExtensions = true;
    form.parse((req), (err, fields, files) => {
        if (err) {
            return res.status(400).json({
                err: 'Photo could not be uploaded'
            })
        }
        let user = req.profile
        let { username, name, email, password } = fields;
        if (username == '') {
            return res.status(400).json({
                err: "Username is required."
            })
        }
        if (name == '') {
            return res.status(400).json({
                err: "Name is required."
            })
        }
        if (email == '') {
            return res.status(400).json({
                err: "Email is required."
            })
        }
        if (password && password.length < 6) {
            return res.status(400).json({
                err: "Password must be atleast 6 charachters long. "
            })
        }
       
        if (username) {
            user.profile = `${process.env.CLIENT_URL}/profile/${username}`;
        }
        user = _.extend(user, fields)
        if (files.photo) {
            if (files.photo.size > 10000000) {
                return res.status(400).json({
                    err: "Image should be less than 1mb. "
                })
            }
            user.photo.data = fs.readFileSync(files.photo.path)
            user.photo.contentType = files.photo.type
        }
        user.save((err, response) => {
            if (err) {
                return res.status(400).json({
                    err: errorHandler(err)
                })
            }
            response.hashed_password = undefined
            response.salt=undefined
            res.json({ user: response })
        })
    })
}

exports.photo = (req, res) => {
    const username = req.params.username
    User.findOne({ username })
        .exec((err, data) => {
            if (err || !data) {
                return res.status(400).json({
                    err: errorHandler(err)
                })
            }
            if (data.photo.data) {
                res.set('Content-Type', data.photo.contentType)
                return res.send(data.photo.data)
            }
        })
}