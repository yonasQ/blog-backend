const Blog = require('../model/blog')
const User = require('../model/user')
const Catagory = require('../model/catagory')
const Tag = require('../model/tag')
const formidable = require('formidable')
const slugify = require('slugify')
const stripHtml = require('string-strip-html')
const _ = require('lodash')
const { errorHandler } = require('../helpers/dbErrorHandler')
const fs = require('fs')
const { smartTrim } = require('../helpers/blog')


exports.create = (req, res) => {
    let form = new formidable.IncomingForm()
    form.keepExtensions = true;
    form.parse((req), (err, fields, files) => {

        const { title, body, catagories, tags } = fields

        if (err) {
            return res.status(400).json({
                err: "Image could not upload"
            })
        }

        if (!title) {
            return res.status(400).json({
                err: 'Title is required'
            })
        }
        if (!body || body.length < 200) {
            return res.status(400).json({
                err: 'Content is too short'
            })
        }
        if (!catagories || catagories.length == 0) {

            return res.status(400).json({
                err: 'Atleast one catagory is required'
            })
        }
        if (!tags || tags.length == 0) {

            return res.status(400).json({
                err: 'Atleast one tag is required'
            })
        }
        let arrayOfCatagory = catagories && catagories.split(',')
        let arrayOfTags = tags && tags.split(',')
        const blog = new Blog()
        blog.title = title
        blog.body = body
        blog.excerpt = smartTrim(body, 180, ' ', ' ...')
        blog.slug = slugify(title).toLowerCase()
        blog.mtitle = `${title} | ${process.env.APP_NAME}`;
        blog.mdesc = stripHtml(body.substring(0, 160))
        blog.postedBy = req.user._id
        if (files.photo) {
            if (files.photo.size > 1000000) {
                return res.status(400).json({
                    err: "Image should be less than 10mb. "
                })
            }
            blog.photo.data = fs.readFileSync(files.photo.path)
            blog.photo.contentType = files.photo.type
        }
        blog.save((err, response) => {
            if (err) {
                return res.status(400).json({
                    err: errorHandler(err)
                })
            }
            Blog.findByIdAndUpdate(response._id, { $push: { catagories: arrayOfCatagory } }, { new: true }).exec((err, result) => {
                if (err) {
                    return res.status(400).json({
                        err: errorHandler(err)
                    })
                }
                Blog.findByIdAndUpdate(result._id, { $push: { tags: arrayOfTags } }, { new: true }).exec((err, result) => {
                    if (err) {
                        return res.status(400).json({
                            err: errorHandler(err)
                        })
                    }
                    return res.json({ result })
                })

            })
        })
    })
}
exports.list = (req, res) => {
    Blog.find({})
        .populate('catagories', '_id name slug')
        .populate('tags', '_id name slug')
        .populate('postedBy', '_id name username')
        .select('title slug postedBy createdAt updatedAt')
        .exec((err, data) => {
            if (err) {
                return res.status(400).json({
                    err: err
                })
            }
            res.json({ blogs: data })
        })
}
exports.blogsCatagoriesTags = (req, res) => {
    let limit = req.body.limit ? parseInt(req.body.limit) : 10
    let skip = req.body.skip ? parseInt(req.body.skip) : 0
    let blogs
    let catagories
    let tags

    Blog.find({})
        .populate('catagories', '_id name slug')
        .populate('tags', '_id name slug')
        .populate('postedBy', '_id name username profile')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('_id title photo slug excerpt catagories tags postedBy createdAt updatedAt')
        .exec((err, data) => {
            if (err) {
                return res.status(400).json({
                    err: errorHandler(err)
                })
            }
            blogs = data
            Catagory.find({})
                .exec((err, c) => {
                    if (err) {
                        return res.status(400).json({
                            err: errorHandler(err)
                        })
                    }
                    catagories = c
                    Tag.find({})
                        .exec((err, t) => {
                            if (err) {
                                return res.status(400).json({
                                    err: errorHandler(err)
                                })
                            }
                            tags = t
                            res.json({ catagories, tags, blogs, size: blogs.length })
                        })
                })
        })
}

exports.remove = (req, res) => {
    const slug = req.params.slug.toLowerCase()
    Blog.findOneAndRemove({ slug }).exec((err, data) => {
        if (err) {
            return res.status(400).json({
                err: errorHandler(err)
            })
        }
        res.json({
            message: 'Blog deleted successfully'
        })
    })
}
exports.photo = (req, res) => {
    const slug = req.params.slug.toLowerCase()
    Blog.findOne({ slug })
        .select('photo')
        .exec((err, blog) => {
            if (err) {
                return res.status(400).json({
                    err: errorHandler(err)
                })
            }
            res.set('Content-Type', blog.photo.contentType)
            return res.send(blog.photo.data)
        })
}
exports.read = (req, res) => {
    const slug = req.params.slug.toLowerCase()
    Blog.findOne({ slug })
        .populate('catagories', '_id name slug')
        .populate('tags', '_id name slug')
        .populate('postedBy', '_id name username profile')
        .select('_id title photo slug mtitle mdesc body catagories tags postedBy createdAt updatedAt')
        .exec((err, data) => {
            if (err) {
                return res.status(400).json({
                    err: errorHandler(err)
                })
            }
            res.json({ blog: data })
        })

}

exports.update = (req, res) => {
    const slug = req.params.slug.toLowerCase()
    Blog.findOne({ slug }).exec((err, oldBlog) => {
        if (err) {
            return res.status(400).json({
                err: errorHandler(err)
            })
        }

        let form = new formidable.IncomingForm()
        form.keepExtensions = true;
        form.parse((req), (err, fields, files) => {

            if (err) {
                return res.status(400).json({
                    err: "Image could not upload"
                })
            }

            const { body, catagories, tags, title } = fields
            // console.log(body, catagories, tags, title)
            oldBlog = _.merge(oldBlog, fields)


            if (title == '') {
                return res.status(400).json({
                    err: 'Title is required'
                })
            }
            if (body == '' || body && body.length < 200) {
                return res.status(400).json({
                    err: 'Content is too short'
                })
            }
            if (catagories == []) {

                return res.status(400).json({
                    err: 'Atleast one catagory is required'
                })
            }
            if (tags == []) {

                return res.status(400).json({
                    err: 'Atleast one tag is required'
                })
            }


            if (body) {
                oldBlog.excerpt = smartTrim(body, 180, ' ', ' ...')
                oldBlog.mdesc = stripHtml(body.substring(0, 160))
            }

            if (catagories) {
                oldBlog.catagories = catagories.split(',')
            }
            if (tags) {
                oldBlog.tags = tags.split(',')
            }

            if (files.photo) {
                if (files.photo.size > 10000000) {
                    return res.status(400).json({
                        err: "Image should be less than 1mb. "
                    })
                }
                oldBlog.photo.data = fs.readFileSync(files.photo.path)
                oldBlog.photo.contentType = files.photo.type
            }
            oldBlog.save((err, response) => {
                if (err) {
                    return res.status(400).json({
                        err: errorHandler(err)
                    })
                }
                res.json({ response })
            })
        }
        )
    }
    )
}
exports.listRelated = (req, res) => {
    const limit = req.body.limit ? parseInt(req.body.limit) : 3
    const { _id, catagories } = req.body.relate
    Blog.find({ _id: { $ne: _id }, catagories: { $in: catagories } })
        .limit(limit)
        .populate('postedBy', '_id name profile username')
        .select('title slug postedBy photo excerpt createdAt updatedAt')
        .exec((err, data) => {
            if (err) {
                return res.status(400).json({
                    err: 'Blogs not found'
                })
            }
            return res.json({
                blogs: data
            })
        })
}

exports.listSearch = (req, res) => {
    const { search } = req.query
    if (search) {
        Blog.find({
            $or: [{ title: { $regex: search, $options: 'i' } }, { body: { $regex: search, $options: 'i' } }]
        }, (err, blogs) => {
            if (err) {
                return res.status(400).json({
                    err: errorHandler(err)
                })
            }
            else {

                return res.json({ blogs })
            }
        }).select('-photo -body')
    }

}
exports.listByUser = (req, res) => {
    User.findOne({ username: req.params.username })
        .exec((err, data) => {
            if (err) {
                return res.status(400).json({
                    err: errorHandler(err)
                })
            }
            let userId = data._id
            Blog.find({ postedBy: userId })
                .populate('catagories', '_id name slug')
                .populate('tags', '_id name slug')
                .populate('postedBy', '_id name username')
                .select('title slug postedBy createdAt updatedAt')
                .exec((err, data) => {
                    if (err) {
                        return res.status(400).json({
                            err: errorHandler(err)
                        })
                    }
                    res.json({
                        blogs: data
                    })
                })

        })
}