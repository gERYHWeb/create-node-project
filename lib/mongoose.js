var mongoose = require('mongoose');
var autoIncrement = require('mongoose-auto-increment');
var config = reqlib('/config');

var connection = mongoose.connect(config.get('mongoose:uri'), config.get('mongoose:options'));
autoIncrement.initialize(connection);

module.exports = mongoose;
