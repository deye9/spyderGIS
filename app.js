// Module dependencies.
// import cors from 'cors';
import path from 'path';
import lusca from 'lusca';
import multer from 'multer';
import dotenv from 'dotenv';
import express from 'express';
import flash from 'express-flash';
import bodyParser from 'body-parser';
import session from 'express-session';
import sass from 'node-sass-middleware';
import errorHandler from 'errorhandler';
import cookieParser from 'cookie-parser';
import routes from './server/routes/routes';

dotenv.config();

// Set up express app
const server = express();
const router = express.Router();

// Port configuration
const port = parseInt(process.env.PORT, 10) || 1981;

// Set up defaults
const upload = multer({ dest: path.join(__dirname, 'uploads') });

// Express configuration.
// server.use(cors());
server.set('view engine', 'pug');
server.use(sass({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public')
}));

// Parse incoming request data
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: true }));
server.use(cookieParser(process.env.SESSION_SECRET));

const cookieExpirationDate = new Date();
const cookieExpirationDays = 365;
cookieExpirationDate.setDate(cookieExpirationDate.getDate() + cookieExpirationDays);

server.use(session({
  secret: process.env.SESSION_SECRET,
  saveUninitialized: true,
  resave: true,
  cookie: {
    httpOnly: true,
    expires: cookieExpirationDate // use expires instead of maxAge
  }
}));
server.use(flash());
server.use((req, res, next) => {
  lusca.csrf()(req, res, next);
});
server.use(lusca.xframe('SAMEORIGIN'));
server.use(lusca.xssProtection(true));
server.use(express.static(path.join(__dirname, 'public'), { maxAge: 31557600000 }));

// This middleware will check if user's access token is still available.
server.use((req, res, next) => {
  if (req.session.accessToken) {
    res.setHeader('x-access-token', req.session.accessToken);
  }
  next();
});

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
  console.log('Server is running at http://localhost:%d in %s mode', port, server.get('env'));
  console.log('Press CTRL-C to stop\n');
});

export default server;
