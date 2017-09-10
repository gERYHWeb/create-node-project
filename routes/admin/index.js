var router = require('express').Router();

// ROUTES
var index = reqlib('/routes/admin/main');
var users = reqlib('/routes/admin/users');

//CHECK ADMIN
router.use("/*", function(req, res, next){
    services.checkAdmin(req, res, next);
});

// ADMINPANEL
router.use('/', index);
router.use('/users', users);

module.exports = router;