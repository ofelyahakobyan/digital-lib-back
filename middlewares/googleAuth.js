import passport from 'passport';
import Strategy from 'passport-google-oauth20';

const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_CALLBACK_URL } = process.env;

const googleAuth = (req, res, next) => {
  try {
    passport.use(
      new Strategy(
        {
          clientID: GOOGLE_CLIENT_ID,
          clientSecret: GOOGLE_CLIENT_SECRET,
          callbackURL: GOOGLE_CALLBACK_URL,
        },
        async (request, accessToken, refreshToken, profile, cb) => cb(null, profile),
      ),
    );
    passport.serializeUser((user, cb) => cb(null, user));
    passport.deserializeUser((user, cb) => cb(null, user));
    // passport.initialize();
    return next();
  } catch (er) {
    return next(er);
  }
};
export default googleAuth;
