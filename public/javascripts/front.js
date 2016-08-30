/**
 * Created by btm on 25/07/16.
 */
var auth = false;
var Factive = {};
var $content = null;

var followersIdsUpdateInterval = 60 * 60 * 1000; // 1 hour
var loadingMessage = '<div id="loading" class="text-center text-muted">' +
    '<div class="spinner">' +
    '<div class="bounce1"></div>' +
    '<div class="bounce2"></div>' +
    '<div class="bounce3"></div>' +
    '</div>' +
    '<p>Loading data from Instagram, please wait a&nbsp;moment...</p>' +
    '</div>';

$(function () {
    auth = $('body').data('auth');
    $content = $('.content');

    if (auth) {
        var init = new Promise(function (resolve, reject) {
            Factive = JSON.parse(localStorage.getItem('Factive')) || {};

            if (Factive && Factive.updated && Factive.updated < Date.now() + followersIdsUpdateInterval) {
                resolve();
            } else {
                $content.append(loadingMessage);
                $.ajax('/api/followersIds', {
                    method: 'GET',
                    contentType: 'application/json',
                    timeout: 30 * 1000
                }).then(function (json) {
                    Factive.followersIds = json;
                    Factive.updated = Date.now();
                    localStorage.setItem('Factive', JSON.stringify(Factive));
                    resolve();
                });
            }
        });

        init.then(loadPosts);
    }

    $(document).on('click', '#load-more', loadPosts);
});

function loadPosts() {
    $('#load-more, #loading').remove();
    $content.append(loadingMessage);

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