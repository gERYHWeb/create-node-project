"use strict";

var express = require('express');
var router = express.Router();
var _ = require('underscore');
var striptags = require('striptags');
var mongoose = require('mongoose');

let Clients = reqlib('/models/clients');

/* GET users listing. */
router.get('/', async function(req, res, next) {
    if (!req.session.user) services.redirect(res, "/");
    try {
        // let user = parseInt((req.query.id) ? req.query.id : ((req.session.user) ? req.session.user.id : null));
        let user = parseInt((req.session.user) ? req.session.user.id : null);

        if (isNaN(user)) {
            return services.redirect(res, "/");
        }

        user = await Clients.findOne({
            id: user
        }).exec();

        if (!user) {
            return services.redirect(res, "/404");
        }

        if (req.query.cash) {
            return services.sendSuccess(user.cash, res);
        }

        res.render('client/profile', {
            title: "Профиль игрока - " + user.username,
            user: user
        });

    } catch (e) {
        logger.error(e);
        return services.redirect(res, "/404");
    }
});

router.post('/', async function(req, res) {
    if (!req.session.user) return services.sendError("forbidden", res);
    await reqlib('/middleware/user/profile')(req, res, null);
});

module.exports = router;