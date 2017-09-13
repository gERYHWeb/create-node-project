// Dependencies
var config = reqlib("/config");
var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', async function(req, res, next) {
    res.render('client/index', {
        title: 'Home'
    });
});

module.exports = router;