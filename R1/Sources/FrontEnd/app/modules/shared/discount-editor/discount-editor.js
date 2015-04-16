'use strict';

angular
    .module('shared')
    .controller('discountEditor', function ($rootScope, $scope, $modalInstance, editMode, selectPriceListCallback) {


        $scope.editMode = editMode;
        var selectPriceList = selectPriceListCallback;

        $scope.close = function () {
            $modalInstance.close();
        };

        $scope.selectList= function(listSelected)
        {
            if(selectPriceList!==undefined)
            {
                selectPriceList(listSelected);
            }
            $modalInstance.close();
        };

        $scope.validate = function () {
            if (editMode === 'Pricelist') {
                $modalInstance.close();
            }
            else {
                $rootScope.$emit('Discount changed');
                $modalInstance.close();
            }
        };

    });
