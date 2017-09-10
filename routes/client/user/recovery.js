'use strict';
var namespace = "/routes/client/user/recovery.js";

//include libraries
var _ = require("underscore");
var ip = require('ip');
var config = reqlib('/config/');
var mailer = reqlib("/middleware/mailer");
var random = new (reqlib('/middleware/random'))();

// Mongoose Models
var Clients = reqlib('/models/clients');
var router = require('express').Router();

router.post('/', async function(req, res, next) {
    try {
	    let email = req.body.email;

        let error = services.validation.email(email);
        if (error) {
            return services.sendError(error, res);
        }

        let client = await Clients.findOne({
            email: email
        });

        if(client){
            let newPassword = await random.randomString(9, 10);
            let password = await Clients.statEncryptPassword(client.id + newPassword);
            client = await Clients.findOneAndUpdate({
                email: email
            },{
                password: password
            }).exec();
            await mailer("recovery", {
	            from: 'service@cash-roulete.com',
	            to: email,
	            subject: 'Восстановление пароля | Cash-roulete.com',
	            htmlData: {
                    username: client.username,
	            	password: newPassword
	            }
	        });
            createLog({
                user: client._id,
                action: "recovery"
            });
            return services.sendSuccess("success_recovery", res);
        }else{
            return services.sendError("not_found_email", res);
        }
    }catch(e){
        logger.error(e);
        return services.sendError("server_error", res);
    }
});

module.exports = router;