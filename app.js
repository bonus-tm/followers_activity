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
var followers_ids = [];

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


// load self followers
app.get('/api/recent', function (req, res, next) {
    if (followers_ids.length) {
        next();
    } else {
        getInstagramJson('/v1/users/self/followed-by?access_token=' + access_token)
            .then(function (json) {
                console.log('followers data received');
                followers_ids = json.data.reduce(function (prev, cur) {
                    prev.push(cur.id);
                    return prev;
                }, []);
        
                next();
            });
    }
});
app.get('/api/recent', function (req, res, next) {
    getInstagramJson('/v1/users/self/media/recent/?access_token=' + access_token)
        .then(function (json) {
            console.log('recent media data received');
            for (var i = 20; i > 10; i--) {
                json.data.pop();
            }

            var getLikes = function (post, i, data) {
                return new Promise(function (resolve, reject) {
                    getInstagramJson('/v1/media/' + post.id + '/likes?access_token=' + access_token)
                        .then(function (likes) {
                            data[i].likes.followers_likes = 0;
                            likes.data.forEach(function(user_liked){                                
                                let index_found = followers_ids.findIndex(function(id){
                                    return id == user_liked.id;
                                });
                                if (index_found !== -1) {
                                    data[i].likes.followers_likes++;
                                }
                            });
                            data[i].likes.ratio = data[i].likes.followers_likes / data[i].likes.count;
                            data[i].likes.users = likes;
                            resolve();
                        });
                });
            };

            var results = Promise.all(json.data.map(getLikes));

            results.then(function () {
                console.log('All promises resolved');
                res.render('recent', json);
            });
        });
});


const getInstagramJson = function (path) {
    // return new pending promise
    return new Promise(function (resolve, reject) {
        var options = {
            hostname: 'api.instagram.com',
            method: 'GET',
            path: path,
            port: 443
        };
        const request = https.get(options, function (response) {
            console.log('HTTPS requested', path);

            // handle http errors
            if (response.statusCode < 200 || response.statusCode > 299) {
                reject(new Error('Failed to load page, status code: ' + response.statusCode));
            }
            // temporary data holder
            var body = [];
            // on every content chunk, push it to the data array
            response.on('data', function (chunk) {
                body.push(chunk);
            });
            // we are done, resolve promise with those joined chunks
            response.on('end', function () {
                console.log('HTTPS finished', path);
                resolve(JSON.parse(body.join('')));
            });
        });
        // handle connection errors of the request
        request.on('error', function (err) {
            console.error('error');
            reject(err);
        });
        request.end();
    });
};

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
