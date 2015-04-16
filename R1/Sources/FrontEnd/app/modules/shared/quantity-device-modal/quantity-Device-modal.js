'use strict';

angular
    .module('shared')
    .controller('quantityDeviceModal', function ($scope, $modalInstance, device, networkService, switchboardOrganisationNetworkFlatArrayService, logger, gettextCatalog) {

        $scope.quantity = device.quantity;

        $scope.onSplitDevices = function () {
            var addedDevices = networkService.ungroupAllDevice(device);
            if (addedDevices !== null) {
                addedDevices.forEach(switchboardOrganisationNetworkFlatArrayService.insertDeviceInNetworkFlatArray);
            } else {
                logger.warning(gettextCatalog.getString('SWITCHBOARD_ORGANISATION_OPERATION_NOT_YET_SUPPORTED'), '', 'switchboard-organisation', true, null, { timeOut: 7000, showUser: true });
            }
            $modalInstance.close('ok');
        };

        $scope.onCloseButtonClick = function () {
            $modalInstance.close('cancel');
        };

        $scope.incrementQuantity = function () {
            if ($scope.quantity < 99){
                $scope.quantity++;
            }
        };

        $scope.decrementQuantity = function () {
            if ($scope.quantity > 1){
                $scope.quantity--;
            }
        };

        $scope.validateQuantity = function (quantity) {
            if (isNaN(quantity)){
                $modalInstance.close('ok');
            } else {
                var intQuantityValue = parseInt(quantity);
                networkService.updateDeviceQuantity(device, intQuantityValue);
                $modalInstance.close('ok');
            }

        };

    });
