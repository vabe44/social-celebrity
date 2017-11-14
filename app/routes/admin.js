var express = require('express');
var router = express.Router();
var middlewares = require("../middlewares");
var models      = require("../models");

/* GET admin index page. */
router.get('/', middlewares.isLoggedIn, function (req, res, next) {
    res.render('admin/index');
});

/* GET shoutout categories page. */
router.get('/shoutout/categories/', middlewares.isLoggedIn, function (req, res, next) {

    models.Category
    .findAll()
    .then(categories => {
        res.render('admin/shoutout/categories/index', {
            categories: categories
        });
    })
    .catch(error => {
        console.log("Oops, something went wrong. " + error);
    });

});

/* POST shoutout categories page. */
router.post('/shoutout/categories/', middlewares.isLoggedIn, function (req, res, next) {

    models.Category
    .create({ name: req.body.categoryname })
    .then(() => {
        res.redirect('back');
    })
    .catch(error => {
        console.log("Oops, something went wrong. " + error);
    });
})

/* GET languages page. */
router.get('/shoutout/languages/', middlewares.isLoggedIn, function (req, res, next) {

    models.Language
    .findAll()
    .then(languages => {
        res.render('admin/shoutout/languages/index', {
            languages: languages
        });
    })
    .catch(error => {
        console.log("Oops, something went wrong. " + error);
    });

});

/* POST languages page. */
router.post('/shoutout/categories/', middlewares.isLoggedIn, function (req, res, next) {

    models.Language
    .create({ name: req.body.languagename })
    .then(() => {
        res.redirect('back');
    })
    .catch(error => {
        console.log("Oops, something went wrong. " + error);
    });
})

/* GET countries page. */
router.get('/shoutout/countries/', middlewares.isLoggedIn, function (req, res, next) {

    models.Country
    .findAll()
    .then(countries => {
        res.render('admin/shoutout/countries/index', {
            countries: countries
        });
    })
    .catch(error => {
        console.log("Oops, something went wrong. " + error);
    });

});

/* POST countries page. */
router.post('/shoutout/countries/', middlewares.isLoggedIn, function (req, res, next) {

    models.Country
    .create({ name: req.body.countryname })
    .then(() => {
        res.redirect('back');
    })
    .catch(error => {
        console.log("Oops, something went wrong. " + error);
    });
})

/* GET ages page. */
router.get('/shoutout/ages/', middlewares.isLoggedIn, function (req, res, next) {

    models.Age
    .findAll()
    .then(ages => {
        res.render('admin/shoutout/ages/index', {
            ages: ages
        });
    })
    .catch(error => {
        console.log("Oops, something went wrong. " + error);
    });

});

/* POST ages page. */
router.post('/shoutout/ages/', middlewares.isLoggedIn, function (req, res, next) {

    models.Age
    .create({ name: req.body.agename })
    .then(() => {
        res.redirect('back');
    })
    .catch(error => {
        console.log("Oops, something went wrong. " + error);
    });
})

/* GET sexes page. */
router.get('/shoutout/sexes/', middlewares.isLoggedIn, function (req, res, next) {

    models.Sex
    .findAll()
    .then(sexes => {
        res.render('admin/shoutout/sexes/index', {
            sexes: sexes
        });
    })
    .catch(error => {
        console.log("Oops, something went wrong. " + error);
    });

});

/* POST sexes page. */
router.post('/shoutout/sexes/', middlewares.isLoggedIn, function (req, res, next) {

    models.Sex
    .create({ name: req.body.sexname })
    .then(() => {
        res.redirect('back');
    })
    .catch(error => {
        console.log("Oops, something went wrong. " + error);
    });
})

/* GET activities page. */
router.get('/shoutout/activities/', middlewares.isLoggedIn, function (req, res, next) {

    models.Activity
    .findAll()
    .then(activities => {
        res.render('admin/shoutout/activities/index', {
            activities: activities
        });
    })
    .catch(error => {
        console.log("Oops, something went wrong. " + error);
    });

});

/* POST activities page. */
router.post('/shoutout/activities/', middlewares.isLoggedIn, function (req, res, next) {

    models.Activity
    .create({ name: req.body.activityname })
    .then(() => {
        res.redirect('back');
    })
    .catch(error => {
        console.log("Oops, something went wrong. " + error);
    });
})

module.exports = router;