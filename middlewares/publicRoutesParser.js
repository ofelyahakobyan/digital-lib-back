const { BASE_URL } = process.env;

const PUBLIC_ROUTES = [
  `GET:${BASE_URL}`,
  `GET:${BASE_URL}/`,
  `POST:${BASE_URL}/user/registration`,
  `POST:${BASE_URL}/user/login`,
  `POST:${BASE_URL}/user/password-forgot`,
  `POST:${BASE_URL}/user/password-reset`,
  `GET:${BASE_URL}/authors`,
  `GET:${BASE_URL}/categories`,
  `GET:${BASE_URL}/reviews`,
];

const publicRoutesParser = (req, res, next) => {
  const { method, path } = req;
  if (PUBLIC_ROUTES.includes(`${method}:${path}`)) {
    req.public = 'public';
    return next();
  }
  return next();
};
export default publicRoutesParser;
