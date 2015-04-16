﻿'use strict' ;

angular.module('tracking').run(function ($rootScope, $location) {

    // Google analytics script
    (function (i, s, o, g, r, a, m) {
        i.GoogleAnalyticsObject = r;
        i[r] = i[r] || function () {
            (i[r].q = i[r].q || []).push(arguments);
        };
        i[r].l = 1 * new Date();
        a = s.createElement(o);
        m = s.getElementsByTagName(o)[0];
        a.async = 1;
        a.src = g;
        m.parentNode.insertBefore(a, m);
    })(window, document, 'script', '//www.google-analytics.com/analytics.js', 'ga');

    // since we have a single page app we need to notify google analytics when page changed
    $rootScope.$on('$viewContentLoaded', function(){
        ga('send', 'pageview', $location.path());
    });

});