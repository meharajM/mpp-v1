/* eslint consistent-return:0 import/order:0 */
const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const logger = require('./logger');
const Mongoose = require('./db/db.js')
const apiRouter = require('./routes/index');
const argv = require('./argv');
const port = require('./port');
const setup = require('./middlewares/frontendMiddleware');
const isDev = process.env.NODE_ENV !== 'production';
// const ngrok =
//   (isDev && process.env.ENABLE_TUNNEL) || argv.tunnel
//     ? require('ngrok')
//     : false;
const { resolve } = require('path');

const app = express();

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  }),
);
const options = {
  autoIndex: false, // Don't build indexes
  maxPoolSize: 10, // Maintain up to 10 socket connections
  serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  family: 4 // Use IPv4, skip trying IPv6
};

Mongoose.connect(process.env.MONGODB_URL,options);

// If you need a backend, e.g. an API, add your custom backend-specific middleware here
// app.use('/api', myApi);
app.use('/api', apiRouter);

// In production we need to pass these values in instead of relying on webpack
setup(app, {
  outputPath: resolve(process.cwd(), 'build'),
  publicPath: '/',
});

// get the intended host and port number, use localhost and port 3000 if not provided
const customHost = argv.host || process.env.HOST;
const host = customHost || null; // Let http.Server use its default IPv6/4 host
const prettyHost = customHost || 'localhost';

// use the gzipped bundle
app.get('*.js', (req, res, next) => {
  req.url = req.url + '.gz'; // eslint-disable-line
  res.set('Content-Encoding', 'gzip');
  next();
});
// Start your app.
app.listen(port, host, async err => {
  if (err) {
    return logger.error(err.message);
  }
  console.log(`Server Started on port: ${port}`);

  // Connect to ngrok in dev mode
  // if (ngrok) {
  //   let url;
  //   try {
  //     url = await ngrok.connect(port);
  //   } catch (e) {
  //     return logger.error(e);
  //   }
  //   logger.appStarted(port, prettyHost, url);
  // } else {
  //   logger.appStarted(port, prettyHost);
  // }
  logger.appStarted(port, prettyHost);
});
