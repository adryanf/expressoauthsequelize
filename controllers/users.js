'use strict';

var models = require("../models"),
	sequelize = require('sequelize');

exports.createUser = function(req, res) {
	var userJson = req.body;

	models.User.create(userJson)
		.then(function() {
			res.json({
				message: 'user created'
			});
		})
		.catch(sequelize.ValidationError, function (err) {
            // respond with validation errors
            return res.status(422).send(err.errors);
        })
		.catch(function(err) {
			res.status(500).json({
				message: err.message
			});
		});
};