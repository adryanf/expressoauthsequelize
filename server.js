'use strict';

var app = require('./app');

var models = require("./models");

app.set('port', process.env.PORT || 3000);

//add {force: true} as a sync parameter to drop tables
models.sequelize.sync().then(function() {
	var server = app.listen(app.get('port'), function() {
		console.log('Express API listening on port %s', server.address().port);
	});
});