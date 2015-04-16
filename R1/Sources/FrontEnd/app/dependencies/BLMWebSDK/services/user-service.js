/**
 * Created by Danyang LI on 29/11/14.
 */


'use strict';
angular.module('blmWebSDKDirective')
        .service('userServices', ['$http',function ($http) {

                var userServices = {};
                var userToken = '78577204-60ae-4ftc/HNyeTrvRYgCZzvV7hpfU/kkXxsglS3C99LxqVa+fmlt4MHdhCgujfkWqG6hS9q5+DJl1BBqVCzMVW3XgVQxkMnDCdonj8OsOFSPnuQva6s4MKlfe1tRjlLDwwEpEvbhA5q496mbd6RYxL0RH1WID19QHGtCbwLNLT37uCbL/YewkL0hkYXlFYw/7YPHsf';

        userServices.getCurrentUserInfoByUserId = function (callback) {
                    $.ajax({
                        url: '//login-ppr.pace.schneider-electric.com/api/v1/user',
                        async: true,
                        type: "GET",
                        beforeSend: function (xhr, settings) {
                            xhr.setRequestHeader("Accept", "application/json");
                            xhr.setRequestHeader("Authorization", userToken);
                        }
                    }).done(function (data) {
                        callback(data);
                    }).fail(function (data) {
                        alert('Error, your session has expired, please relogin');
                    });
                };

                userServices.setToken = function (token) {
                    userToken = token;
                };
                userServices.getToken = function () {
                    return userToken;
                };

                return userServices;
            }
        ]
 );