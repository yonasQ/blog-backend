const Tag = require('../model/tag')
const Blog = require('../model/blog')
const slugify = require('slugify')
const { errorHandler } = require('../helpers/dbErrorHandler')
exports.create = (req, res) => {
    const { name } = req.body
    const slug = slugify(name).toLowerCase()
    let tag = new Tag({ name, slug })
    tag.save((err, data) => {
        if (err) {
            return res.status(400).json({
                err: errorHandler(err)
            })
        }
        res.json(data)
    })
}
exports.list = (req, res) => {
    Tag.find({}).exec((err, data) => {
        if (err) {
            return res.status(400).json({
                err: errorHandler(err)
            })
        }
        res.json({ tags: data })
    })
}
exports.read = (req, res) => {
    const slug = req.params.slug.toLowerCase()
    Tag.findOne({ slug }).exec((err, data) => {
        if (err) {
            return res.status(400).json({
                err: errorHandler(err)
            })
        }
        Blog.find({ tags: data })
            .populate('catagories', '_id name slug')
            .populate('tags', '_id name slug')
            .populate('postedBy', '_id username profile')
            .select('_id photo slug title excerpt catagories tags createdAt updatedAt postedBy')
            .exec((err, blog) => {
                if (err) {
                    return res.status(400).json({
                        err: errorHandler(err)
                    })
                }
                else {
                    return res.json({
                        tag: data,
                        blogs: blog
                    })
                }
            })
    })
}
exports.remove = (req, res) => {
    const slug = req.params.slug.toLowerCase()
    Tag.findOneAndRemove({ slug }).exec((err, data) => {
        if (err) {
            return res.status(400).json({
                err: errorHandler(err)
            })
        }
        res.json({
            message: 'tag deleted successfully'
        })
    })
}
