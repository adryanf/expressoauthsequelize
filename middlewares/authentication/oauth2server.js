'use strict'

var oauth2orize = require('oauth2orize'),
    passport = require('passport'),
    crypto = require('crypto'),
    models = require('../../models'),
    step = require('step'),
    config = require(__dirname + '/../../config/config.json')["security"];


// create OAuth 2.0 server
var server = oauth2orize.createServer();

// Exchange username & password for an access token.
server.exchange(oauth2orize.exchange.password(function(client, username, password, scope, done) {

    step(
        function primePumpStep() {

            this.now = new Date();
            this.client = client;
            this.foundUser = undefined;
            this.doneCallback = done;
            this.accessToken = undefined;
            this.current = this;
            this();
        },
        function() {

            models.User.findOne({
                    where: {
                        Email: username
                    }
                })
                .catch(function(err) {

                    if (err) {
                        return this.doneCallback(err);
                    }
                }).then(this);
        },
        function(user) {

            if (!user) {
                return this.doneCallback(null, false);
            }
            if (!user.verifyPassword(password)) {
                return this.doneCallback(null, false);
            }

            this.foundUser = user;

            models.AccessToken.findOne({
                where: {
                    UserId: user.id
                }
            }).catch(function(err) {
                if (err) {

                    return this.doneCallback(err);
                }
            }).then(this);
        },

        function(accessToken) {

            if (accessToken) {


                this.accessToken = accessToken;


                models.RefreshToken.findOne({
                    where: {
                        UserId: this.foundUser.id
                    }
                }).catch(function(err) {

                    if (err) {
                        return this.doneCallback(err);
                    }
                }).then(this);
            } else {
                return issueNewTokens.call(this.current);
            }
        },

        function(refreshToken) {

            if (refreshToken !== null) {

                if (this.accessToken) {
                    if (!this.accessToken.isExpired(this.now)) {

                        var expiresIn = (this.accessToken.Expires - this.now) / 1000;

                        return this.doneCallback(null, this.accessToken.Token, refreshToken.Token, {
                            'expires_in': expiresIn
                        });

                    }
                }

            }

            removeTokens.call(this.current, function() {

                return issueNewTokens.call(this);

            });
        });

}));

var removeTokens = function(next) {

    var current = this;
    step(
        function() {

            models.RefreshToken.destroy({
                    where: {
                        UserId: current.foundUser.id,
                        ClientId: current.client.ClientId
                    }
                }).catch(function(err) {
                    if (err) return current.doneCallback(err);
                })
                .then(this);
        },
        function() {

            models.AccessToken.destroy({
                    where: {
                        UserId: current.foundUser.id,
                        ClientId: current.client.ClientId
                    }
                })
                .catch(function(err) {
                    if (err) return current.doneCallback(err);
                }).then(next.call(current));
        }
    );
};

var issueNewTokens = function() {

    var current = this;
    step(
        function() {
            this.tokenValue = crypto.randomBytes(32).toString('hex');
            this.refreshTokenValue = crypto.randomBytes(32).toString('hex');
            this.tokenLifeTime = config["tokenLifeTime"];
            this.expires = current.now.setSeconds(current.now.getSeconds() + config["tokenLifeTime"]);
            this();
        },
        function() {
            models.AccessToken.create({
                    Token: this.tokenValue,
                    Expires: this.expires,
                    ClientId: current.client.ClientId,
                    UserId: current.foundUser.id
                })
                .catch(function(err) {
                    if (err) {
                        return current.doneCallback(err);
                    }
                })
                .then(this);
        },
        function() {
            models.RefreshToken.create({
                    Token: this.refreshTokenValue,
                    Expires: this.expires,
                    ClientId: current.client.ClientId,
                    UserId: current.foundUser.id
                }).catch(function(err) {
                    if (err) {
                        return current.doneCallback(err);
                    }
                })
                .then(this);
        },
        function() {

            var info = {
                scope: '*'
            }
            current.doneCallback(null, this.tokenValue, this.refreshTokenValue, {
                'expires_in': this.tokenLifeTime
            });

        }
    );
};

// Exchange refreshToken for an access token.
server.exchange(oauth2orize.exchange.refreshToken(function(client, refreshToken, scope, done) {


    step(
        function primePumpStep() {
            this.now = new Date();
            this.client = client;
            this.foundUser = undefined;
            this.doneCallback = done;
            this.current = this;
            this();
        },
        function() {

            models.RefreshToken.findOne({
                    where: {
                        Token: refreshToken
                    }
                })
                .then(this).catch(function(err) {
                    if (err) {
                        return this.doneCallback(err);
                    }
                });
        },

        function(token) {

            if (!token) {
                return this.doneCallback(null, false);
            }


            models.User.findById(token.UserId)
                .then(this).catch(function(err) {
                    if (err) {
                        return this.doneCallback(err);
                    }
                });
        },

        function(user) {

            if (!user) {
                return this.doneCallback(null, false);
            }

            this.foundUser = user;

            removeTokens.call(this.current, function() {
                return issueNewTokens.call(this);
            });
        });


}));

// token endpoint
exports.token = [
    passport.authenticate(['oauth2-client-password'], {
        session: false
    }),
    server.token(),
    server.errorHandler()
]