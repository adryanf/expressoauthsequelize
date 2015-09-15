'use strict';

var _ = require('lodash');

//filters middleware requests through the pathsCollection
exports.unless = function(pathsCollection, middleware) {

	return function(req, res, next) {

		var unlessPath = _.find(pathsCollection, {
			'url': req.url
		});

		if (unlessPath) {
			if (_.isUndefined(unlessPath.methods) || _.isEmpty(unlessPath.methods))
				return next();

			var unlessMethod = _.find(unlessPath.methods, function(method) {
				return _.isEqual(method, req.method);
			});

			if (!_.isUndefined(unlessMethod)) {
				return next();
			}

		}
		return middleware(req, res, next);
	};
};