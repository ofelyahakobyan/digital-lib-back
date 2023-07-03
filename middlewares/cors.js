const ALLOW = ['http://localhost:3000', 'http://localhost:3001'];

const cors = (req, res, next) => {
  try {
    const { origin } = req.headers;
    if (ALLOW.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader(
        'Access-Control-Allow-Methods',
        'GET, POST, PUT, DELETE, PATCH',
      );
      res.setHeader(
        'Access-Control-Allow-Headers',
        'Authorization, X-Token, Content-Type',
      );
    }
    next();
  } catch (er) {
    next(er);
  }
};
export default cors;
