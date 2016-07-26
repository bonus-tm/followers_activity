var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');

const querystring = require('querystring');
const https = require('https');

var access_token = false;
var user = {};

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

// app.use('/', routes);
app.use('/users', users);
// app.use('/auth', auth);

app.get('/', function (req, res, next) {
    res.render('index', {
        title: 'Express',
        access_token: access_token
    });
});


app.get('/auth', function (req, res, next) {
    if (req.query.error) {
        res.render('auth_failed', {
            error: {
                error: req.query.error,
                error_reason: req.query.error_reason,
                error_description: req.query.error_description
            }
        });
    } else if (!access_token) {
        var post_data = querystring.stringify({
            client_id: '3cc594dd9c8a4580a66fc7138a7518c5',
            client_secret: 'c4c58753d3e848d2baa2ccc1ee8516df',
            grant_type: 'authorization_code',
            redirect_uri: 'http://localhost:8000/auth',
            code: req.query.code
        });
        var options = {
            hostname: 'api.instagram.com',
            port: 443,
            path: '/oauth/access_token',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(post_data)
            }
        };

        var data = '';
        var request = https.request(options, function (response) {
            console.log('https requested');
            response.on('data', function (chunk) {
                data += chunk;
            });
            response.on('end', function () {
                console.log('data received:');
                // console.log(data);
                console.log(req.originalUrl);
                data = JSON.parse(data);
                access_token = data.access_token;

                res.redirect('/');
            });
        });
        request.write(post_data);
        request.end();
    } else {
        res.redirect('/');
    }
});


app.get('/api/auth', function (req, res, next) {
    if (req.query.error) {
        res.json({
            error: req.query.error,
            error_reason: req.query.error_reason,
            error_description: req.query.error_description
        });
    } else if (!access_token) {
        var post_data = querystring.stringify({
            client_id: '3cc594dd9c8a4580a66fc7138a7518c5',
            client_secret: 'c4c58753d3e848d2baa2ccc1ee8516df',
            grant_type: 'authorization_code',
            redirect_uri: 'http://localhost:8000/auth',
            code: req.query.code
        });
        var options = {
            hostname: 'api.instagram.com',
            port: 443,
            path: '/oauth/access_token',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(post_data)
            }
        };

        var data = '';
        var request = https.request(options, function (response) {
            console.log('https requested');
            response.on('data', function (chunk) {
                data += chunk;
            });
            response.on('end', function () {
                console.log('data received:');
                data = JSON.parse(data);

                access_token = data.access_token;
                user = data.user;

                res.json(data);
            });
        });
        request.write(post_data);
        request.end();
    } else {
        res.json({
            access_token: access_token,
            user: user
        });
    }
});

app.get('/api/recent', function (req, res, next) {
    
    var options = {
        hostname: 'api.instagram.com',
        port: 443,
        path: '/v1/users/self/media/recent/?access_token=' + access_token,
        method: 'GET'
    };
    var data = '';
    var request = https.request(options, function (response) {
        console.log('https requested recent media');
        response.on('data', function (chunk) {
            data += chunk;
        });
        response.on('end', function () {
            console.log('recent media data received');
            data = JSON.parse(data);
            res.render('recent', data);
        });
    });
    request.end();
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
