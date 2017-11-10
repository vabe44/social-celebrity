var authController = require('../controllers/authcontroller.js');

module.exports = function(app, passport) {
    app.get('/signup', authController.signup);
    app.get('/login', authController.login);

    app.post('/signup', passport.authenticate('local-signup', {
            successRedirect: '/dashboard',
            failureRedirect: '/signup'
        }
    ));

    app.post('/login', passport.authenticate('local-signin', {
            successRedirect: '/dashboard',
            failureRedirect: '/login'
        }
    ));

    app.get('/logout', authController.logout);
    app.get('/dashboard', isLoggedIn, authController.dashboard);

    function isLoggedIn(req, res, next) {
        if (req.isAuthenticated())
            return next();
        res.redirect('/login');
    }

}