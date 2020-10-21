const bcrypt = require('bcrypt');
const user_role = require('../models').user_role;
const User = require('../models').user;
const passportJWT = require("passport-jwt");
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;
const LocalStrategy = require('passport-local').Strategy;

module.exports = function (passport) {
    passport.use('local-signup', new LocalStrategy(
        {
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true
        }, function (req, email, password, done) {
            const generateHash = function (password) {
                return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
            }
            user_role.findOne({
                where: {
                    email: email
                }
            }).then(function (user) {
                if (user) {
                    return done(null, false, {
                        message: 'email is already taken'
                    })
                }
                const userPassword = generateHash(password);
                if(req.body.role == 'user'){
                    const data = {
                        name: req.body.name,
                        email: req.body.email,
                    }
                    User.create(data)
                        .then(function (newUser, created) {
                            if (!newUser) {
                                return done(null, false);
                            }
                            if (newUser) {
                                return done(null, newUser);
                            }
                        }).catch(function (err) {
                            console.log("Error:", err);
                            return done(null, false, {
                                message: 'Something went wrong with your SignUp'
                            });
                        });
                    user_role.create({
                        email: data.email,
                        password: userPassword,
                        name: data.name,
                        role: 'user'
                    })
                    .then(function (newUser, created) {
                        if (!newUser) {
                            return done(null, false);
                        }
                        if (newUser) {
                            console.log(newUser)
                            return done(null, newUser);
                        }
                    }).catch(async function (err) {
                        await artist.destroy({where: {email: data.email}})
                        return done(null, false, {
                            message: 'Something went wrong with your SignUp'
                        });
                    });
                }else{
                    const data= {
                        email: req.body.email,
                        password: userPassword,
                        name: req.body.name,
                        role: req.body.role
                    }
                    user_role.create(data)
                    .then(function (newUser, created) {
                        if (!newUser) {
                            return done(null, false);
                        }
                        if (newUser) {
                            return done(null, newUser);
                        }
                    })
                    .catch(async function (err) {
                        return done(null, false, {
                            message: 'Something went wrong with your SignUp'
                        });
                    });
                }
            });
        }
    ))

    passport.use('user-signin', new LocalStrategy(
        {
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true
        },
        function (req, email, password, done) {
            var isValidPassword = function (userpass, password) {
                return bcrypt.compareSync(password, userpass);
            }
            console.log("logged to", email)
            user_role.findOne({
                where: {
                    email: email
                }
            }).then( async function (user) {
                if (!user) {
                    return done(null, false, {
                        message: 'email or password is incorrect.'
                    });
                }
                if (!isValidPassword(user.password, password)) {
                    return done(null, false, {
                        message: 'email or password is incorrect.'
                    });
                }else{
                var userinfo = user.get();
                return done(null, userinfo);
                }
            }).catch(function (err) {
                console.log("Error:", err);
                return done(null, false, {
                    message: 'Failed to login.'
                });
            });
        }
    ));

    passport.use(new JWTStrategy({
        jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
        secretOrKey: 'your_jwt_secret'
    },
        function (jwtPayload, done) {
            return user_role.findByPk(jwtPayload.id)
                .then(user => {
                    return done(null, user);
                })
                .catch(err => {
                    return done(err);
                });
        }
    ));

    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function (id, done) {
        user_role.findByPk(id).then(function (user) {
            done(null, user);
        }).catch(function (err) {
            done(err, null);
        });
    });
}