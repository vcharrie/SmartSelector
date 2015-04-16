'use strict';

angular
    .module('drawing', [])
    .config(function($routeProvider) {
        $routeProvider.when('/',
            {
                controller: 'drawing-explore',
                templateUrl: 'modules/drawing/drawing.explore/drawing.explore.view.html'
            });
    })
    .controller('drawing-shell', function($scope, $location) {
        $scope.isActive = function(route) {
            return route === $location.path() || (route === '/explore' && $location.path() === '/');
        };
    });