/**
 * Created by btm on 27/07/16.
 */

var express = require('express');
var router = express.Router();

var instagram = require('../funcs/instagram');

// load self followers
router.get('/followers_ids', function (req, res, next) {
    instagram.get('/v1/users/self/followed-by', req.cookies.token)
        .then(function (json) {
            console.log('followers data received');
            var followers_ids = json.data.reduce(function (prev, cur) {
                prev.push(cur.id * 1);
                return prev;
            }, []);

            res.json(followers_ids);
        });
});

// загрузка списка последних постов
router.post('/recent', function (req, res, next) {
    console.log('post data:', req.body, typeof req.body);
    // followers_ids = JSON.parse(req.body);
    // console.log('followers_ids:', followers_ids, typeof followers_ids);

    instagram.get('/v1/users/self/media/recent/', req.cookies.token)
        .then(function (json) {
            console.log('recent media data received');

            for (var i = 20; i > 3; i--) {
                json.data.pop();
            }

            var getLikes = function (post, i, data) {
                return new Promise(function (resolve, reject) {
                    console.log('request likes of media', post.id);
                    instagram.get('/v1/media/' + post.id + '/likes', req.cookies.token)
                        .then(function (likes) {
                            console.log('received likes of media', post.id);
                            data[i].likes.followers_likes = 0;
                            if (req.body.length > 0) {
                                likes.data.forEach(function (user_liked) {
                                    var index_found = req.body.findIndex(function (id) {
                                        console.log('findIndex', id);
                                        return id == user_liked.id;
                                    });
                                    if (index_found !== -1) {
                                        data[i].likes.followers_likes++;
                                    }
                                });
                            }
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

module.exports = router;
