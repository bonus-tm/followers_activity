/**
 * Авторизуется в инстаграме, получает токен и складывает его в куки,
 * а потом редиректит на главную
 */
var express = require('express');
var router = express.Router();

const querystring = require('querystring');
const https = require('https');

router.get('/', function (req, res, next) {
    if (req.query.error) {
        res.render('auth_failed', {
            error: {
                error: req.query.error,
                error_reason: req.query.error_reason,
                error_description: req.query.error_description
            }
        });
    } else if (!res.locals.token) {
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
            console.log('https auth requested');
            response.on('data', function (chunk) {
                data += chunk;
            });
            response.on('end', function () {
                console.log('auth data received');
                data = JSON.parse(data);
                res.cookie('token', data.access_token, {
                    httpOnly: true,
                    maxAge: 1 * 60 * 60 * 1000 // ms, = 1 hour
                });
                res.redirect('/');
            });
        });
        request.write(post_data);
        request.end();
    } else {
        res.redirect('/');
    }
});

module.exports = router;
