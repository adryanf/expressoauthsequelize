'use strict'

var passport = require('passport'),
	ClientPasswordStrategy = require('passport-oauth2-client-password').Strategy,
	BearerStrategy = require('passport-http-bearer').Strategy,
	models = require("../../models");

passport.use(new ClientPasswordStrategy(
	function(clientId, clientSecret, done) {
		models.Client.findOne({
			where: {
				ClientId: clientId
			}
		}).then(function(client) {
			if (!client) {
				return done(null, false);
			}

			if (!client.verifySecret(clientSecret)) {
				return done(null, false);
			}

			return done(null, client);
		});
	}
));

passport.use(new BearerStrategy(
	function(accessToken, done) {

		var now = new Date();

		models.AccessToken.findOne({
			where: {
				Token: accessToken
			}
		}).then(function(token) {

			if (!token) {
				return done(null, false);
			}
			if (token.isExpired(now)) {

				token.destroy()
					.then(function() {
						return done(null, false, {
							message: 'Token expired'
						});
					}).catch(function(err) {
						if (err) return done(err);
					});
			}

			models.User.findById(token.UserId).then(function(user) {
				if (!user) {
					return done(null, false, {
						message: 'Unknown user'
					});
				}

				var info = {
					scope: '*'
				}
				done(null, user, info);
			}).catch(function() {
				if (err) {
					return done(err);
				}
			});
		}).catch(function(err) {
			if (err) {
				return done(err);
			}
		});
	}));