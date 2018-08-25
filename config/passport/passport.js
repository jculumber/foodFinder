var bCrypt = require('bcrypt-nodejs');

module.exports = function(passport, user) {

    var User = user;
    var LocalStrategy = require('passport-local').Strategy;
    
    //serialize
    passport.serializeUser(function(ser, done){

        done(null, user.id);

    });

    //deserialize
    passport.deserializeUser(function(id, done){

        User.findById(id).then(function(user){
            if (user) {

                done(null, user.get());

            } else {

                done(user.errors, null);
            }
        });
    });

    passport.use('local-signup', new LocalStrategy(
        {
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true
        }, 
        
        function(req, email, password, done) {

            var generateHash = function(password) {

                return bCrypt.hashSync(password, bCrypt.genSaltSync(8), null);

            };

            User.findOne({
                where: {
                    email: email
                }
            }).then(function(user){
                if(user) {
                    return done(null, false, {
                        message: "That email is already taken"
                    });
                } else {

                    var userPassword = generateHash(password);
                    var data = {
                        
                        email: email,
                        password: userPassword,
                        firstName: req.body.firstName,
                        lastName: req.body.lastName

                    };

                    User.create(data).then(function(newUser, created){

                        if(!newUser) {
                            return done(null, false);
                        } else {
                            return done(null, newUser);
                        }
                    });
                }
            });

        }
    ));

};