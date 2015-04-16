'use strict';

angular
    .module('dialog')
    .controller('choicesDialogController', function ($scope, $modalInstance, title, message, labelChoice1, labelChoice2, disableChoice1, disableChoice2) {
        $scope.title = title;
        $scope.message = message;
        $scope.labelChoice1 = labelChoice1;
        $scope.labelChoice2 = labelChoice2;
        $scope.disableChoice1 = disableChoice1;
        $scope.disableChoice2 = disableChoice2;

        $scope.onChoice1ButtonClick = function () {
            $modalInstance.close(labelChoice1);
        };

        $scope.onChoice2ButtonClick = function () {
            $modalInstance.close(labelChoice2);
        };

        $scope.onCloseButtonClick = function () {
            $modalInstance.close('');
        };
    });
