var express = require('express');
var router = express.Router();
var middlewares = require("../middlewares");
var models      = require("../models");
var OAuth = require('client-oauth2');
// Configure the OAuth 2.0 Client
var oauth = new OAuth({
    clientId: process.env.STRIPE_CLIENTID,
    clientSecret: process.env.STRIPE_SECRETKEY,
    scopes: ['read_write'],
    redirectUri: process.env.STRIPE_REDIRECTURI,
    authorizationUri: 'https://connect.stripe.com/oauth/authorize',
    accessTokenUri: 'https://connect.stripe.com/oauth/token'
});

var Twitter = require('twitter');
var twitter = new Twitter({
    consumer_key: process.env.TWITTER_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
    access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
    access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
  });

const cryptoRandomString = require('crypto-random-string');

/* GET dashboard page. */
router.get('/', middlewares.isLoggedIn, function (req, res, next) {
    res.render('dashboard/index', {
        redirectUri: oauth.code.getUri()
    });
});

/* GET accounts page. */
router.get('/accounts', middlewares.isLoggedIn, function (req, res, next) {

    models.TwitterAccount
    .findAll({
        where: {
            user_id: res.locals.currentUser.id,
            verified: true
        }
    })
    .then(twitterAccounts => {
        res.render('dashboard/accounts/index', {
            twitterAccounts: twitterAccounts
        });
    })
    .catch(error => {
        console.log("Oops, something went wrong. " + error);
    });

});

/* GET add twitter account page. */
router.get('/accounts/add/twitter', middlewares.isLoggedIn, function (req, res, next) {
    res.render('dashboard/accounts/add/twitter');
});

/* POST add twitter account page. */
router.post('/accounts/add/twitter', middlewares.isLoggedIn, function (req, res, next) {

    // check if account exists and pull data
    twitter.get('users/show', {screen_name: req.body.username},  function(error, account, response) {
        if(error) {
            console.log(error[0].message);
        }

        if(account) {
            res.redirect('/dashboard/accounts/verify/twitter/'+account.screen_name);
        }
    });
});

/* GET twitter account verification page. */
router.get('/accounts/verify/twitter/:screen_name', middlewares.isLoggedIn, function (req, res, next) {

    // create random string for verification
    // check if account exists on twitter and pull data
    // check if account is already added and verified by someone to DB
    // if not, add or find row with user id, twitter username, and a verification code to DB

    req.session.twitterVerificationCode = req.session.twitterVerificationCode || cryptoRandomString(10);

    // find or create twitteraccount entry with user id and twitter username
    models.TwitterAccount
    .findOrCreate({
        where: {
            username: req.params.screen_name,
            user_id: res.locals.currentUser.id
        }
    })
    .spread((twitterAccount, created) => {

        // if verification code is changed because of new session
        if(twitterAccount.verification_code !== req.session.twitterVerificationCode) {
            // update the verification code value in the DB
            twitterAccount.update({
                verification_code: req.session.twitterVerificationCode
            }).then(twitterAccount =>{
                console.log('Verification code updated!');
            })
            .catch(error => {
                console.log("Oops, something went wrong. " + error);
            });
        }

    });

    twitter.get('users/show', {screen_name: req.params.screen_name},  function(error, account, response) {
        if(error) {
            console.log(error[0].message);
        }

        if(account) {
            res.render('dashboard/accounts/verify/twitter', {
                account: account,
                twitterVerificationCode: req.session.twitterVerificationCode
            });
        }
    });

});

/* POST twitter account verification page. */
router.post('/accounts/verify/twitter/:screen_name/', middlewares.isLoggedIn, function (req, res, next) {

    // check if current user and payload data matches then get the code from DB
    // NEED TO CHECK HERE IF TWITTER BIO CONTAINS CODE THEN VERIFY
    if(req.body.user_id == res.locals.currentUser.id && req.body.verification_code == req.session.twitterVerificationCode) {

        // get twitter user info
        twitter.get('users/show', {screen_name: req.params.screen_name})
        .then(user => {

            // get verification code from DB
            models.TwitterAccount
            .findOne({
                where: {
                    username: req.params.screen_name,
                    user_id: res.locals.currentUser.id
                }
            })
            .then(twitterAccount => {
                // set account to verified if twitter bio contains verification code from DB
                if(user.description.includes(twitterAccount.verification_code)) {
                    twitterAccount.update({
                        verified: true
                    }).then(twitterAccount =>{
                        console.log('Verification successfully completed!');
                        res.redirect('/dashboard/accounts');
                    })
                    .catch(error => {
                        console.log("Oops, something went wrong. " + error);
                    });
                } else {
                    console.log("Verification failed.");
                    res.redirect('back');
                }
            })
            .catch(error => {
                console.log("Oops, something went wrong. " + error);
            });

        })
        .catch(error => {
            console.log("Oops, something went wrong. " + error);
        });

    } else {
        console.log('shit');
    }

});

/* DELETE twitter account */
router.delete('/accounts/remove/twitter/:screen_name/', middlewares.isLoggedIn, function (req, res, next) {

    models.TwitterAccount
    .findOne({
        where: {
            username: req.params.screen_name,
            user_id: res.locals.currentUser.id,
            verified: true
        }
    })
    .then(twitterAccount => {
        // now you see me...
        return twitterAccount.destroy();
    })
    .then(() => {
        res.redirect('/dashboard/accounts');
    })
    .catch(error => {
        console.log("Oops, something went wrong. " + error);
    });

});

/* GET account manage page. */
router.get('/accounts/manage/twitter/:id', middlewares.isLoggedIn, function (req, res, next) {


    var data = {};
    models.TwitterAccount.findById(req.params.id)
    .then(twitterAccount => {
        data.twitter = twitterAccount;
    })
    .then(() => {
        return models.ShoutoutCategory.findAll()
    })
    .then(categories => {
        data.categories = categories;
    })
    .then(() => {
        res.render('dashboard/accounts/manage', {
            categories: data.categories,
            twitter: data.twitter
        });
    })
    .catch(error => {
        console.log("Oops, something went wrong. " + error);
    });

});

/* POST account manage page. */
router.post('/accounts/manage/twitter/:id', middlewares.isLoggedIn, function (req, res, next) {

    models.TwitterAccount.findById(req.params.id)
    .then(twitterAccount => {
        return twitterAccount.update({
            shoutout_category_id: req.body.category
        });
    })
    .then(() => {
        res.redirect('back');
    })
    .catch(error => {
        console.log("Oops, something went wrong. " + error);
    });

});

/* GET shoutout categories page. */
router.get('/admin/shoutout-categories/', middlewares.isLoggedIn, function (req, res, next) {

    models.ShoutoutCategory
    .findAll()
    .then(categories => {
        res.render('dashboard/admin/shoutout-categories/index', {
            categories: categories
        });
    })
    .catch(error => {
        console.log("Oops, something went wrong. " + error);
    });

});

/* GET shoutout categories page. */
router.post('/admin/shoutout-categories/', middlewares.isLoggedIn, function (req, res, next) {

    models.ShoutoutCategory
    .create({ name: req.body.categoryname })
    .then(category => {
        res.redirect('back');
    })
    .catch(error => {
        console.log("Oops, something went wrong. " + error);
    });
})

module.exports = router;