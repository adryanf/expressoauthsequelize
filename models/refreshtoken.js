'use strict';

module.exports = function(sequelize, DataTypes) {

	var RefreshToken = sequelize.define("RefreshToken", {
		Token : {
			type: DataTypes.STRING,
			unique: true,
			primaryKey: true
		},
		Expires: {
			type: DataTypes.DATE,
			allowNull: false
		},
		ClientId:{
			type: DataTypes.STRING,
			allowNull: false
		}
	}, {
		classMethods: {
			associate: function(models) {
				RefreshToken.belongsTo(models.User, {
					onDelete: "CASCADE",
					foreignKey: {
						allowNull: false
					}
				});
			}
		}
	});

	return RefreshToken;
};