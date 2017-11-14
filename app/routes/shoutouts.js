var express = require('express');
var router = express.Router();

/* GET shoutouts page. */
router.get('/', function (req, res, next) {
    res.render('shoutouts/index', {
        title: "Shoutouts",
        description: "Is this your first time buying followers for your profile? Our frequently asked questions page is regularly updated to answer the most common questions.",
        page: req.path
    });
});

module.exports = router;