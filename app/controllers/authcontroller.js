var exports = module.exports = {}
var OAuth = require('client-oauth2');
// Configure the OAuth 2.0 Client
var oauth = new OAuth({
    clientId: process.env.STRIPE_CLIENTID,
    clientSecret: process.env.STRIPE_SECRETKEY,
    scopes: ['read_write'],
    redirectUri: process.env.STRIPE_REDIRECTURI,
    authorizationUri: 'https://connect.stripe.com/oauth/authorize',
    accessTokenUri: 'https://connect.stripe.com/oauth/token'
});


exports.signup = function(req, res) {
   res.render('signup');
}

exports.login = function(req, res) {
    res.render('login');
}

exports.dashboard = function(req, res) {
    res.render('dashboard', {
        redirectUri: oauth.code.getUri()
    });
}

exports.logout = function(req, res) {
    req.session.destroy(function(err) {
        res.redirect('/');
    });
}