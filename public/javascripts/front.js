/**
 * Created by btm on 25/07/16.
 */
var auth = false;
var Factive = null;
var $content = null;

$(function () {
    auth = $('body').data('auth');
    $content = $('.content');
    
    if (auth) {
        if (localStorage.Factive) {
            Factive = JSON.parse(localStorage.Factive);
        } else {
            Factive = {};
            console.log('has to load followersIds');
            $.get('/api/followersIds', function (json) {
                Factive.followersIds = json;
                localStorage.Factive = JSON.stringify(Factive);
                console.log('followersIds loaded');
            });
        }
        console.log('followersIds', Factive.followersIds);

        loadMore();
    }

    $(document).on('click', '#load-more', loadMore);
});

function loadMore() {
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