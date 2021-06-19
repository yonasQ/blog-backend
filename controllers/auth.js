const User = require('../model/user')
const Blog = require('../model/blog')
const shortid = require('shortid')
const jwt = require('jsonwebtoken');
const expressJ = require('express-jwt');
const { errorHandler } = require('../helpers/dbErrorHandler')
const _ = require('lodash')
const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

exports.preSignup = (req, res) => {
    const { name, email, password } = req.body
     User.findOne({ email: req.body.email }).exec((err, user) => {
        if (user) {
            return res.status(400).json({ err: "Email already been taken" })
        }
        const token = jwt.sign({ name, email, password }, process.env.JWT_ACCOUNT_ACTIVATION_SECRET, { expiresIn: '10m' });
        const emailData = {
            to: email,
            from: process.env.EMAIL_FROM,
            subject: `Account activation link - ${process.env.APP_NAME}`,
            html: `    
      <p>Please use the following link to activate your account. </p>
      <a href="${process.env.CLIENT_URL}/auth/account/activate/${token}">Activate</a>
      <hr/>
      <p>This email may contain sensetive information:</p>
      <p>${process.env.CLIENT_URL}</p>
      `
        }

        sgMail.send(emailData)
            .then(() => {
                return res.json({
                    message: `Account activation link has been sent to ${email}. Link expires in 10min. `
                })
            });
    })
}


exports.signup = (req, res) => {
    const { activationLink } = req.body
    if (activationLink) {
        jwt.verify(activationLink, process.env.JWT_ACCOUNT_ACTIVATION_SECRET, function (err, decoded) {
            if (err) {
                return res.status(401).json({
                    err: 'Expired link. Signup again. '
                })
            }
            const { name, email, password } = jwt.decode(activationLink)
            let username = shortid.generate();
            let profile = `${process.env.CLIENT_URL}/profile/${username}`;
            const newUser = new User({ name, email, username, password, profile })
            newUser.save((err, success) => {
                if (err) {
                    return res.status(400).json({
                        err: errorHandler(err)
                    })
                }
                res.status(200).json({
                    message: "You have successfully activated your account. Please signin."
                })
            })
        })
    }else{
        return res.status(400).json({
            err: "Something went wrong. Try again."
        })
    }
}
exports.signin = (req, res) => {
    const { email, password } = req.body
    User.findOne({ email }).exec((err, user) => {
        if (err || !user) {
            return res.status(400).json({
                err: "Username with this email does not exist. "
            });
        }
        if (!user.authentication(password)) {
            return res.status(400).json({
                err: "Username or password is incorrect"
            })
        }
        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: '6h' });
        res.cookie('token', token, { expiresIn: '6h' })
        const { _id, username, name, email, role } = user
        return res.json({
            token: token,
            user: { _id, username, name, email, role }
        })
    })
}

exports.signout = (req, res) => {
    res.clearCookie('token')
    return res.json({
        msg: "Signout success!"
    });
}

exports.requireSignin = expressJ({
    secret: process.env.JWT_SECRET,
    algorithms: ['HS256']
});

exports.authMiddleware = (req, res, next) => {
    const authUserId = req.user._id;
    User.findById({ _id: authUserId }).exec((err, user) => {
        if (err || !user) {
            return res.status(400).json({
                err: "User not found"
            })
        }
        req.profile = user
        next();
    })
}
exports.adminMiddleware = (req, res, next) => {
    const adminUserId = req.user._id;
    User.findById({ _id: adminUserId }).exec((err, user) => {
        if (err || !user) {
            return res.status(400).json({
                err: "User not found"
            })
        }
        if (user.role != 1) {
            return res.status(400).json({
                err: "Admin resource. Access denied."
            })
        }
        req.profile = user
        next();
    })
}
exports.canUpdateDeleteblog = (req, res, next) => {
    const slug = req.params.slug.toLowerCase()
    Blog.findOne({ slug: slug })
        .exec((err, data) => {
            if (err) {
                return res.status(400).json({
                    err: "Blog not found."
                })
            }

            let authorized = data.postedBy.toString() == req.profile._id.toString()
            if (!authorized) {
                return res.status(400).json({
                    err: "You are not authorized."
                })
            }
            next()
        })

}
exports.forgotPassword = ((req, res) => {
    const { email } = req.body
    User.findOne({ email: email }).exec((err, user) => {
        if (err || !user) {
            return res.status(400).json({
                err: "Username with this email does not exist. "
            });
        }

        const token = jwt.sign({ _id: user._id }, process.env.JWT_RESET_SECRET, { expiresIn: '10m' });

        const emailData = {
            to: email,
            from: process.env.EMAIL_FROM,
            subject: `Password reset link - ${process.env.APP_NAME}`,
            html: `    
      <p>Please use the following link to reset your password. </p>
      <p>${process.env.CLIENT_URL}/auth/password/reset/${token}</p>
      <hr/>
      <p>This email may contain sensetive information:</p>
      <p>${process.env.CLIENT_URL}</p>
      `
        }
        return user.updateOne({ resetPasswordLink: token },
            (err, data) => {
                if (err) {
                    return res.status(400).json({
                        err: errorHandler(err)
                    })
                }
                else {
                    sgMail.send(emailData)
                        .then(() => {
                            return res.json({
                                message: `Reset password link has been sent to ${email}. Link expires in 10min. `
                            })
                        });
                }
            })
    })
})
exports.resetPassword = (req, res) => {
    const { resetPasswordLink, newPassword } = req.body
    if (resetPasswordLink) {
        jwt.verify(resetPasswordLink, process.env.JWT_RESET_SECRET, function (err, decoded) {
            if (err) {
                return res.status(401).json({
                    err: 'Expired link. Try again. '
                })
            }
            User.findOne({ resetPasswordLink }, (err, user) => {
                if (err || !user) {
                    return res.status(401).json({
                        err: err
                    })
                }
                const updatedFields = {
                    resetPasswordLink: '',
                    password: newPassword
                }
                user = _.extend(user, updatedFields)
                user.save((err, result) => {
                    if (err) {
                        return res.status(400).json({
                            err: errorHandler(err)
                        })
                    }
                    return res.json({
                        message: 'Password reseted successfully. '
                    })
                })
            })
        })
    }
    else {
        return "fgvbg"
    }
}