var models = require("../../models");
const Op = models.Sequelize.Op;

//load bcrypt
var bCrypt = require('bcrypt-nodejs');

module.exports = function (passport, user) {

    var User = user;
    var LocalStrategy = require('passport-local').Strategy;
    //serialize
    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    // deserialize user
    passport.deserializeUser(function (id, done) {
        User.findById(id).then(function (user) {
            if (user) {
                done(null, user.get());
            } else {
                done(user.errors, null);
            }
        });
    });
    // LOCAL SIGNUP
    passport.use('local-signup', new LocalStrategy({
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true // allows us to pass back the entire request to the callback
        },

        function (req, email, password, done) {
            User.findOne({
                where: {
                    [Op.or]: [
                        {email: email},
                        {username: req.body.username}
                    ]
                }
            }).then(function (user) {

                if (user) {
                    return done(null, false, {
                        message: 'That email and/or username is already taken'
                    });
                } else {
                    var userPassword = models.User.generateHash(password);

                    var data = {
                        email: email,
                        password: userPassword,
                        username: req.body.username
                    };

                    User.create(data).then(function (newUser, created) {
                        if (!newUser) {
                            return done(null, false);
                        }

                        if (newUser) {
                            return done(null, newUser);
                        }
                    });
                }
            });
        }
    ));

    //LOCAL SIGNIN
    passport.use('local-signin', new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true // allows us to pass back the entire request to the callback
        },

        function (req, email, password, done) {
            var User = user;

            var isValidPassword = function (userpass, password) {
                return bCrypt.compareSync(password, userpass);
            }

            User.findOne({
                where: {
                    email: email
                }
            }).then(user => {

                if (!user) {
                    return done(null, false, {
                        message: 'Email does not exist'
                    });
                }

                if (!isValidPassword(user.password, password)) {
                    return done(null, false, {
                        message: 'Incorrect password.'
                    });
                }

                user.update({
                    last_login: Date.now()
                })
                .then(() => {
                    var userinfo = user.get();
                    return done(null, userinfo);
                })

            }).catch(err => {
                console.log("Error:", err);
                return done(null, false, {
                    message: 'Something went wrong with your Signin'
                });
            });
        }
    ));

}