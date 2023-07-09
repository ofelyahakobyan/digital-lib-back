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
        },
        (accessToken, refreshToken, profile, cb) => {
          console.log(profile.id);
          return cb(null, profile);
        },
      ),
    );
    passport.serializeUser((user, cb) => cb(null, user));
    passport.deserializeUser((user, cb) => cb(null, user));
    return next();
  } catch (er) {
    return next(er);
  }
};
export default facebookAuth;
