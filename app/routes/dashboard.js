require('dotenv').config()
var express = require('express');
var router = express.Router();
var middlewares = require("../middlewares");
var models      = require("../models");
const Op = models.Sequelize.Op;
var assert = require('assert');
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
var nodemailer = require('nodemailer');
var Promise = require("bluebird");

/* GET dashboard page. */
router.get('/', middlewares.isLoggedIn, function (req, res, next) {
    res.render('dashboard/index', {
        redirectUri: oauth.code.getUri(),
        title: "Accounts — Social-Celebrity.com",
        description: "",
        page: req.baseUrl,
        subpage: req.path
    });
});

/* GET accounts page. */
router.get('/accounts', middlewares.isLoggedIn, function (req, res, next) {

    models.TwitterAccount.findAll({
        where: {
            user_id: res.locals.currentUser.id,
            verified: true
        }
    })
    .then(twitterAccounts => {
        res.render('dashboard/accounts/index', {
            twitterAccounts: twitterAccounts,
            title: "Accounts — Social-Celebrity.com",
            description: "",
            page: req.baseUrl,
            subpage: req.path
        });
    })
    .catch(error => {
        console.log("Oops, something went wrong. " + error);
    });

});

/* GET add twitter account page. */
router.get('/accounts/add/twitter', middlewares.isLoggedIn, function (req, res, next) {
    res.render('dashboard/accounts/add/twitter', {
        title: "Add Account — Social-Celebrity.com",
        description: "",
        page: req.baseUrl,
        subpage: req.path
    });
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
                twitterVerificationCode: req.session.twitterVerificationCode,
                title: "Verify Account — Social-Celebrity.com",
                description: "",
                page: req.baseUrl,
                subpage: req.path
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

    Promise.join(
        models.TwitterAccount.findById(req.params.id),
        models.Category.findAll(),
        models.Language.findAll(),
        models.Country.findAll(),
        models.Age.findAll(),
        models.Sex.findAll(),
        models.Activity.findAll(),

        function(twitter, categories, languages, countries, ages, sexes, activities) {
            res.render('dashboard/accounts/manage', {
                twitter,
                categories,
                languages,
                countries,
                ages,
                sexes,
                activities,
                title: "Accounts — Social-Celebrity.com",
                description: "",
                page: req.baseUrl,
                subpage: req.path
            });

        }
    )
    .catch(error => {
        console.log("Oops, something went wrong. " + error);
    });

});

/* POST account manage page. */
router.post('/accounts/manage/twitter/:id', middlewares.isLoggedIn, function (req, res, next) {

    models.TwitterAccount.findById(req.params.id)
    .then(twitterAccount => {
        return twitterAccount.update({
            category_id: req.body.category,
            language_id: req.body.language,
            country_id: req.body.country,
            age_id: req.body.age,
            sex_id: req.body.sex,
            activity_id: req.body.activity,
        });
    })
    .then(() => {
        res.redirect('back');
    })
    .catch(error => {
        console.log("Oops, something went wrong. " + error);
    });

});

/* GET profile page. */
router.get('/profile', middlewares.isLoggedIn, function (req, res, next) {
    res.render('dashboard/profile', {
        title: "Profile — Social-Celebrity.com",
        description: "",
        page: req.baseUrl,
        subpage: req.path
    });
});

/* POST profile page. */
router.post('/profile', middlewares.isLoggedIn, function (req, res, next) {

    var currentPassword = req.body.currentpassword;
    var newPassword = req.body.newpassword;
    var confirmPassword = req.body.confirmpassword;

    models.User.findById(res.locals.currentUser.id)
    .then(user => {

        if(!models.User.comparePassword(currentPassword)) {
            throw new Error("Incorrect Password");
        }

        if(newPassword !== confirmPassword) {
            throw new Error("Password confirmation failed");
        }

        return user.update({
            password: models.User.generateHash(newPassword)
        });
    })
    .then(() => {
        res.redirect('back');
    })
    .catch(error => {
        console.log("Oops, something went wrong. " + error);
    });

});

/* GET orders page. */
router.get('/orders', middlewares.isLoggedIn, function (req, res, next) {

    models.ShoutoutOrder
    .findAll({
        where: {
            user_id: res.locals.currentUser.id
        },
        include: [{ all: true, nested: true }]
    })
    .then(orders => {
        res.render('dashboard/orders', {
            orders,
            title: "Orders — Social-Celebrity.com",
            description: "",
            page: req.baseUrl,
            subpage: req.path,
        });
    })
    .catch(error => {
        console.log("Oops, something went wrong. " + error);
    });

});

/* GET profile page. */
router.get('/forgot', function (req, res, next) {
    res.render('forgot', {
        title: "Forgot Password — Social-Celebrity.com",
        description: "",
        page: req.baseUrl,
        subpage: req.path
    });
});

/* POST forgot profile password page. */
router.post('/forgot', function (req, res, next) {

    models.User
    .findOne({
        where: {
            email: req.body.email
        }
    })
    .then(user => {

        return user.update({
            reset_password_token: cryptoRandomString(20),
            reset_password_expires: Date.now() + 3600000 // 1 hour
        });

    })
    .then(user => {

        let transporter = nodemailer.createTransport({
            host: process.env.NODEMAILER_HOST,
            port: process.env.NODEMAILER_PORT,
            secure: process.env.NODEMAILER_SECURE, // upgrade later with STARTTLS
            auth: {
                user: process.env.NODEMAILER_USER,
                pass: process.env.NODEMAILER_PASS
            },
            tls: {
                rejectUnauthorized: false
            }
        })

        var message = {
            to: user.email,
            from: 'passwordreset@demo.com',
            subject: 'Node.js Password Reset',
            text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                'http://' + req.headers.host + '/dashboard/profile/reset/' + user.reset_password_token + '\n\n' +
                'If you did not request this, please ignore this email and your password will remain unchanged.\n'
        };

        transporter.sendMail(message, function(err) {

            if(err) {
                throw new Error(`Mail sending failed. ${err.message}`);
            }

            // req.flash('info', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
        });

    })
    .then(() => {
        res.redirect('back');
    })
    .catch(error => {
        console.log("Oops, something went wrong. " + error);
    });

});

/* GET password reset page. */
router.get('/profile/reset/:token', function (req, res, next) {

    models.User
    .findOne({
        where: {
            reset_password_token: req.params.token,
            reset_password_expires: {
                [Op.gt]: Date.now()
            }
        }
    })
    .then(user => {

        if(!user) {
            throw new Error("Password reset token is invalid or has expired.");
        }

        res.render('reset', {
            title: "Profile — Social-Celebrity.com",
            description: "",
            page: req.baseUrl,
            subpage: req.path,
            token: user.reset_password_token
        });

    })
    .catch(error => {
        console.log("Oops, something went wrong. " + error);
    });

});

/* POST forgot profile password page. */
router.post('/profile/reset/:token', function (req, res, next) {

    // find user
    models.User
    .findOne({
        where: {
            reset_password_token: req.params.token,
            reset_password_expires: {
                [Op.gt]: Date.now()
            }
        }
    })
    .then(user => {

        // update password
        if(!user) {
            throw new Error("Password reset token is invalid or has expired.");
        }

        return user.update({
            password: models.User.generateHash(req.body.newpassword),
            reset_password_token: null,
            reset_password_expires: null
        });

    })
    .then(user => {

        // log in user
        req.login(user, function (err) {

            if(err) {
                throw new Error(`Mail sending failed. ${err.message}`);
            }
        })

        return user;

    })
    .then(user => {

        // send email
        let transporter = nodemailer.createTransport({
            host: process.env.NODEMAILER_HOST,
            port: process.env.NODEMAILER_PORT,
            secure: process.env.NODEMAILER_SECURE, // upgrade later with STARTTLS
            auth: {
                user: process.env.NODEMAILER_USER,
                pass: process.env.NODEMAILER_PASS
            },
            tls: {
                rejectUnauthorized: false
            }
        })

        var message = {
            to: user.email,
            from: 'passwordreset@demo.com',
            subject: 'Node.js Password Reset',
            text: 'Hello,\n\n' +
            'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
        };

        transporter.sendMail(message, function(err) {

            if(err) {
                throw new Error(`Mail sending failed. ${err.message}`);
            }

            req.flash('success', 'Success! Your password has been changed.');
        });

    })
    .then(() => {
        res.redirect('/dashboard');
    })
    .catch(error => {
        console.log("Oops, something went wrong. " + error);
    });

});

module.exports = router;