'use strict';
var Users = reqlib('/models/users');
var crypto = require('crypto');
var config = reqlib('/config/');
var ip = require('ip');

var createToken = function() {
    return crypto.randomBytes(16).toString('hex');
};

module.exports = async function(req, res, next) {
    res.locals.token = null;
    res.locals.user = null;
    try {
        if(!req.headers.accept) {
            return next();
        }
        if (!(req.headers.accept).match(/text\/html/) ||
            req.headers.accept === undefined || !("user" in req.session))
            return next();

        var token = await createToken();
        req.session.user.token = token;
        var user = req.session.user;

        let client = await Users.findOne({
            _id: user._id
        }).exec();

        user = req.session.user = client;
        res.locals.token = token;
        res.locals.user = user;

        await Users.findOneAndUpdate({
            _id: user._id
        }, {
            token: token,
            ip: ip.address()
        }, { upsert: false });
    }catch(e){
        logger.error(e);
    }
    return next();
};