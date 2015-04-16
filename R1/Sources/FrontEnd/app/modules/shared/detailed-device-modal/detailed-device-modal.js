'use strict';

angular
    .module('shared')
    .controller('detailedDeviceModal', function ($scope, $rootScope, $modalInstance, $window, $location, gettextCatalog, logger, keyboardShortcutsService,
                                                 Project, networkService,
                                                 device) {

        var basket = Project.current.selectedSwitchboard.electricBasket;
        if (device.type === networkService.distributionType){
            basket = Project.current.selectedSwitchboard.distributionBasket;
        }
        $scope.productPack = basket.searchProductPack(device.product);

        $scope.close = function () {
            $modalInstance.close();
        };

        $scope.onKeydown = function ($event) {
            keyboardShortcutsService.onKeydown($event);
        };
    });
