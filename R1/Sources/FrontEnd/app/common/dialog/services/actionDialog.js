'use strict';

angular
    .module('dialog')
    .controller('actionDialogController', function ($scope, $modalInstance, message) {
        $scope.message = message;

        $scope.onYesButtonClick = function () {
            $modalInstance.close('ok');
        };

        $scope.onCloseButtonClick = function () {
            $modalInstance.close('');
        };
    });
