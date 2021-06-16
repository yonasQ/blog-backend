const express = require('express')
const route = express.Router()
const { runValidation } = require('../validators')
const { createCatagoryValidator } = require('../validators/catagory')
const { requireSignin, adminMiddleware } = require('../controllers/auth');
const { create, list, read, remove } = require('../controllers/catagory')

route.post('/catagory', createCatagoryValidator, runValidation, requireSignin, adminMiddleware, create)
route.get('/catagories', list)
route.get('/catagory/:slug', read)
route.delete('/catagory/:slug', requireSignin, adminMiddleware, remove)

module.exports = route