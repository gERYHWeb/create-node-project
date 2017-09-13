'use strict';
var crypto = require('crypto');
var random = new (reqlib('/middleware/random'))();
var util = require('util');

var mongoose = reqlib('/lib/mongoose'),
	autoIncrement = require('mongoose-auto-increment'),
	Schema = mongoose.Schema;

var schema = new Schema({
	name: {
		type: String,
		unique: true,
		required: true
	},
	password: {
		type: String,
		required: true
	},
	token: {
		type: String,
		default: ''
	},
	ip: {
		type: String,
		default: 0
	},
	email: {
		type: String,
		default: ''
	},
	isBanned: {
		type: Boolean,
		default: 0
	},
	created: {
		type: Date,
		default: Date.now
	},
	role: {
		type: String,
		default: "user"
	}
});

schema.statics.statEncryptPassword = function(password) {
	password = password.toString();
	return crypto.createHmac('sha1', password).digest('hex');
};

schema.methods.encryptPassword = function(password) {
	return crypto.createHmac('sha1', password).digest('hex');
};

schema.methods.checkPassword = function(password) {
	console.log(this.encryptPassword(password));
	return this.encryptPassword(password) === this.password;
};

schema.plugin(autoIncrement.plugin, { model: 'Users', field: 'id' });
module.exports = mongoose.model('Users', schema);