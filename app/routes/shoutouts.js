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
var asyncRequest = require('async-request');

/* GET shoutouts page. */
router.get('/', middlewares.asyncMiddleware(async (req, res, next) => {

    const shoutouts = await models.Shoutout.findAll({
        include: [{ all: true, nested: true }]
    });

    // get followers
    for (let shoutout of shoutouts) {

        if(shoutout.TwitterAccount.type === "twitter") {
            // check if account exists and pull data
            const account = await twitter.get('users/show', {screen_name: shoutout.TwitterAccount.username});
            if(account) shoutout.followers = account.followers_count;
        }

        if(shoutout.TwitterAccount.type === "instagram") {
            // check if account exists and pull data
            const json = await asyncRequest('https://igpi.ga/' + shoutout.TwitterAccount.username + '/?__a=1', {
                headers: { 'Referer': req.hostname }
            });
            const instagram = JSON.parse(json.body);
            if(instagram.user) shoutout.followers = instagram.user.followed_by.count;
        }
    }

    res.render('shoutouts/index', {
        shoutouts,
        title: "Shoutouts — Social-Celebrity.com",
        description: "",
        page: req.baseUrl,
        subpage: req.path,
    });

}));

/* POST shoutouts. */
router.post('/', middlewares.isLoggedIn, middlewares.asyncMiddleware(async (req, res, next) => {

    const shoutout = await models.Shoutout.create({
        description: req.body.description,
        user_id: res.locals.currentUser.id,
        twitter_account_id: req.body.account
    });
    res.redirect('/shoutouts');

}));

/* GET new shoutouts page. */
router.get('/new', middlewares.isLoggedIn, middlewares.asyncMiddleware(async (req, res, next) => {

    if(!res.locals.currentUser.stripe_user_id) {
        req.flash("error", "You need to link a Stripe account to your profile first.");
        res.redirect('/dashboard/profile');
    }

    const accounts = await models.TwitterAccount.findAll({
        where: {
            user_id: res.locals.currentUser.id,
            verified: true,
        },
        include: [{ all: true, nested: true }]
    });

    res.render('shoutouts/new', {
        accounts,
        title: "Shoutouts — Social-Celebrity.com",
        description: "",
        page: req.baseUrl,
        subpage: req.path,
    });

}));

/* SHOW - shows more info about one shoutout. */
router.get('/:id', middlewares.asyncMiddleware(async (req, res, next) => {

    let shoutout = await models.Shoutout.findOne({ where: { id: req.params.id }, include: [{ all: true, nested: true }]});

    if(res.locals.currentUser) {
        const favorited = await models.ShoutoutFavorite.findOne({
            where: {
                user_id: res.locals.currentUser.id,
                shoutout_id: req.params.id
            }
        });
        shoutout.favorited = favorited;
    }

    const account = await twitter.get('users/show', {screen_name: shoutout.TwitterAccount.username});
    const tweets = await twitter.get('search/tweets', {
        from: shoutout.TwitterAccount.username,
        filter: "images",
        include_entities: 1,
        count: 6
    });

    const totalScore = shoutout.ShoutoutReviews.reduce((sum, review) => sum + Number(review.rating), 0);
    shoutout.score = (totalScore / shoutout.ShoutoutReviews.length) * 20;

    shoutout.twitter = account;
    shoutout.twitter.tweets = tweets;

    res.render('shoutouts/show', {
        shoutout,
        moment,
        title: "Shoutout — Social-Celebrity.com",
        description: "",
        page: req.baseUrl,
        subpage: req.path,
    });

}));

// EDIT shoutout route
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

// UPDATE shoutout route
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

/* POST shoutouts. */
router.post('/favorite', middlewares.isLoggedIn, middlewares.asyncMiddleware(async (req, res, next) => {

    const result = await models.ShoutoutFavorite.findOrCreate({
        where: {
            user_id: res.locals.currentUser.id,
            shoutout_id: req.body.shoutoutId
        }
    })
    .spread((favorite, created) => {

        if(created) {
            return "created";
        } else {
            return favorite.destroy().then(() => {
                return "deleted";
            });
        }

    });

    res.json({ result: result });

}));

/* GET new shoutout review page. */
router.get('/:id/review', middlewares.isLoggedIn, middlewares.asyncMiddleware(async (req, res, next) => {

    const order = await models.ShoutoutOrder.findOne({
        where: {
            user_id: res.locals.currentUser.id,
            shoutout_id: req.params.id,
        }
    });

    if(order) {
        res.render('shoutouts/reviews/new', {
            order,
            title: "Review Shoutout — Social-Celebrity.com",
            description: "",
            page: req.baseUrl,
            subpage: req.path,
        });
    } else {
        res.redirect('back');
    }

}));

/* POST new review */
router.post('/review', middlewares.isLoggedIn, middlewares.asyncMiddleware(async (req, res, next) => {

    // if order exist it means user can review
    const order = await models.ShoutoutOrder.findOne({
        where: {
            id: req.body.orderId,
            user_id: res.locals.currentUser.id,
            shoutout_id: req.body.shoutoutId,
        }
    });

    // if review exist, user already reviewed
    const review = await models.ShoutoutReview.findOne({
        where: {
            user_id: res.locals.currentUser.id,
            shoutout_id: req.body.shoutoutId,
            shoutout_order_id: req.body.shoutoutOrderId,
        }
    });

    if(order && !review) {
        const newReview = await models.ShoutoutReview.create({
            text: req.body.reviewtext,
            rating: req.body.reviewrating,
            user_id: res.locals.currentUser.id,
            shoutout_id: req.body.shoutoutId,
            shoutout_order_id: req.body.orderId
        });
    }

    res.redirect('/shoutouts/' + req.body.shoutoutId);

}));

/* GET edit shoutout review page. */
router.get('/:id/review/:reviewId/edit', middlewares.isLoggedIn, middlewares.asyncMiddleware(async (req, res, next) => {

    // find review to update
    const review = await models.ShoutoutReview.findById(req.params.reviewId);

    if(review.user_id == res.locals.currentUser.id) {
        res.render('shoutouts/reviews/edit', {
            review,
            title: "Edit Review — Social-Celebrity.com",
            description: "",
            page: req.baseUrl,
            subpage: req.path,
        });
    } else {
        res.redirect('back');
    }

}));

/* PUT review */
router.put('/:id/review', middlewares.isLoggedIn, middlewares.asyncMiddleware(async (req, res, next) => {

    // find review to update
    const review = await models.ShoutoutReview.findById(req.body.reviewId);

    if(review.user_id == res.locals.currentUser.id) {
        // update the review
        const result = review.update({
            text: req.body.reviewtext,
            rating: req.body.reviewrating,
        });
    }
    res.redirect('/shoutouts/' + review.shoutout_id);

}));

module.exports = router;