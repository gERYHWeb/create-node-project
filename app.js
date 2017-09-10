'use strict';
if ('DEBUG_FD' in process.env) {
  require('debug-fd-deprecated');
}
// Global variables
global.reqlib = require('app-root-path').require;
global.services = reqlib('/lib/services');
global.logger = reqlib('/lib/logger');
global.log = services.setLog;

var express = require('express');
var expressLayouts = require('express-ejs-layouts');
var path = require('path');
var favicon = require('serve-favicon');
var config = reqlib('/config');

// Instruments
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var errorhandler = require('errorhandler');
var session = require('express-session');

// start app Express
var app = express();

var mongoose = reqlib('/lib/mongoose');

// configuration
app.set('config', config);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.set('layout', 'layout');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

var sessionStore = reqlib('/lib/sessionStore');

app.use(session({
  secret: config.get('session:secret'),
  key: config.get('session:key'),
  resave: false,
  saveUninitialized: true,
  cookie: config.get('session:cookie'),
  store: sessionStore
}));

// Passport and oAuth
let passport = require('passport');

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, next) => {
  let Clients = reqlib('/models/clients');
  Clients.findOne({ _id: id }).exec().then((user) => {
    if (user) {
      next(null, user);
    } else {
      next();
      // throw new Error('user_not_found');
    }
  }).catch(next);
});

// Middleware
app.use(reqlib('/middleware/loadUser'));
app.use(reqlib('/middleware/'));

// Connect files
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use(reqlib('/routes/index'));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err;
  if(req.app.get('env') === 'development'){
    err = new Error('Not Found url: ' + req.url);
  }else{
    err = new Error('Page not found!');
  }
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  var status = err.status || 500;
  res.status(status);
  res.render('client/error', {
    title: 'Error #' + status,
    token: ((!("user" in req.session)) ? null : req.session.user.token)
  });
});


module.exports = app;