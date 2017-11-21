require('dotenv').config()
var express = require('express');
var router = express.Router();
var middlewares = require("../middlewares");
var models      = require("../models");
var Twitter = require('twitter');
var twitter = new Twitter({
    consumer_key: process.env.TWITTER_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
    access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
    access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
  });
var Promise = require("bluebird");

/* GET shoutouts page. */
router.get('/', middlewares.isLoggedIn, function (req, res, next) {

    models.Shoutout
    .findAll({
        include: [ models.User, models.TwitterAccount ]
    })
    .then(shoutouts => {
        res.render('shoutouts/index', {
            shoutouts: shoutouts
        });
    })
    .catch(error => {
        console.log("Oops, something went wrong. " + error);
    });

});

/* POST shoutouts. */
router.post('/', middlewares.isLoggedIn, function (req, res, next) {

    models.Shoutout
    .create({
        description: req.body.description,
        price: req.body.price,
        user_id: res.locals.currentUser.id,
        twitter_account_id: req.body.account
    })
    .then(() => {
        res.redirect('/shoutouts');
    })
    .catch(error => {
        console.log("Oops, something went wrong. " + error);
    });

});

/* GET new shoutouts page. */
router.get('/new', middlewares.isLoggedIn, function (req, res, next) {

    models.TwitterAccount
    .findAll({
        where: {
            user_id: res.locals.currentUser.id
        }
    })
    .then(twitterAccounts => {
        res.render('shoutouts/new', {
            twitterAccounts: twitterAccounts
        });
    })
    .catch(error => {
        console.log("Oops, something went wrong. " + error);
    });

});

/* GET show shoutout page. */
router.get('/:id', middlewares.isLoggedIn, function (req, res, next) {

    models.Shoutout
    .findOne({
        where: {
            id: req.params.id
        },
        include: [ models.TwitterAccount, models.User ]
    })
    .then(shoutout => {

        Promise.join(
            twitter.get('users/show', {screen_name: shoutout.TwitterAccount.username}),
            twitter.get('search/tweets', {
                from: shoutout.TwitterAccount.username,
                filter: "images",
                include_entities: 1,
                count: 6
            }),

            function(account, tweets) {
                shoutout.twitter = account;
                shoutout.twitter.tweets = tweets;
                res.render('shoutouts/show', {
                    shoutout,
                    title: "Orders — Social-Celebrity.com",
                    description: "",
                    page: req.baseUrl,
                    subpage: req.path,
                });

            }
        )
    })
    .catch(error => {
        console.log("Oops, something went wrong. " + error);
    });

});

module.exports = router;