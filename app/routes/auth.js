module.exports = function(app, passport) {

    /* GET signup page. */
    app.get('/signup', function (req, res, next) {
        res.render('signup', {
            title: "Signup — Social-Celebrity.com",
            description: "",
            page: req.baseUrl,
            subpage: req.path,
        });
    });

    /* POST signup page. */
    app.post('/signup', passport.authenticate('local-signup', {
            successRedirect: '/dashboard',
            failureRedirect: '/signup'
        }
    ));

    /* GET login page. */
    app.get('/login', function (req, res, next) {
        res.render('login', {
            title: "Login — Social-Celebrity.com",
            description: "",
            page: req.baseUrl,
            subpage: req.path,
        });
    });

    /* POST login page. */
    app.post('/login', passport.authenticate('local-signin', {
            successRedirect: '/dashboard',
            failureRedirect: '/login'
        }
    ));

    /* GET logout page. */
    app.get('/logout', function (req, res, next) {
        req.session.destroy(function(err) {
            res.redirect('/');
        });
    });

}