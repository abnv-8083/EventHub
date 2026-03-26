import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/users/user.js';

export default function(passport) {
    // 1. The Google Strategy
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "http://localhost:5000/user/google/callback"
      },
      async function(accessToken, refreshToken, profile, done) {
        try {
            // 1. Search by Google ID
            let existingUser = await User.findOne({ googleId: profile.id });
            if (existingUser) {
                return done(null, existingUser);
            }

            // 2. Search by Email to handle existing local accounts
            const email = profile.emails[0].value;
            let userWithEmail = await User.findOne({ email: email });

            if (userWithEmail) {
                // User exists (either local or Google), seamlessly link and login
                if (!userWithEmail.googleId) {
                    userWithEmail.googleId = profile.id;
                    userWithEmail.isGoogle = true; // Mark as Google linked
                    await userWithEmail.save();
                }
                return done(null, userWithEmail);
            }

            // 3. Create new user if not found
            let avatarUrl;
            if (profile.photos && profile.photos.length > 0) {
                avatarUrl = profile.photos[0].value;
            }

            const newUser = new User({
                googleId: profile.id,
                email: email,
                name: profile.displayName,
                ...(avatarUrl && { avatar_url: avatarUrl }),
                status: "Active", // Google users are pre-verified
                isGoogle: true
            });
            await newUser.save();
            return done(null, newUser);
        } catch (err) {
            console.error("Google Auth Error:", err);
            return done(err, null);
        }
      }
    ));

    // 2. Serialize User
    passport.serializeUser((user, done) => {
        done(null, user.id); 
    });

    // 3. Deserialize User
    passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findById(id);
            done(null, user);
        } catch (err) {
            done(err, null);
        }
    });
};