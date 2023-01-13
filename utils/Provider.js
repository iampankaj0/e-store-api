import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { User } from "../models/User.js";

export const connectPassport = () => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
      },
      async function (accessToken, refreshToken, profile, done) {
        // DATABASE WORK START
        const user = await User.findOne({ googleId: profile.id });

        if (!user) {
          const newUser = await User.create({
            name: profile.displayName,
            photo: profile.photos[0].value,
            googleId: profile.id,
          });
          done(null, newUser);
        } else {
          return done(null, user);
        }
      }
    )
  );

  passport.serializeUser(function (user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(async function (id, done) {
    const user = await User.findById(id);
    done(null, user);
  });
};
