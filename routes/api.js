/**
 * Created by btm on 27/07/16.
 */

var express = require('express');
var router = express.Router();

var instagram = require('../instagram');

// сколько постов доставать за один раз
const perPageCount = 5;


// load self followers
router.get('/followersIds', function (req, res, next) {
    instagram.get('/v1/users/self/followed-by', {access_token: req.cookies.token})
        .then(function (json) {
            var followers_ids = json.data.reduce(function (prev, cur) {
                prev.push(cur.id * 1);
                return prev;
            }, []);

            res.json(followers_ids);
        });
});

// load recent media
router.post('/recent', function (req, res, next) {
    var param = {
        access_token: req.cookies.token,
        count: perPageCount
    };
    if (!!req.body.earliestMediaId) {
        param.max_id = req.body.earliestMediaId;
    }

    instagram.get('/v1/users/self/media/recent/', param)
        .then(function (json) {
            var getLikes = function (post, i, data) {
                return new Promise(function (resolve, reject) {
                    instagram.get('/v1/media/' + post.id + '/likes', {access_token: req.cookies.token})
                        .then(function (likes) {
                            data[i].likes.followersLikes = 0;
                            data[i].likes.ratio = 0;
                            data[i].likes.percent = 0;
                            data[i].likes.users = 0;

                            if (data[i].likes.count > 0) {
                                if (typeof req.body.followersIds !== "undefined" && req.body.followersIds.length > 0) {
                                    likes.data.forEach(function (userLiked) {
                                        var index_found = req.body.followersIds.findIndex(function (id) {
                                            return id == userLiked.id;
                                        });
                                        if (index_found !== -1) {
                                            data[i].likes.followersLikes++;
                                        }
                                    });
                                }
                                data[i].likes.ratio = data[i].likes.followersLikes / data[i].likes.count;
                                data[i].likes.percent = Math.round(post.likes.ratio * 1000) / 10;
                                data[i].likes.users = likes;
                            }
                            resolve();
                        });
                });
            };
            var getComments = function (post, i, data) {
                return new Promise(function (resolve, reject) {
                    instagram.get('/v1/media/' + post.id + '/comments', {access_token: req.cookies.token})
                        .then(function (comments) {
                            data[i].comments.followersComments = 0;
                            data[i].comments.ratio = 0;
                            data[i].comments.percent = 0;
                            data[i].comments.users = 0;

                            if (data[i].comments.count > 0) {
                                if (typeof req.body.followersIds !== "undefined" && req.body.followersIds.length > 0) {
                                    comments.data.forEach(function (comment) {
                                        var index_found = req.body.findIndex(function (id) {
                                            return id == comment.from.id;
                                        });
                                        if (index_found !== -1) {
                                            data[i].comments.followersComments++;
                                        }
                                    });
                                }
                                data[i].comments.ratio = data[i].comments.followersComments / data[i].comments.count;
                                data[i].comments.percent = Math.round(post.comments.ratio * 1000) / 10;
                                data[i].comments.users = comments;
                            }
                            resolve();
                        });
                });
            };

            var results = Promise.all(
                json.data.map(getLikes).concat(json.data.map(getComments))
            );

            results.then(function () {
                res.render('recent', json);
            }).catch(function (err) {
                console.error(err);
            });
        });
});

module.exports = router;
