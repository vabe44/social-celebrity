var express = require('express');
var router = express.Router();

/* GET facebook page. */
router.get('/', function(req, res, next) {
  res.redirect('facebook/likes');
});

/* GET facebook likes page. */
router.get('/likes', function(req, res, next) {
  res.render('facebook/likes', {
    title: "Buy Facebook Likes — Social-Celebrity.com",
    description: "If there's one thing we're experts in, it's helping businesses acquire quality Facebook likes. Here's everything you need to know before you buy.",
    page: req.baseUrl,
    subpage: req.path
  });
});

/* GET facebook followers page. */
router.get('/followers', function(req, res, next) {
  res.render('facebook/followers', {
    title: "Buy Facebook Followers — Social-Celebrity.com",
    description: "If there's one thing we're experts in, it's helping businesses acquire quality Facebook followers. Here's everything you need to know before you buy.",
    page: req.baseUrl,
    subpage: req.path
  });
});

/* GET facebook post likes page. */
router.get('/postlikes', function(req, res, next) {
  res.render('facebook/postlikes', {
    title: "Buy Facebook Postlikes — Social-Celebrity.com",
    description: "If there's one thing we're experts in, it's helping businesses acquire quality Facebook postlikes. Here's everything you need to know before you buy.",
    page: req.baseUrl,
    subpage: req.path
  });
});

/* GET facebook ratings page. */
router.get('/ratings', function(req, res, next) {
  res.render('facebook/ratings', {
    title: "Buy Facebook Ratings — Social-Celebrity.com",
    description: "If there's one thing we're experts in, it's helping businesses acquire quality Facebook ratings. Here's everything you need to know before you buy.",
    page: req.baseUrl,
    subpage: req.path
  });
});

/* GET facebook shares page. */
router.get('/shares', function(req, res, next) {
  res.render('facebook/shares', {
    title: "Buy Facebook Shares — Social-Celebrity.com",
    description: "If there's one thing we're experts in, it's helping businesses acquire quality Facebook shares. Here's everything you need to know before you buy.",
    page: req.baseUrl,
    subpage: req.path
  });
});

/* GET facebook web likes page. */
router.get('/weblikes', function(req, res, next) {
  res.render('facebook/weblikes', {
    title: "Buy Facebook Weblikes — Social-Celebrity.com",
    description: "If there's one thing we're experts in, it's helping businesses acquire quality Facebook weblikes. Here's everything you need to know before you buy.",
    page: req.baseUrl,
    subpage: req.path
  });
});

module.exports = router;