const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const morgan = require('morgan');
const colors = require('colors');
const fileupload = require('express-fileupload');
const errorHandler = require('./middleware/error');
const connectDB = require('./config/db');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const cors = require('cors');
colors.enable();

//Load env vars
dotenv.config({ path: './config/config.env' });

// Connect to database
connectDB();

//Route files
const farms = require('./routes/farms');
const products = require('./routes/products');
const auth = require('./routes/auth');
const users = require('./routes/users');
const reviews = require('./routes/reviews');

const app = express();

// Body parser
app.use(express.json());

// Cookie parser
app.use(cookieParser());

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// File uploading
app.use(fileupload());

// Sanitize data
app.use(mongoSanitize());

// Set security headers
app.use(helmet());

// Prevent XSS attacks
app.use(xss());

// Rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 mins
  max: 100,
});
app.use(limiter);

// Prevent http param pollution
app.use(hpp());

// Enable CORS
app.use(cors());

// Rate limiting
const resetPasswordLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 mins
  max: 1,
});

// Rate limiting
const forgotPasswordLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 mins
  max: 1,
});

app.use('/api/v1/auth/forgotpassword', forgotPasswordLimiter);
app.use('/api/v1/auth/resetpassword/:resetToken', resetPasswordLimiter);

//Mount routers
app.use('/api/v1/farms', farms);
app.use('/api/v1/products', products);
app.use('/api/v1/auth', auth);
app.use('/api/v1/users', users);
app.use('/api/v1/reviews', reviews);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.use('/', express.static('public_html'));

const server = app.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  )
);

//Handle unhandled promise rejections

process.on('unhandledRejection', (err) => {
  console.log(`Error: ${err.message}`.red);
  //Close server and exit process
  server.close(() => process.exit(1));
});