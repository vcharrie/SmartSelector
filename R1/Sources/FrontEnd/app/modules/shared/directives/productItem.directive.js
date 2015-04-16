'use strict';

angular
    .module('shared')
    .directive('productItem', function() {
        return {
            restrict: 'E',
            scope: {
                product: '=product',
                context: '=',
                isSelected: '=isSelected',
                selectProduct: '=selectProduct'
            },
            templateUrl: 'modules/shared/directives/productItem.directive.view.html',
            controller: function($scope, gettextCatalog, $location, $timeout, $anchorScroll, _, Project, networkService, saveLoadService, auxiliariesService, Product, productConfigurationTrackingService, productConfigurationService, auxiliariesSelectionService, logger,apiConstants, dialogService) {

                switch($scope.context){
                    case 'configuration':
                        $scope.quantity = true;
                        $scope.add = true;
                        $scope.remove = false;
                        $scope.modify = false;
                        $scope.select = false;
                        break;
                    case 'basket':
                        $scope.quantity = true;
                        $scope.add = false;
                        $scope.remove = true;
                        $scope.modify = true;
                        $scope.select = false;
                        break;
                    case 'readonly':
                        $scope.quantity = false;
                        $scope.add = false;
                        $scope.remove = false;
                        $scope.modify = false;
                        $scope.select = false;
                        break;
                    case 'selection':
                        $scope.quantity = false;
                        $scope.add = false;
                        $scope.remove = false;
                        $scope.modify = false;
                        $scope.select = true;
                        break;

                    default:

                }
                $scope.baseUri=apiConstants.baseUri;
                $scope.hasCompatibleAuxiliaries = ($scope.product.compatibilityWithAuxiliaries === auxiliariesService.compatibleAuxiliaries);
                $scope.productpack = $scope.product;
                $scope.modifyMode = false;

                //Product adding
                $scope.addProduct = function(productToAdd) {

                    if(!productToAdd) {
                        productToAdd = $scope.productpack;
                    }

                    productConfigurationTrackingService.productAdded(productToAdd);

                    //add the product as a new device in the network : network-service will add it to the corresponding basket
                    var addedDevice = null;
                    var productType = networkService.electricalDeviceType;
                    var firstParentalEligibleDevice = networkService.getFirstParentalEligibleUpstreamDevice();

                    if (productToAdd.rangeItem.rangeName === 'rangeselector-power-meter') {
                        productType = networkService.measureDeviceType;
                    }
                    if (Project.current.selectedSwitchboard.network.incomerDevices.length === 0 ){
                        addedDevice = networkService.startNetwork(productToAdd.clone(), productType);
                    } else if (firstParentalEligibleDevice === null) {
                        var brother = _.last(Project.current.selectedSwitchboard.network.incomerDevices);
                        addedDevice = networkService.addParallelDevice(brother, productToAdd.clone(), productType);
                    } else {
                        var parentToUse = networkService.getMainDistributionUpstreamDevice();
                        if(parentToUse === null) {
                            parentToUse = firstParentalEligibleDevice;
                        } else {
                            parentToUse = parentToUse.children[0];
                        }
                        addedDevice = networkService.addDownstreamDevice(parentToUse, productToAdd.clone(), productType);
                    }
                    var addSuccess = (addedDevice !== null);

                    if (!addSuccess) {
                        logger.error(gettextCatalog.getString('ERROR_ADD_PRODUCT_FAIL'), 'No more information.', 'addProduct', true);
                    } else {
                        $scope.$emit('productAdded', productToAdd);
                    }
                };

                $scope.removeProduct = function() {
                    if(networkService.productHaveChildren($scope.productpack.product)) {
                        dialogService.showYesNoDialog(gettextCatalog.getString('switchboard-organisation-delete-intern-node-warning')).result.then(function (result) {
                            if (result) {
                                networkService.deleteProduct($scope.productpack.product, true);
                            }
                        });
                    } else {
                        networkService.deleteProduct($scope.productpack.product, true);
                    }
                };

                $scope.incrementProductToAdd = function(valueToAdd) {
                    var newProductPack = $scope.productpack.clone();
                    newProductPack.quantity += valueToAdd;
                    networkService.modifyProduct($scope.productpack.product, newProductPack);

                    $scope.productpack.quantity += valueToAdd;
                };

                $scope.decrementProductToAdd = function(valueToRemove) {
                    if ($scope.productpack.quantity - valueToRemove > 0) {
                        var newProductPack = $scope.productpack.clone();
                        newProductPack.quantity -= valueToRemove;
                        networkService.modifyProduct($scope.productpack.product, newProductPack);

                        $scope.productpack.quantity -= valueToRemove;
                    }
                };

                $scope.modifyProduct = function(event) {
                    $scope.modifyMode = !$scope.modifyMode;
                    if ($scope.modifyMode) {
                        $timeout(function(){
                            var productItemToPoint = $(event.target).parents('.product-item');
                            var scrollDiv = $('.selected-products-group');
                            var scrollDivTop = scrollDiv.offset().top;
                            var scrollPresentPosition = scrollDiv.scrollTop();
                            scrollDiv.animate({scrollTop : scrollPresentPosition + productItemToPoint.offset().top - scrollDivTop}, 'slow');
                        });
                    }
                };

                $scope.quantityUpdated = function() {
                    if($scope.context === 'basket') {
                        var newProductPack = $scope.productpack.clone();
                        networkService.modifyProduct($scope.productpack.product, newProductPack);
                    }
                };

                $scope.$watch('product', function(){
                    if ($scope.add) {
                        $scope.addProductWithAuxiliaries = function() {
                            var productToAdd = $scope.productpack.clone();
                            productToAdd.product.parts = auxiliariesService.getMainParts(productToAdd.product);
                            auxiliariesSelectionService.selectAuxiliaries(productToAdd).result.then(function(success){
                                if(success){
                                    $scope.productpack = productToAdd;
                                }
                            });
                        };
                    }
                });

                $scope.$on('ProductModified', function() {
                    $scope.modifyMode = false;
                });
            }
        };
    });
