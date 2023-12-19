const ALLOW = ['http://localhost:3000', 'http://localhost:3001'];

const cors = (req, res, next) => {
  try {
    const { origin } = req.headers;
    if (ALLOW.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader(
        'Access-Control-Allow-Methods',
        'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        'OPTIONS',
      );
      res.setHeader(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization, X-Token, Range, range',
      );
      if (req.method === 'OPTIONS') {
        // Handle OPTIONS request (pre-flight)
        res.sendStatus(200);
      }
    }
    next();
  } catch (er) {
    next(er);
  }
};
export default cors;
