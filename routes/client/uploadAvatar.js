// Dependencies
var config = reqlib("/config");
var express = require('express');
var router = express.Router();

/* GET history page. */
router.get('/', function(req, res, next) {
  var data = { key: "", email: "", name: "", photo: "" };
  if(req.session.user){
    data = {
      key: req.session.user._id,
      email: req.session.user.email,
      name: req.session.user.name,
      photo: req.session.user.photo
    };
  }
  res.render('client/upload', {
    title: 'Upload',
    data: data,
    token: res.locals.token(req)
  });
}); // router end

module.exports = router;
