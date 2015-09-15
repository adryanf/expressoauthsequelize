'use strict';

var bcrypt = require('bcrypt-nodejs');

module.exports = function(sequelize, DataTypes) {

	var Client = sequelize.define("Client", {
		ClientId: {
			type: DataTypes.STRING,
			primaryKey: true
		},
		ClientSecret: {
			type: DataTypes.STRING,
			primaryKey: true,
			set: function(val) {

				var salt = bcrypt.genSaltSync(10);
				var hash = bcrypt.hashSync(val, salt);

				this.setDataValue('ClientSecret', hash);
			}
		}
	},
	{
		instanceMethods: {
			verifySecret: function(clientSecret) {
				return bcrypt.compareSync(clientSecret, this.ClientSecret);
			}
		}
	});

	return Client;
};