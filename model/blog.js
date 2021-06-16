const mongoose = require('mongoose')
const { ObjectId } = mongoose.Schema
const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        min: 3,
        max: 160,
        require: true,
        unique: true
    },
    slug: {
        type: String,
        index: true
    },
    body: {
        type: {},
        min: 200,
        max: 2000000,
        required: true
    },
    excerpt: {
        type: String,
        max: 1000,
    },
    mtitle: {
        type: String,
    },
    mdesc: {
        type: String,
    },
    photo: {
        data: Buffer,
        contentType: String
    },
    catagories: [
        {
            type: ObjectId, ref: 'Catagory', required: true
        }
    ],
    tags: [
        {
            type: ObjectId, ref: 'Tag', required: true
        }
    ],
    postedBy: {
        type: ObjectId,
        ref: 'User'
    }
},
    { timestamps: true }
)

module.exports = mongoose.model('Blog', blogSchema);