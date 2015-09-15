'use strict';

var express = require('express'),
	bodyParser = require('body-parser'),
	passport = require('passport'),
	router = require('./routes/index'),
	cors = require('./middlewares/cors'),
	utils = require('./helpers/utils'),
	morgan = require('morgan');

var app = express();

//enable cross-origin resource sharing
app.use(cors.enableCors);

//setup request logging in dev format
app.use(morgan('dev'));

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({
	extended: false
}));


app.use(passport.initialize());

require('./middlewares/authentication/authstrategy');

//Wire up authentication
app.use('/api/v1', utils.unless(
	[{
		url: '/users',
		methods: ['POST']
	}, {
		url: '/oauth/token',
		methods: ['POST']
	}, {
		url: '/loopback',
		methods: ['GET']
	}],  passport.authenticate('bearer', { session: false })));

//Wire up routing
app.use('/api/v1', router);

module.exports = app;