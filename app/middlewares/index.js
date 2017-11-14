module.exports = {
    isLoggedIn: function(req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        } else {
            req.session.previousUrl = req.originalUrl;
            res.redirect('/login');
        }
        
    }
}