'use strict';

var express = require('express');

//get router object
var router = express.Router();

//authentication server
var oauth2server = require('../middlewares/authentication/oauth2server');

router.post('/oauth/token', oauth2server.token);

//loopback test controller
var loopbackTestController = require('../controllers/loopbackTest');

router.get('/loopback', loopbackTestController.loopback);
router.get('/authloopback', loopbackTestController.authenticatedLoopback);

//users controller
var usersController = require('../controllers/users');

router.post('/users', usersController.createUser);

module.exports = router;