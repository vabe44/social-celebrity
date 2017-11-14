var express = require('express');
var router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRETKEY);
var OAuth = require('client-oauth2');
var models = require("../models");

// Configure the OAuth 2.0 Client
var oauth = new OAuth({
  clientId: process.env.STRIPE_CLIENTID,
  clientSecret: process.env.STRIPE_SECRETKEY,
  scopes: ['read_write'],
  redirectUri: process.env.STRIPE_REDIRECTURI,
  authorizationUri: 'https://connect.stripe.com/oauth/authorize',
  accessTokenUri: 'https://connect.stripe.com/oauth/token'
});


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {
    title: 'Social Celebrity — Buy Facebook likes, Twitter Followers, Youtube views, Instagram Followers, and more!',
    description: 'Social Celebrity is the the leader in Social Media marketing services. We help our clients acquire thousands of real Facebook, Twitter, Youtube, and Instagram likes, subscribers, and followers for their profiles every month.',
    page: req.path
  });
});

/* GET blog page. */
router.get('/blog', function(req, res, next) {
  res.render('blog', {
    title: "Social Media Marketing and Help Articles",
    description: "Learn how to get the most out of your Twitter profile, as well as grow and maintain your Instagram and Facebook pages.",
    page: req.path
  });
});

/* GET contact page. */
router.get('/contact', function(req, res, next) {
  res.render('contact', {
    title: "Contact",
    description: "Is this your first time buying followers for your profile? Our frequently asked questions page is regularly updated to answer the most common questions.",
    page: req.path
  });
});

/* GET error page. */
router.get('/error', function(req, res, next) {
  res.render('error');
});

/* GET faq page. */
router.get('/faq', function(req, res, next) {
  res.render('faq', {
    title: "Frequently Asked Questions",
    description: "Is this your first time buying followers for your profile? Our frequently asked questions page is regularly updated to answer the most common questions.",
    page: req.path
  });
});

/* GET free-followers page. */
router.get('/free-followers', function(req, res, next) {
  res.render('free-followers', {
    title: "Get Free Twitter Followers - Social-Celebrity.com",
    description: "Looking for free Twitter followers? We give out 1000 Twitter followers to hundreds of businesses, free of charge. Here's how to get started.",
    page: req.path
  });
});

/* GET privacy page. */
router.get('/privacy', function(req, res, next) {
  res.render('privacy', {
    title: "Privacy Policy",
    description: "Is this your first time buying followers for your profile? Our frequently asked questions page is regularly updated to answer the most common questions.",
    page: req.path
  });
});

/* GET terms page. */
router.get('/terms', function(req, res, next) {
  res.render('terms', {
    title: "Terms of Service",
    description: "Is this your first time buying followers for your profile? Our frequently asked questions page is regularly updated to answer the most common questions.",
    page: req.path
  });
});

/* GET purchase success page. */
router.get('/success', function(req, res, next) {
  res.render('success', {
    title: "Your Order is Being Processed",
    description: "",
    page: req.path
  });
});

/* GET - Stripe Connect Redirect URI page */
router.get('/connected', function(req, res, next) {
  if (req.query.error) return response.render('connected', {
    error: req.query.error
  });

  // Use the Authorization Code to get a Token
  oauth.code.getToken(req.url).then(handleToken);

  // Go fetch the Account from the Token
  function handleToken(token) {
    stripe.account.retrieve(token.data.stripe_user_id, onAccount);
  }

  // Render the Account information
  function onAccount(error, account) {

    models.User.findById(req.user.id)
      .then(user => {
        user.update({
          stripe_user_id: account.id,
        })
        .then(() => {
          res.render('connected', {
            error: error,
            account: account
          });
        });
      });
  }
});

module.exports = router;