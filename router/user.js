const express = require('express')
const route = express.Router();
const { requireSignin, authMiddleware } = require('../controllers/auth');
const { read, publicProfile, photo, update } = require('../controllers/user');

route.get('/profile', requireSignin, authMiddleware, read)
route.get('/user/:username', publicProfile)
route.get('/user/photo/:username', photo)
route.put('/user/update', requireSignin, authMiddleware, update)

module.exports = route;