const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');


passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: '/api/auth/google/callback',
        },
        async(accessToken, refreshToken, profile, done) => {
            try {
                let user = await User.findOne({ googleId: profile.id });
                if (user){
                    return done(null, user);
                }

                user = await User.findOne({ email: profile.email[0].value });

                if(user){
                    user.googleId = profile.id;
                    user.profilePicture = profile.photos[0].value;
                    await user.save();
                    return done(null, user);
                }

                const newUser = await  User.create({
                    googleId: profile.id,
                    email: profile.emails[0].value,
                    fullName: profile.displayName,
                    profilePicture: profile.photos[0].value,
                    emailVerified: true,
                });

                done(null, newUser);
            } catch (error) {
                done(error, null)
            }
        }
    )
);

module.exports = passport;