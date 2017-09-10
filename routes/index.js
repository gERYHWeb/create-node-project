var router = require('express').Router();

// ROUTES
let index = reqlib('/routes/client/main');
let profile = reqlib('/routes/client/user/profile');
let login = reqlib('/routes/client/user/login');
let logout = reqlib('/routes/client/user/logout');
let register = reqlib('/routes/client/user/register');
let recovery = reqlib('/routes/client/user/recovery');
// let uploadAvatar = reqlib('/routes/client/uploadAvatar');

router.use(function(req, res, next){
    req.app.locals.admin = false;
    return next();
});

router.use('/', index);
router.use('/profile', profile);
router.use('/login', login);
router.use('/logout', logout);
router.use('/recovery', recovery);
router.use('/register', register);

router.use("/admin", reqlib('/routes/admin/index'));

module.exports = router;