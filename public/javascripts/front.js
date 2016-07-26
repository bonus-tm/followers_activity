/**
 * Created by btm on 25/07/16.
 */
var access_token = false;
var user = {};

$(function () {
    // if (!access_token) {
    //     $('body').append('<div id="auth">Need to authorize...</div>');
    //
    //     $.ajax('https://api.instagram.com/oauth/authorize/', {
    //         data: {
    //             client_id: '3cc594dd9c8a4580a66fc7138a7518c5',
    //             redirect_uri: 'http://localhost:8000/api/auth',
    //             response_type: 'code',
    //             scope: 'basic+follower_list+public_content'
    //         },
    //         success: function (data) {
    //             access_token = data.access_token;
    //             user = data.user;
    //             $('#auth').remove();
    //             $(document).trigger('authorized');
    //         }
    //     });
    // }
    //
    // $(document).on('authorized', function () {
    //     $('body').append('<div >Yay! We\'ve got access!</div>');
    // });

    access_token = $('#access_token').data('access_token');
    console.log(access_token);

    if (!access_token) {
        $('body').append('<div id="auth">Need to authorize...</div>');
    } else {
        $('body').append('<div >Yay! We\'ve got access!</div>');

        // $.ajax('https://api.instagram.com/v1/users/self/media/recent/', {
        //     dataType: 'jsonp',
        //     data: {access_token: access_token},
        //     success: function (response) {
        //         console.log(response);
        //
        //         var html = '';
        //         for (var i in response.data) {
        //             html += '<div>' +
        //                 '<img src="' + response.data[i].images.thumbnail.url + '">' +
        //                 '<div>Likes: ' + response.data[i].likes.count + '</div>' +
        //                 '</div>';
        //         }
        //         $('body').append(html);
        //     }
        // });
        $.get('/api/recent', function (html) {
            $('body').append(html);
        });
    }
});