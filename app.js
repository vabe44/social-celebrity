require('dotenv').config()
var express = require('express');
var app = express();
var passport   = require('passport');
var session    = require('express-session');
var stripe = require("stripe")(process.env.STRIPE_SECRETKEY);
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
// app.use(logger('dev'));

// For BodyParser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

// For Passport
app.use(session({ secret: 'keyboard cat',resave: true, saveUninitialized:true})); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions

// For EJS - view engine setup
app.set('views', path.join(__dirname, '/app/views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, '/app/public')));

// Models
var models = require("./app/models");

// Load passport strategies
require('./app/config/passport/passport.js')(passport, models.user);

// Sync Database
models.sequelize.sync().then(function() {
   console.log('Nice! Database looks fine')
}).catch(function(err) {
   console.log(err, "Something went wrong with the Database Update!")
});

// Routes
var authRoute = require('./app/routes/auth.js')(app,passport);
var indexRoute = require('./app/routes/index');
var facebookRoute = require('./app/routes/facebook');
var instagramRoute = require('./app/routes/instagram');
var twitterRoute = require('./app/routes/twitter');
var youtubeRoute = require('./app/routes/youtube');
var paymentsRoute = require('./app/routes/payments');

app.use('/', indexRoute);
app.use('/facebook', facebookRoute);
app.use('/instagram', instagramRoute);
app.use('/twitter', twitterRoute);
app.use('/youtube', youtubeRoute);
app.use('/payments', paymentsRoute);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;