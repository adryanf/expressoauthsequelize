'use strict';

var bcrypt = require('bcrypt-nodejs');

module.exports = function(sequelize, DataTypes) {

	var User = sequelize.define("User", {
		Email: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true,
			validate: {
				isEmail: true,
				notEmpty: true,
			}
		},

		Password: {
			type: DataTypes.VIRTUAL,
			set: function(val) {
				this.setDataValue('Password', val);

				var salt = bcrypt.genSaltSync(10);
				var hash = bcrypt.hashSync(val, salt);

				this.setDataValue('PasswordHash', hash);
			},
			validate: {
				notEmpty: true,
				isLongEnough: function(val) {
					if (val.length < 6) {
						throw new Error("Please choose a longer password")
					}
				}
			}
		},

		PasswordHash: {
			type: DataTypes.STRING,
			allowNull: false
		}
	}, {
		instanceMethods: {
			verifyPassword: function(password) {
				return bcrypt.compareSync(password, this.PasswordHash);
			}
		}
	});

	return User;
};