/**
 * Метод GET-запросов к API инстаграма
 */
var https = require('https');

exports.get = function (path, token) {
    // return new pending promise
    return new Promise(function (resolve, reject) {
        var options = {
            hostname: 'api.instagram.com',
            method: 'GET',
            path: path + '?access_token=' + token,
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
