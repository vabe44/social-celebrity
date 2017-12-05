module.exports = {
    isLoggedIn: function(req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        } else {
            req.flash("error", "You must be logged in to do that.");
            res.redirect('/login');
        }
    },

    isAdmin: function(req, res, next) {
        if (res.locals.currentUser.role === "admin") {
            return next();
        } else {
            req.flash("error", "You don't have permissions to do that.");
            res.redirect('back');
        }
    },

    asyncMiddleware: function(fn) {
        return function (req, res, next) {
          Promise.resolve(fn(req, res, next)).catch(next);
        };
    },
}