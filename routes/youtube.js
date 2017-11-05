var express = require('express');
var router = express.Router();

/* GET youtube page. */
router.get('/', function (req, res, next) {
  res.redirect('youtube/likes');
});

/* GET youtube likes page. */
router.get('/likes', function (req, res, next) {
  res.render('youtube/likes', {
    title: "Buy YouTube Likes — Social-Celebrity.com",
    description: "If there's one thing we're experts in, it's helping businesses acquire quality YouTube likes. Here's everything you need to know before you buy.",
    page: req.baseUrl,
    subpage: req.path,
    stripeKeyPublishable: process.env.STRIPE_PUBLISHABLEKEY
  });
});

/* GET youtube comments page. */
router.get('/comments', function (req, res, next) {
  res.render('youtube/comments', {
    title: "Buy YouTube Comments — Social-Celebrity.com",
    description: "If there's one thing we're experts in, it's helping businesses acquire quality YouTube comments. Here's everything you need to know before you buy.",
    page: req.baseUrl,
    subpage: req.path,
    stripeKeyPublishable: process.env.STRIPE_PUBLISHABLEKEY
  });
});

/* GET youtube subscribers page. */
router.get('/subscribers', function (req, res, next) {
  res.render('youtube/subscribers', {
    title: "Buy YouTube Subscribers — Social-Celebrity.com",
    description: "If there's one thing we're experts in, it's helping businesses acquire quality YouTube subscribers. Here's everything you need to know before you buy.",
    page: req.baseUrl,
    subpage: req.path,
    stripeKeyPublishable: process.env.STRIPE_PUBLISHABLEKEY
  });
});

/* GET youtube views page. */
router.get('/views', function (req, res, next) {
  res.render('youtube/views', {
    title: "Buy YouTube Views — Social-Celebrity.com",
    description: "If there's one thing we're experts in, it's helping businesses acquire quality YouTube views. Here's everything you need to know before you buy.",
    page: req.baseUrl,
    subpage: req.path,
    stripeKeyPublishable: process.env.STRIPE_PUBLISHABLEKEY
  });
});

module.exports = router;