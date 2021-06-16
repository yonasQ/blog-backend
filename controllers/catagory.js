const Catagory = require('../model/catagory')
const Blog = require('../model/blog')
const slugify = require('slugify')
const { errorHandler } = require('../helpers/dbErrorHandler')
exports.create = (req, res) => {
    const { name } = req.body
    const slug = slugify(name).toLowerCase()
    let catagory = new Catagory({ name, slug })
    catagory.save((err, data) => {
        if (err) {
            return res.status(400).json({
                err: errorHandler(err)
            })
        }
        res.json(data)
    })
}
exports.list = (req, res) => {
    Catagory.find({}).exec((err, data) => {
        if (err) {
            return res.status(400).json({
                err: errorHandler(err)
            })
        }
        res.json({ catagories: data })
    })
}
exports.read = (req, res) => {
    const slug = req.params.slug.toLowerCase()
    Catagory.findOne({ slug }).exec((err, data) => {
        if (err) {
            return res.status(400).json({
                err: errorHandler(err)
            })
        }
        Blog.find({ catagories: data })
            .populate('catagories', '_id name slug')
            .populate('tags', '_id name slug')
            .populate('postedBy', '_id profile username')
            .select('_id photo slug title excerpt catagories tags createdAt updatedAt postedBy')
            .exec((err, blog) => {
                if (err) {
                    return res.status(400).json({
                        err: errorHandler(err)
                    })
                }
                else {
                    return res.json({
                        catagory: data,
                        blogs: blog
                    })
                }
            })
    })
}
exports.remove = (req, res) => {
    const slug = req.params.slug.toLowerCase()
    Catagory.findOneAndRemove({ slug }).exec((err, data) => {
        if (err) {
            return res.status(400).json({
                err: errorHandler(err)
            })
        }
        res.json({
            message: 'catagory deleted successfully'
        })
    })
}
