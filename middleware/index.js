'use strict';
var crypto = require('crypto');
var _ = require('underscore');
var moment = require('moment');
var config = reqlib('/config/');
var services = reqlib('/lib/services');
var Users = reqlib('/models/users');

module.exports = async function(req, res, next) {
    try {
        var getObject = {
            admin: false,
            crypto: crypto,
            moment: moment,
            _: _,
            get: {
                query: req.query,
                session: req.session,
                config: config,
                req: req,
                res: res,
                getToken: function (num) {
                    if (!num) num = 16;
                    return crypto.randomBytes(16).toString('hex');
                },
                getDate: function (date) {
                    return moment(date).format("DD.MM.YYYY hh:mm:ss");
                }
            }
        };

        for (let key in getObject) {
            res.locals[key] = getObject[key];
        }

    }catch(e){
        logger.error(e);
    }finally{
        next();
    }
};