'use strict';

/*
 * admin drawings controller
 */
angular.module('admin')
    .config(function($routeProvider) {
        $routeProvider.when('/admin/logging',
            {
                controller: 'admin-logging',
                templateUrl: 'modules/admin/admin.logging/admin.logging.view.html'
            });
    }).controller('admin-logging', function($scope, $q, loggerService) {

        function init() {
            $scope.isLoading = true;

            $scope.logtypes = [];
            $scope.logs = {};

            loggerService.readAll().then(function(results) {

                results.forEach(function(result) {
                    var index = $scope.logtypes.indexOf(result.type);
                    if (index < 0) {
                        $scope.logtypes.push(result.type);
                        $scope.logs[result.type] = [];
                    }
                    $scope.logs[result.type].push(result.value);
                });

                $scope.isLoading = false;
            });

        }

        init();
    });
