'use strict';

angular
    .module('dialog')
    .controller('yesNoDialogController', function ($scope, $modalInstance, message) {
        $scope.message = message;

        $scope.onYesButtonClick = function () {
            $modalInstance.close(true);
        };

        $scope.onNoButtonClick = function () {
            $modalInstance.close(false);
        };

        $scope.onCloseButtonClick = function () {
            $modalInstance.dismiss();
        };
    });
