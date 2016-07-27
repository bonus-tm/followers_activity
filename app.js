var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var auth = require('./routes/auth');
var api = require('./routes/api');

const querystring = require('querystring');
const https = require('https');

const instagramLoginUrl = 'https://api.instagram.com/oauth/authorize/'+
    '?client_id=3cc594dd9c8a4580a66fc7138a7518c5'+
    '&redirect_uri=http://localhost:8000/auth'+
    '&response_type=code'+
    '&scope=basic+follower_list+public_content';

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


//
app.use('/auth', auth);
app.use('/api', api);

app.get('/', function (req, res, next) {
    console.log('cookie:', req.cookies.token);
    res.render('index', {
        title: 'Express',
        auth: !!req.cookies.token,
        instagramLoginUrl: instagramLoginUrl
    });
});


// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
