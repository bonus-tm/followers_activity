/**
 * Created by btm on 25/07/16.
 */
var auth = false;
var followers_ids = [];

$(function () {
    auth = $('body').data('auth');


    if (!auth) {
        $('body').append('<div id="auth">Need to authorize...</div>');
    } else {
        $('body').append('<div>Yay! We\'ve got access!</div>');

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
                $('body').append(html);
            }
        });
    }
});
