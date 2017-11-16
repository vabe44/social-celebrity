var express = require('express');
var router = express.Router();

/* GET twitter followers page. */
router.get('/', function (req, res, next) {
    res.redirect('twitter/followers');
});

/* GET twitter followers page. */
router.get('/followers', function (req, res, next) {
    res.render('twitter/followers', {
        title: "Buy Twitter Followers — Social-Celebrity.com",
        description: "If there's one thing we're experts in, it's helping businesses acquire quality Twitter followers. Here's everything you need to know before you buy.",
        page: req.baseUrl,
        subpage: req.path
    });
});

/* GET twitter USA page. */
router.get('/followers/usa', function (req, res, next) {
    console.log(req.baseUrl);
    console.log(req.path);
    res.render('twitter/followers-usa', {
        title: "Buy Twitter USA Followers — Social-Celebrity.com",
        description: "If there's one thing we're experts in, it's helping businesses acquire quality USA Twitter followers. Here's everything you need to know before you buy.",
        page: req.baseUrl,
        subpage: req.path
    });
});

/* GET twitter likes page. */
router.get('/likes', function (req, res, next) {
    res.render('twitter/likes', {
        title: "Buy Twitter Likes — Social-Celebrity.com",
        description: "If there's one thing we're experts in, it's helping businesses acquire quality Twitter likes. Here's everything you need to know before you buy.",
        page: req.baseUrl,
        subpage: req.path
    });
});

/* GET twitter retweets page. */
router.get('/retweets', function (req, res, next) {
    res.render('twitter/retweets', {
        title: "Buy Twitter Retweets — Social-Celebrity.com",
        description: "If there's one thing we're experts in, it's helping businesses acquire quality Twitter retweets. Here's everything you need to know before you buy.",
        page: req.baseUrl,
        subpage: req.path
    });
});

module.exports = router;