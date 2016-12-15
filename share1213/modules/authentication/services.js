'use strict';

angular.module('Authentication')

.factory('AuthenticationService',
    ['Base64', '$http', '$cookieStore', '$rootScope', '$timeout',
    function (Base64, $http, $cookieStore, $rootScope, $timeout) {
        var service = {};

        service.Login = function (username, password, callback) {

            console.log("servive login!");
            var data = $.param({username: username, password: password});
            var config = {
                headers:{
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            };

            $http.post('https://api.theshareapp.co/api/users/login', data, config)
            .success(function(response) {
                console.log("connect successfully!")
                console.log(response);
                if (response.error_message) 
                {
                    response.success = false;
                }
                else
                {
                    console.log("Success: Logged in! seesion_id got!");
                    console.log(response.data.session_id);
                    response.success = true; 
                }
                
                callback(response);
                
            })
            .error(function (response) {
                console.log("get events fail");
                console.log(response);
                response = "Oops! Something wrong in Share server…” ";  
                callback(response);
            }); 

            // Facebook login test
            // var data = $.param({fb_id: "dabiaoge", access_token: "EAAaJpSeKmQEBADdEnY9ZBV07czapm9D6TuTOywiDKZCupIqk7nQ8i4uEzxqZA9k3koiuvzhMbh5rxtGcmwZCFiLixymkk4Hs3bCRaxPjxvXEkMHnCjkP5wlCVLgcOx95rnmRjqW3EXkXfBKnZATUTY8zB7boFjP48bguKaTwvzAZDZD"});
            // var config = {
            //     headers:{
            //         'Content-Type': 'application/x-www-form-urlencoded'
            //     }
            // };

            // $http.post('http://theshareapp.co/api/users/login/fb',data,config)
            // .success(function(response){
            //     console.log("FB log success!");
            //     console.log(response);
            // })
            // .error(function(response){
            //     console.log('unknown error!');

            // });

        };

        service.SetCredentials = function (username, password, id) {
            var authdata = Base64.encode(username + ':' + password);

            $rootScope.globals = {
                currentUser: {
                    username: username,
                    authdata: authdata,
                    sessionid: id
                }
            };

            $cookieStore.put('globals', $rootScope.globals);
        };

        service.ClearCredentials = function () {
            $rootScope.globals = {};
            $cookieStore.remove('globals');
        };

        return service;
    }])

.factory('Base64', function () {
    /* jshint ignore:start */

    var keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

    return {
        encode: function (input) {
            var output = "";
            var chr1, chr2, chr3 = "";
            var enc1, enc2, enc3, enc4 = "";
            var i = 0;

            do {
                chr1 = input.charCodeAt(i++);
                chr2 = input.charCodeAt(i++);
                chr3 = input.charCodeAt(i++);

                enc1 = chr1 >> 2;
                enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                enc4 = chr3 & 63;

                if (isNaN(chr2)) {
                    enc3 = enc4 = 64;
                } else if (isNaN(chr3)) {
                    enc4 = 64;
                }

                output = output +
                    keyStr.charAt(enc1) +
                    keyStr.charAt(enc2) +
                    keyStr.charAt(enc3) +
                    keyStr.charAt(enc4);
                chr1 = chr2 = chr3 = "";
                enc1 = enc2 = enc3 = enc4 = "";
            } while (i < input.length);

            return output;
        },

        decode: function (input) {
            var output = "";
            var chr1, chr2, chr3 = "";
            var enc1, enc2, enc3, enc4 = "";
            var i = 0;

            // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
            var base64test = /[^A-Za-z0-9\+\/\=]/g;
            if (base64test.exec(input)) {
                window.alert("There were invalid base64 characters in the input text.\n" +
                    "Valid base64 characters are A-Z, a-z, 0-9, '+', '/',and '='\n" +
                    "Expect errors in decoding.");
            }
            input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

            do {
                enc1 = keyStr.indexOf(input.charAt(i++));
                enc2 = keyStr.indexOf(input.charAt(i++));
                enc3 = keyStr.indexOf(input.charAt(i++));
                enc4 = keyStr.indexOf(input.charAt(i++));

                chr1 = (enc1 << 2) | (enc2 >> 4);
                chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                chr3 = ((enc3 & 3) << 6) | enc4;

                output = output + String.fromCharCode(chr1);

                if (enc3 != 64) {
                    output = output + String.fromCharCode(chr2);
                }
                if (enc4 != 64) {
                    output = output + String.fromCharCode(chr3);
                }

                chr1 = chr2 = chr3 = "";
                enc1 = enc2 = enc3 = enc4 = "";

            } while (i < input.length);

            return output;
        }
    };

    /* jshint ignore:end */
});