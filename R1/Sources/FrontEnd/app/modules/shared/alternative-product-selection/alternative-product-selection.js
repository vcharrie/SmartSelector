'use strict';

angular
    .module('shared')
    .controller('alternativeProductSelection', function($scope, $rootScope, $timeout, $modalInstance, _,
                                                        keyboardShortcutsService,
                                                        originalProductPack, productsList, appConstants)
    {
        $scope.currency = appConstants.currency;
        $scope.productsList = productsList;
        $scope.originalProductPack = originalProductPack;
        $scope.selectedProduct = _.find($scope.productsList, function(productPack){
            //returns (originalProductPack === productPack), but javascript won't help...
            if (productPack.product.parts.length !== originalProductPack.product.parts.length){
                return false;
            }
            for (var i = 0; i < productPack.product.parts.length; i++){
                if (productPack.product.parts[i].part.partCode !== originalProductPack.product.parts[i].part.partCode) {
                    return false;
                }
            }
            return true;
        });

        $scope.close = function() {
            $modalInstance.close(null);
        };

        $scope.validate = function() {
            $modalInstance.close($scope.selectedProduct);
        };

        $scope.onKeydown = function($event) {
            keyboardShortcutsService.onKeydown($event);
        };

        $scope.highlightProduct = function(product) {
            $scope.selectedProduct = product;
        };
    });
