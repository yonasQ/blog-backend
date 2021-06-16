const express = require('express')
const route = express.Router()
const { runValidation } = require('../validators')
const { contactFormValidator } = require('../validators/form')
const { contactForm, contactBlogAuthorForm } = require('../controllers/form')

route.post('/contact', contactFormValidator, runValidation, contactForm)
route.post('/contact-blog-author', contactFormValidator, runValidation, contactBlogAuthorForm)


module.exports = route