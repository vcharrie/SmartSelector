'use strict';

angular
    .module('dialog')
    .controller('errorDialogController', function($scope, $timeout, $modalInstance, $window, message, reloadApplication) {

        $scope.message = message;
        $scope.reloadApplication = reloadApplication;

        $scope.close = function() {
            $modalInstance.close();
            if ($scope.reloadApplication) {
                $window.location.href = $window.location.pathname;
            }
        };
    });
