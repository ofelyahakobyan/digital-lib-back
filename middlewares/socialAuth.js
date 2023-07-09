import passport from 'passport';
import Strategy from 'passport-facebook';

const { FACEBOOK_APP_ID, FACEBOOK_APP_SECRET } = process.env;

const facebookAuth = (req, res, next) => {
  try {
    passport.use(
      new Strategy(
        {
          clientID: FACEBOOK_APP_ID,
          clientSecret: FACEBOOK_APP_SECRET,
          callbackURL: 'http://localhost:4000/api/v1/user/facebook',
          session: false,
        },
        (accessToken, refreshToken, profile, cb) =>
          // Here should be logic for creating a new user or finding one if it exists.
          // If the user is valid jwt token should be sent to the frontend.
          cb(null, profile)
        ,
      ),
    );
    passport.serializeUser((user, cb) => cb(null, user));
    passport.deserializeUser((user, cb) => cb(null, user));
    passport.initialize();
    return next();
  } catch (er) {
    return next(er);
  }
};
export default facebookAuth;
