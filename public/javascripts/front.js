/**
 * Created by btm on 25/07/16.
 */
var auth = false;
var followers_ids = [];
var $content = null;

$(function () {
    auth = $('body').data('auth');
    $content = $('.content');


    if (auth) {
        if (localStorage.followers_ids) {
            followers_ids = JSON.parse(localStorage.followers_ids);
        } else {
            console.log('has to load followers_ids');
            $.get('/api/followers_ids', function (json) {
                followers_ids = json;
                localStorage.followers_ids = JSON.stringify(followers_ids);
                console.log('followers_ids loaded');
            });
        }
        console.log('followers_ids', followers_ids);


        $.ajax('/api/recent', {
            data: JSON.stringify(followers_ids),
            method: 'POST',
            contentType: 'application/json',
            timeout: 30 * 1000,
            success: function (html) {
                $('#loading').remove();
                $content.append(html);
            }
        });
    }
});
