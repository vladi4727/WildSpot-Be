const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');

require('dotenv').config();

const registerRouter = require('./routes/register');
const loginRouter = require('./routes/login');
const usersRouter = require('./routes/users');
const campingSpotsRoutes = require('./routes/campingSpots');
const citiesRouter = require('./routes/cities');
const stylesRouter = require('./routes/styles');
const bookingsRouter = require('./routes/bookings');
const reviewsRouter = require('./routes/reviews');
const availabilitiesRouter = require('./routes/availabilities');


const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/register', registerRouter);
app.use('/login', loginRouter);
app.use('/users', usersRouter);
app.use('/api/spots', campingSpotsRoutes);
app.use('/cities', citiesRouter);
app.use('/styles', stylesRouter);
app.use('/bookings', bookingsRouter);
app.use('/reviews', reviewsRouter);
app.use('/availabilities', availabilitiesRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
