'use strict';

module.exports = function(sequelize, DataTypes) {

	var AccessToken = sequelize.define("AccessToken", {
		Token: {
			type: DataTypes.STRING,
			unique: true,
			primaryKey: true
		},
		Expires: {
			type: DataTypes.DATE,
			allowNull: false
		},
		ClientId: {
			type: DataTypes.STRING,
			allowNull: false
		}
	}, {
		classMethods: {
			associate: function(models) {
				AccessToken.belongsTo(models.User, {
					onDelete: "CASCADE",
					foreignKey: {
						allowNull: false
					}
				});
			}
		},
		instanceMethods: {
			isExpired: function(date) {
				return date > this.Expires;
			}
		}
	});

	return AccessToken;
};