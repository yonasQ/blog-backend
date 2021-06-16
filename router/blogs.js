const express = require('express')
const route = express.Router();
const { create, list, blogsCatagoriesTags, read, remove, update, photo, listRelated, listSearch, listByUser } = require('../controllers/blog')
const { requireSignin, adminMiddleware, authMiddleware, canUpdateDeleteblog } = require('../controllers/auth')
route.post('/blog', requireSignin, adminMiddleware, create)
route.delete('/blog/:slug', requireSignin, adminMiddleware, remove)
route.put('/blog/:slug', requireSignin, adminMiddleware, update)
route.get('/blog', list)
route.post('/blogs-catagories-tags', blogsCatagoriesTags)
route.get('/blog/:slug', read)
route.get('/blog/photo/:slug', photo)
route.post('/blog/related', listRelated)
route.get('/blogs/search', listSearch)

//authenticated user
route.post('/user/blog', requireSignin, authMiddleware, create)
route.get('/:username/blog', listByUser)
route.delete('/user/blog/:slug', requireSignin, authMiddleware,canUpdateDeleteblog , remove)
route.put('/user/blog/:slug', requireSignin, authMiddleware, canUpdateDeleteblog, update)
module.exports = route;