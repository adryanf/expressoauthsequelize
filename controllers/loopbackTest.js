'use strict';

exports.loopback = function(req, res) {
	res.json({
		message: 'Exposed response from the API'
	});

};

exports.authenticatedLoopback = function(req, res) {

	res.json({
		message: 'Protected response from the API'
	});

};