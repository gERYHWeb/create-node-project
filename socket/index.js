'use strict';
var config = reqlib('/config');
let Clients = reqlib('/models/clients');

function IOMethods(){
	var self = this;
	var user = this.user = null;
	var io = this.io = null;
	var socket = this.socket = null;
	var type = this.type = null;

	this.sendError = function(data, type){
		this.emit({
			error: data
		}, type);
	};

	this.sendSuccess = function(data, type){
		this.emit({
			msg: data
		}, type);
	};

	this.sendErrorAll = function(data, type){
		this.emitAll({
			error: data
		}, type);
	};

	this.sendSuccessAll = function(data, type){
		this.emitAll({
			msg: data
		}, type);
	};

	this.emit = function(data, type){
		this.io.to(self.user).emit(type, data);
	};

	this.emitAll = function(data, type){
		this.io.emit(type, data);
	};
	
	this.jsonParse = function(data){
		try{
			data = JSON.parse(data);
			data.returnData = {};
			data.fs = self;
			return data;
		}catch(e){
			if(typeof data === "object"){
				data.returnData = {};
				data.fs = self;
				return data;
			}else{
				return {
					returnData: {},
					fs: self
				};
			}
		}
	};
}



module.exports = function(server) {
	var io = require('socket.io').listen(server);

	io.on('connection', function(socket) {
		let sendStats = function(){
			let d = {};
			d.online = Object.keys(io.sockets.sockets).length;
			io.emit('viewAll', d);
		};

		var methods = new IOMethods();
		methods.io = io;
		methods.socket = socket;
		methods.user = socket.id;

		socket.on('connection', function(data, cb){
			cb && cb();
		});

		socket.on('disconnect', sendStats);

	});

	return io;
};