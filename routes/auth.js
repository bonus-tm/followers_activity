/**
 * Created by btm on 22/07/16.
 */
var express = require('express');
var router = express.Router();

const querystring = require('querystring');
const https = require('https');

var counter = 0;
var access_token = null;

router.get('/test', function (req, res, next) {
    res.render('authorized', {access_token: 'WTF', user: ['fcuk!']});
});

router.get('/', function (req, res, next) {
    if (req.query.error) {
        res.render('auth_failed', {
            error: {
                error: req.query.error,
                error_reason: req.query.error_reason,
                error_description: req.query.error_description
            }
        });
    } else if (counter < 5) {
        counter++;
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
                console.log(data);
                access_token = data.access_token;
            });
        });
        request.write(post_data);
        request.end();
   }
});

module.exports = router;
exports.access_token = access_token;
