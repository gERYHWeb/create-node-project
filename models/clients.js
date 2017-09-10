'use strict';
var crypto = require('crypto');
var random = new (reqlib('/middleware/random'))();
var util = require('util');

var mongoose = reqlib('/lib/mongoose'),
	autoIncrement = require('mongoose-auto-increment'),
	Schema = mongoose.Schema;

var schema = new Schema({
	authId: {
		type: Number,
		default: 0
	},
	username: {
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
	cash: {
		type: Number,
		default: 0
	},
	totalIn: {
		type: Number,
		default: 0
	},
	totalOut: {
		type: Number,
		default: 0
	},
	winRounds:{
		type: Number,
		default: 0
	},
	displayName: {
		type: String,
		default: ''
	},
	email: {
		type: String,
		default: ''
	},
	phone: {
		type: String,
		default: ''
	},
	photo: {
		type: String,
		default: '/images/default.jpg'
	},
	sn: {
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
		type: Number,
		default: 0
	},
	refLink: {
		type: String,
		default: ""
	},
	refUsers: {
		type: Array,
		default: []
	},
	refParent: {
		type: Schema.Types.ObjectId,
		ref: 'Clients'
	}
});

schema.statics.refferalLink = async function() {
	let refLink = await random.randomString(12, 15);
	try{
		let Clients = this.model('Clients');
		let findUser = await Clients.findOne({}).exists('refLink').exec();
		if (findUser) {
			async function recursion(refLink){
				try{
					let user = await Clients.findOne({
						refLink: refLink
					}).exec();
					if(user){
						refLink = await random.randomString(16, 18);
						recursion(refLink);
					}else return refLink;
				}catch(e){
					logger.error(e);
				}
			}
			refLink = await recursion(refLink);
		}
	}catch(e){
		logger.error(e);
	}
	return refLink;
};

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

schema.plugin(autoIncrement.plugin, { model: 'Clients', field: 'id' });
module.exports = mongoose.model('Clients', schema);