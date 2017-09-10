'use strict';
var namespace = "/routes/client/user/register.js";

//include libraries
var _ = require("underscore");
var ip = require('ip');
var config = reqlib('/config/');
var services = reqlib("/lib/services");

// Mongoose Models
var Clients = reqlib('/models/clients');
var router = require('express').Router();

router.post('/', async function(req, res, next) {
    try {
        let username = req.body.username,
            password = req.body.password,
            email = req.body.email,
            phone = req.body.phone;

        let errors = {}, error;

        error = services.validation.username(username);
        if (error) {
            errors["username"] = error;
        }

        error = services.validation.password(password);
        if (error) {
            errors["password"] = error;
        }

        error = services.validation.email(email);
        if (error) {
            errors["email"] = error;
        }

        if (typeof phone === "string" && phone) {
            error = services.validation.phone(phone);
            if (error) {
                errors["phone"] = error;
            }
        }

        if (!_.isEmpty(errors)) {
            services.sendError(errors, res);
            return;
        }

        let user = await Clients.findOne({
            username: username
        }).exec();

        if (user !== null) {
            return services.sendError({
                "username": "user_already_exists!"
            }, res);
        }else{
            user = await Clients.findOne({
                email: email
            }).exec();

            if (user !== null) {
                return services.sendError({
                    "email": "email_already_exists"
                }, res);
            }else{
                let insert = {
                    username: username,
                    phone: phone,
                    email: email,
                    ip: ip.address()
                };
                let ref = req.session.ref;
                if(ref){
                    ref = await Clients.findOne({
                        refLink: ref
                    }).exec();
                    if(ref){
                        insert.refParent = ref._id;
                    }else ref = null;
                }
                user = await Clients.findOne().sort({id: -1}).exec();
                if(user){
                    insert.id = user.id + 1;
                }else{
                    insert.id = 1;
                }
                insert.password = Clients.statEncryptPassword(insert.id + password);
                user = await Clients.create(insert);
                if(user){
                      createLog({
                          user: user._id,
                          action: "register"
                      });
                    if(ref){
                        let refUsers = [];
                        if("refUsers" in ref){
                            refUsers = ref.refUsers;
                        }
                        refUsers.push(user._id);
                        ref.refUsers = refUsers;
                        await ref.save();
                        delete req.session.ref;
                    }
                    req.session.user = user;
                    services.sendSuccess("reload", res);
                }
            }
        }
    }catch(e){
        logger.error(e);
        return services.sendError("server_error", res);
    }
});

module.exports = router;