// ROUTES
var config = reqlib("/config");
var express = require('express');
var router = express.Router();

// MODELS
let Users = reqlib('/models/users');

router.get('/', async function(req, res, next){
    try{
    	res.render('admin/index', {
	        title: 'Главная | ADMINPANEL',
	        data: {}
	    });
    }catch(e){
    	logger.error(e);
    	return next();
    }
});

module.exports = router;