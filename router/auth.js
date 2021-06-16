const express = require('express')
const route = express.Router();
const { signup, signin, signout, forgotPassword, resetPassword, preSignup} = require('../controllers/auth')
const { runValidation } = require('../validators')
const { usersignupValidator, usersigninValidator, forgotPasswordValidator,resetPasswordValidator } = require('../validators/auth')


route.post('/pre-signup', usersignupValidator, runValidation, preSignup)
route.post('/signup', signup)
route.post('/signin', usersigninValidator, runValidation, signin)
route.put('/forgot-password', forgotPasswordValidator, runValidation, forgotPassword)
route.put('/reset-password', resetPasswordValidator, runValidation, resetPassword)
route.get('/signout', signout)


module.exports = route;