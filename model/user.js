const mongoose = require('mongoose')
const crypto = require('crypto')

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true,
        max: 32,
        unique: true,
        index: true
    },
    name: {
        type: String,
        required: true,
        trim: true,
        max: 32,
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        lowercase: true
    },
    profile: {
        type: String,
        required: true,
    },
    hashed_password: {
        type: String,
        required: true,
    },
    salt: String,
    about: {
        type: String,
    },
    role: {
        type: Number,
        default: 0
    },
    photo: {
        data: Buffer,
        contentType: String
    },
    resetPasswordLink: {
        data: String,
        default: ''
    }
},
    { timestamps: true }
)
userSchema
    .virtual('password')
    .set(function (password) {
        this._password = password;
        this.salt = this.makeSalt();
        this.hashed_password = this.encryptedPassword(password)
    })
    .get(function () {
        return this._password;
    })
userSchema.methods = {
    authentication: function (plainPassword) {
        return this.encryptedPassword(plainPassword) === this.hashed_password;
    },
    encryptedPassword: function (password) {
        if (!password) return ''
        try {
            return crypto
                .createHmac('sha1', this.salt)
                .update(password)
                .digest('hex')
        } catch (err) {
            console.log('problem with hashing the password')
        }
    },
    makeSalt: function () {
        return Math.round(new Date().valueOf() * Math.random()) + '';
    }
}




module.exports = mongoose.model('User', userSchema);