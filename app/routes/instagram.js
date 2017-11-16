var express = require('express');
var router = express.Router();

/* GET instagram followers page. */
router.get('/', function (req, res, next) {
    res.redirect('instagram/followers');
});

/* GET instagram followers page. */
router.get('/followers', function (req, res, next) {
    res.render('instagram/followers', {
        title: "Buy Instagram Followers — Social-Celebrity.com",
        description: "If there's one thing we're experts in, it's helping businesses acquire quality Instagram followers. Here's everything you need to know before you buy.",
        page: req.baseUrl,
        subpage: req.path
    });
});

/* GET instagram comments page. */
router.get('/comments', function (req, res, next) {
    res.render('instagram/comments', {
        title: "Buy Instagram Comments — Social-Celebrity.com",
        description: "If there's one thing we're experts in, it's helping businesses acquire quality Instagram comments. Here's everything you need to know before you buy.",
        page: req.baseUrl,
        subpage: req.path
    });
});

/* GET instagram likes page. */
router.get('/likes', function (req, res, next) {
    res.render('instagram/likes', {
        title: "Buy Instagram Likes — Social-Celebrity.com",
        description: "If there's one thing we're experts in, it's helping businesses acquire quality Instagram likes. Here's everything you need to know before you buy.",
        page: req.baseUrl,
        subpage: req.path
    });
});

module.exports = router;