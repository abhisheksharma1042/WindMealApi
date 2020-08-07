const ErrorResponse = require('../utils/errorResponse');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };

  error.message = err.message;
  //Log to console for dev
  console.log(err);

  //Mongoose bad object ID
  if (err.name === 'CastError') {
    const msg = `Resource not found`;
    error = new ErrorResponse(msg, 404);
  }

  //Mongoose duplicate key
  if (err.code === 11000) {
    console.log(err.code);
    const msg = 'Duplicate field value entered';
    error = new ErrorResponse(msg, 400);
  }

  //Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const msg = Object.values(err.errors).map((val) => val.message);
    error = new ErrorResponse(msg, 404);
  }

  console.log(err.name.brightMagenta);
  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error',
  });
};

module.exports = errorHandler;
