// config/passport-setup.js
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const db = require('./models/index');

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    db.query('SELECT * FROM users WHERE id = ?', [id], (err, results) => {
        done(err, results[0]);
    });
});

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/auth/google/callback',
}, (accessToken, refreshToken, profile, done) => {
    db.query('SELECT * FROM users WHERE google_id = ?', [profile.id], (err, results) => {
        if (results.length > 0) {
            done(null, results[0]);
        } else {
            const newUser = {
                google_id: profile.id,
                display_name: profile.displayName,
                email: profile.emails[0].value,
            };
            db.query('INSERT INTO users SET ?', newUser, (err, results) => {
                newUser.id = results.insertId;
                done(null, newUser);
            });
        }
    });
}));
