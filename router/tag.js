const express = require('express')
const route = express.Router()
const { runValidation } = require('../validators')
const { createTagValidator } = require('../validators/tag')
const { requireSignin, adminMiddleware } = require('../controllers/auth');
const { create, list, read, remove } = require('../controllers/tag')

route.post('/tag', createTagValidator, runValidation, requireSignin, adminMiddleware, create)
route.get('/tags', list)
route.get('/tag/:slug', read)
route.delete('/tag/:slug', requireSignin, adminMiddleware, remove)

module.exports = route