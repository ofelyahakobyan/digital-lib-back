import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import HttpError from 'http-errors';
import indexRouter from './routes';
import cors from './middlewares/cors';
import authorization from './middlewares/authorization';
import adminAuthorization from './middlewares/adminAuthorization';
import facebookAuth from './middlewares/socialAuth';

const app = express();

const { BASE_URL } = process.env;

app.use(cors);
app.use(facebookAuth);
app.use(adminAuthorization);
app.use(authorization);
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(path.resolve(), 'public')));

app.use(BASE_URL, indexRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  throw HttpError(404, `can't find ${req.originalUrl} on this server`, { error: { message: 'page not found' } });
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.json({
    code: err.status,
    status: 'error',
    message: err.message,
    errors: err.error,
    stack: err.stack,
  });
});

export default app;
