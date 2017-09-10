'use strict';
var namespace = "/routes/client/user/login.js";

//include libraries
var _ = require("underscore");
var ip = require('ip');
var config = reqlib('/config/');

// Mongoose Models
var Clients = reqlib('/models/clients');
var router = require('express').Router();

router.post('/', async function(req, res, next) {
	try{
	    var errors = {};

	    var username = req.body.username, password = req.body.password;
	    if(typeof username !== "string" || !username){
	        errors["username"] = "invalid_username";
	    }
	    if(typeof password !== "string" || !password){
	        errors["password"] = "invalid_password";
	    }

	    if(!_.isEmpty(errors)){
	        return services.sendError(errors, res);
	    }

        let client = await Clients.findOne({
            username: username
        }).exec();

        if (client) {
            password = (client.id + password);
            if (client.checkPassword(password)) {
	            req.session.user = client;
	            return services.sendSuccess("reload", res);
            } else {
                return services.sendError({
                    password: "invalid_password"
                }, res);
            }
        } else {
            return services.sendError("not_found_user", res);
        }
    }catch(e){
    	logger.error(e);
    	return services.sendError("server_error", res);
    }
});

module.exports = router;