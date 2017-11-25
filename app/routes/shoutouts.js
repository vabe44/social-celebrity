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
var moment = require('moment');

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

/* SHOW - shows more info about one shoutout. */
router.get('/:id', middlewares.isLoggedIn, function (req, res, next) {

    models.Shoutout
    .findOne({
        where: {
            id: req.params.id
        },
        include: [{ all: true, nested: true }]
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
                    moment,
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

// EDIT qol route
router.get("/:id/edit", middlewares.isLoggedIn, function (req, res, next) {

    Promise.join(
        models.Shoutout.findOne({ where: { id: req.params.id }, include: [{ all: true }] }),
        models.ShoutoutPriceOption.findAll(),

        function(shoutout, priceOptions) {

            priceOptions.forEach(option => {

                let result = shoutout.ShoutoutPriceOptions.find(price => price.id === option.id);
                if(result) option.price = result.ShoutoutPrice.price;

            });

            res.render('shoutouts/edit', {
                shoutout,
                priceOptions,
                title: "Edit Shoutout — Social-Celebrity.com",
                description: "",
                page: req.baseUrl,
                subpage: req.path,
            });

        }
    )
    .catch(error => {
        console.log("Oops, something went wrong. " + error);
    });

});

// UPDATE campground route
router.put("/:id", function (req, res, next) {

    Promise.join(
        models.Shoutout.findOne({ where: { id: req.params.id }, include: [{ all: true }] }),
        models.ShoutoutPriceOption.findAll(),

        function(shoutout, priceOptions) {

            // update description
            shoutout.update({
                description: req.body.description
            })

            // update prices
            priceOptions.forEach(option => {

                let toggle = req.body[`price-option-toggle-${option.id}`];
                let price = req.body[`price-option-input-${option.id}`];

                // price enabled, have to create or update price
                if(toggle === 'on') {
                    console.log(price);

                    // find or create the price
                    models.ShoutoutPrice
                    .findOrCreate({
                        where: {
                            shoutout_id: shoutout.id,
                            shoutout_price_option_id: option.id
                        }
                    })
                    .spread((shoutoutPrice, created) => {

                        // update the price
                        shoutoutPrice.update({
                            price: Number(price)
                        })

                    })
                // price is disabled, delete it
                } else {

                    models.ShoutoutPrice.findOne({
                        where: {
                            shoutout_id: shoutout.id,
                            shoutout_price_option_id: option.id
                        }
                    })
                    .then(shoutoutPrice => {

                        if(shoutoutPrice) {
                            shoutoutPrice.destroy();
                        }

                    })

                }

            });

            res.redirect(`/shoutouts/${req.params.id}/edit`);
        }
    )
    .catch(error => {
        console.log("Oops, something went wrong. " + error);
    });

});

module.exports = router;