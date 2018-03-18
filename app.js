// Module dependencies.
import path from 'path';
import chalk from 'chalk';
import lusca from 'lusca';
import multer from 'multer';
import logger from 'morgan';
import dotenv from 'dotenv';
import express from 'express';
import passport from 'passport';
import flash from 'express-flash';
import bodyParser from 'body-parser';
import compression from 'compression';
import session from 'express-session';
import sass from 'node-sass-middleware';
import errorHandler from 'errorhandler';
import expressValidator from 'express-validator';
import routes from './server/routes/routes';

dotenv.config();

// Set up express app
const server = express();
const router = express.Router();

// Port configuration
const port = parseInt(process.env.PORT, 10) || 1981;

// Set up defaults
const upload = multer({ dest: path.join(__dirname, 'uploads') });

// API keys and Passport configuration.
// const passportConfig = require('./server/config/passport');

// Express configuration.
server.use(compression());
server.set('view engine', 'pug');
server.use(sass({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public')
}));

// Log requests to the console
server.use(logger('dev'));

// Parse incoming request data
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: true }));
server.use(expressValidator());
server.use(session({
  resave: true,
  saveUninitialized: true,
  secret: process.env.SESSION_SECRET
}));
server.use(passport.initialize());
server.use(passport.session());
server.use(flash());
server.use((req, res, next) => {
  lusca.csrf()(req, res, next);
});
server.use(lusca.xframe('SAMEORIGIN'));
server.use(lusca.xssProtection(true));
server.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});

server.use(express.static(path.join(__dirname, 'public'), { maxAge: 31557600000 }));

// Error Handler.
server.use(errorHandler());

routes(router);

// Use the route manager here.
server.use('/', router);

// Handle 500 error. Set up all default catch-all route that sends a message in JSON format
server.use((error, req, res, next) => {
  res.status(error.status || 500);

  // respond with html page
  if (req.accepts('html')) {
    res.render('500', { title: '500: Internal Server Error', Error: error });
    return;
  }

  // respond with json
  if (req.accepts('json')) {
    res.send({ message: 'That route does not exist', title: '500: Route Not Found' });
    return;
  }

  // default to plain-text. send()
  res.type('txt').send('Not found');
});

// Handle 404 error. Set up all default catch-all route that sends a message in JSON format
server.use((req, res) => {
  res.status(404);

  // respond with html page
  if (req.accepts('html')) {
    res.render('404', { url: req.url, title: '404: File Not Found' });
    return;
  }

  // respond with json
  if (req.accepts('json')) {
    res.send({ message: 'That route does not exist', title: '404: Route Not Found' });
    return;
  }

  // default to plain-text. send()
  res.type('txt').send('Not found');
});

server.listen(port, () => {
  console.log('%s Server is running at http://localhost:%d in %s mode', chalk.green('✓'), port, server.get('env'));
  console.log('  Press CTRL-C to stop\n');
});

export default server;
