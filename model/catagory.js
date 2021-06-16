const mongoose = require('mongoose')

const catagorySchema = new mongoose.Schema({

    name: {
        type: String,
        required: true,
        trim: true,
        max: 32,
    },
    slug: {
        type: String,
        unique: true,
        index: true,
    }
},
    { timestamps: true }
)


module.exports = mongoose.model('Catagory', catagorySchema);