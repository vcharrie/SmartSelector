'use strict';

/**
 * theme controller
 */
angular.module('theme', ['ngRoute'])
  .config(function ($routeProvider) {
    $routeProvider.when('/theme',
      {
        controller: 'theme',
        templateUrl: 'modules/theme/theme.view.html'
      });
  })
  .controller('theme', function ($scope) {
      $scope.hello = ['a', 'b', 'c'];
  });