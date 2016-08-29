/**
 * Created by btm on 25/07/16.
 */
var auth = false;
var Factive = {};
var $content = null;

var followersIdsUpdateInterval = 60 * 60 * 1000; // 1 hour

$(function () {
    auth = $('body').data('auth');
    $content = $('.content');

    if (auth) {
        var init = new Promise(function (resolve, reject) {
            if (localStorage.Factive) {
                Factive = JSON.parse(localStorage.Factive);
            }

            if (Factive && Factive.updated && Factive.updated < Date.now() + followersIdsUpdateInterval) {
                resolve();
            } else {
                $.ajax('/api/followersIds', {
                    method: 'GET',
                    contentType: 'application/json',
                    timeout: 30 * 1000
                }).then(function (json) {
                    Factive.followersIds = json;
                    Factive.updated = Date.now();
                    localStorage.Factive = JSON.stringify(Factive);
                    resolve();
                });
            }
        });

        init.then(loadPosts);
    }

    $(document).on('click', '#load-more', loadPosts);
});

function loadPosts() {
    $('#load-more').remove();
    $content.append('<div id="loading" class="text-center text-muted">' +
        'Loading data from Instagram, please wait a&nbsp;moment...' +
        '</div>');

    var lastMedia = $('.instagram-media:last');
    if (lastMedia.length) {
        Factive.earliestMediaId = $('.instagram-media:last').data('media_id');
    }

    $.ajax('/api/recent', {
        data: JSON.stringify(Factive),
        method: 'POST',
        contentType: 'application/json',
        timeout: 30 * 1000
    }).then(function (html) {
        $('#loading').remove();
        $content.append(html);
    }).fail(function () {
        $('#loading').remove();
        $content.append('<div class="text-center text-danger">' +
            'Sorry, a problem occurred. Try to reload page.' +
            '</div>');
    });
}