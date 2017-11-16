var express = require('express');
var router = express.Router();
var middlewares = require("../middlewares");
var models      = require("../models");

/* GET shoutouts page. */
router.get('/', function (req, res, next) {

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
router.get('/:id', function (req, res, next) {

    models.Shoutout
    .findOne({
        where: {
            id: req.params.id
        },
        include: [ models.TwitterAccount, models.User ]
    })
    .then(shoutout => {
        res.render('shoutouts/show', {
            shoutout: shoutout
        });
    })
    .catch(error => {
        console.log("Oops, something went wrong. " + error);
    });

});

module.exports = router;