'use strict';

angular
    .module('shared')
    .controller('distributionConfiguration', function($scope, $rootScope, $timeout, $modalInstance, $window, _, $filter, $q, logger, gettextCatalog, apiConstants,
                                                    distributionConfigurationService, rangeService, partInfoService, productConfigurationService, Project, switchboardContentService, productConfigurationTrackingService, saveLoadService, keyboardShortcutsService, distributionService, alternativeProductSelectionService,
                                                    ProductPack, Characteristic,
                                                    requestKey, modifiedDevice, distributionLevel) {

        $scope.selectedRangeItem = null;
        $scope.firstRangeItemIndex = 0 ;
        $scope.lastRangeItemIndex = 0 ;
        $scope.displayedRangeItemsCount = 7;
        $scope.ranges = [];
        $scope.distributionRequestedLevel = distributionLevel;

        $scope.productsLoaded = true;
        $scope.productLoaded = true;
        $scope.productFound = true;
        $scope.showAll = false;

        $scope.quantity = 1;

        $scope.baseUri = apiConstants.baseUri;

        $scope.onRightArrowButtonClick = function(){
            if (!$scope.rightArrowDisabled()) {
                $scope.firstRangeItemIndex += $scope.displayedRangeItemsCount;
                $scope.lastRangeItemIndex +=$scope.displayedRangeItemsCount;
            }
        };

        $scope.onLeftArrowButtonClick = function(){
            if (!$scope.leftArrowDisabled()) {
                $scope.firstRangeItemIndex -= $scope.displayedRangeItemsCount;
                $scope.lastRangeItemIndex -= $scope.displayedRangeItemsCount;
            }
        };

        $scope.leftArrowDisabled = function(){
            return $scope.firstRangeItemIndex === 0;
        } ;
        $scope.rightArrowDisabled = function(){
            return $scope.lastRangeItemIndex >= $scope.ranges.length-1;
        } ;

        $scope.selectRangeItem = function(selectedRangeItem) {
            if (!selectedRangeItem.isCompatible){
                return null;
            }
            $scope.defaultProductPack = null;
            $scope.selectedRangeItem = switchboardContentService.lastSelectedDistributionRange = selectedRangeItem;
        };

        $scope.productsList = [];
        $scope.productsListCache = {};

        $scope.close = function() {
            $modalInstance.close(null);
        };

        $scope.validate = function() {
            var productPack = $scope.filteredProductsList[0].clone();

            productPack.deviceQuantity = $scope.quantity;
            productPack.quantity = $scope.quantity;

            // HACK WBA : fastest way to enable auto-learning on distributions
            $scope.$broadcast('updateHistoryValues', productPack);

            $modalInstance.close(productPack);
        };

        $scope.onKeydown = function($event) {
            keyboardShortcutsService.onKeydown($event);
        };

        $scope.fillProductsList = function(characteristicsDescriptor, showAll){
            $scope.productLoaded = false;

            $scope.showAll = showAll;

            $scope.productsListCache = characteristicsDescriptor;
            var products = characteristicsDescriptor.products;

            /* If products references have been returned create the detailed products*/
            if (products.values.length > 0) {
                partInfoService.getDetailedProducts(products.values, Project.current.priceList.id).then(function(detailedProducts) {
                    //when we get back products list, we give it to model and to view
                    $scope.productsList = detailedProducts;

                    // filter min
                    var filterMin = $filter('min');

                    //if admin must be always displayed
                    $scope.highlightedProduct = filterMin($scope.productsList, 'price');
                    var productList = showAll ? $scope.productsList : $scope.highlightedProduct;

                    //place the default product in the top of the list
                    if (showAll) {
                        for (var i=0; i<productList.length; i++) {
                            if (productList[i] === $scope.highlightedProduct[0]) {
                                productList.splice(i, 1);
                            }
                        }
                        productList.unshift($scope.highlightedProduct[0]);
                    }

                    $scope.filteredProductsList = [];

                    productList.forEach(function(product) {
                        var characteristics = [];
                        characteristicsDescriptor.characteristics.forEach(function(characteristic) {
                            characteristics.push(new Characteristic(characteristic.name, characteristic.values[0]));
                        });

                        var productPack = new ProductPack(product, 1, $scope.selectedRangeItem, characteristics);
                        $scope.filteredProductsList.push(productPack);

                    });

                    $scope.productsLoaded = true;
                    $scope.productLoaded = true;

                });
            } else {
                $scope.productsList = [];
                $scope.filteredProductsList = [];
                $scope.productsLoaded = true;
                $scope.productLoaded = true;
            }
        };

        $scope.selectAlternativeProduct = function () {
            var alternativeProductsList = [];
            var products = $scope.productsListCache.products;
            $scope.productLoaded = false;
            var filteredProductsListCache = $scope.filteredProductsList;

            if (products.values.length > 0) {
                partInfoService.getDetailedProducts(products.values, Project.current.priceList.id).then(function (detailedProducts) {

                    var orderProductByRangeOrderAndPrice = $filter('orderProductByRangeOrderAndPrice');
                    var productList = orderProductByRangeOrderAndPrice(detailedProducts);

                    productList.forEach(function (product) {
                        var characteristics = [];
                        $scope.productsListCache.characteristics.forEach(function (characteristic) {
                            characteristics.push(new Characteristic(characteristic.name, characteristic.values[0]));
                        });

                        var productPack = new ProductPack(product, 1, $scope.selectedRangeItem, characteristics);
                        alternativeProductsList.push(productPack);
                    });

                    var productPack = $scope.filteredProductsList[0];
                    alternativeProductSelectionService.selectAlternativeProduct(productPack, alternativeProductsList).then(function (alternativeProduct) {
                        if (alternativeProduct !== null) {
                            $scope.filteredProductsList = [];
                            $scope.filteredProductsList.push(alternativeProduct);
                        } else {
                            $scope.filteredProductsList = filteredProductsListCache;
                        }
                        $scope.productLoaded = true;
                    });
                });
            }
        };

        $scope.onProductsListChanged= function(newProductsList, newFilteredProductsList) {
            $scope.filteredProductsList = newFilteredProductsList;
            $scope.productsList = newProductsList;
        };

        $scope.clearSelectedValues = function() {
            $scope.$broadcast('clearSelectedValues');
        };

        $scope.configureRequestKey = 'configure';
        $scope.modifyRequestKey = 'modify';
        $scope.requestKey = requestKey;
        $scope.modifiedDevice = modifiedDevice;

        if ($scope.requestKey === $scope.configureRequestKey) {
            $scope.modalTitle = gettextCatalog.getString('distribution-configuration-title');
            $scope.validationLabel = gettextCatalog.getString('distribution-configuration-validation-button');
        } else if ($scope.requestKey === $scope.modifyRequestKey) {
            $scope.modalTitle = gettextCatalog.getString('distribution-modification-title');
            $scope.validationLabel = gettextCatalog.getString('distribution-modification-validation-button');

            $scope.modifiedProductPack = Project.current.selectedSwitchboard.distributionBasket.searchProductPack($scope.modifiedDevice.product);
        }

        rangeService.loadDistributions().then(function() {

            // compatibleRanges are the up (in the [0]) and downstream (in [1..N]) ranges
            distributionService.getTopologyRanges($scope.modifiedDevice).then(function(compatibleRanges) {

                // call service to find compatible distributions categories
                // and then apply it to filter the $scope.ranges.push(range); some lines below
                rangeService.getCompatibleDistributions(compatibleRanges).then(function(compatibleDistributions) {

                    rangeService.getDistributions($scope.distributionRequestedLevel).forEach(function (range) {
                        if(compatibleDistributions.indexOf(range.rangeName) !== -1) {
                            range.isCompatible = true;
                        } else {
                            range.isCompatible = false;
                        }
                        $scope.ranges.push(range);
                    });

                    if($scope.ranges.length === 0) {
                        return;
                    }

                    if ($scope.requestKey === $scope.configureRequestKey) {
                        // look for characteristics values if a range item was already selected
                        // but check if it's compatible with type (primary / secondary) to avoid a ghost on pre-select
                        if (!_.isEmpty($scope.selectedRangeItem) && _.contains($scope.ranges, $scope.selectedRangeItem)) {
                            $scope.selectRangeItem($scope.selectedRangeItem);
                        } else {
                            var compatibleRange = _.find($scope.ranges, function(range){
                                return range.isCompatible;
                            });
                            if (compatibleRange !== undefined){
                                $scope.selectRangeItem(compatibleRange);
                            }
                        }
                    } else if ($scope.requestKey === $scope.modifyRequestKey) {
                        // If modified distribution is not compatible anymore, select the first distribution range compatible
                        if (_.contains($scope.ranges, $scope.modifiedProductPack.rangeItem)) {
                            $scope.selectRangeItem($scope.modifiedProductPack.rangeItem);
                            $scope.defaultProductPack = $scope.modifiedProductPack;
                        }
                        else {
                            var firstCompatibleRange = _.find($scope.ranges, function(range){
                                return range.isCompatible;
                            });
                            if (firstCompatibleRange !== undefined){
                                $scope.selectRangeItem(firstCompatibleRange);
                            }
                        }
                    }

                    $scope.lastRangeItemIndex = Math.min($scope.displayedRangeItemsCount - 1, $scope.ranges.length - 1);
                });
            });
        });

        // check if distribution ranges array is not empty
        // if not, check if all distribution ranges is compatible with upstream and downstream devices
        $scope.compatibleDistributionRange = function () {
            if ($scope.ranges.length === 0){
                return false;
            } else if ($scope.ranges.length > 0) {
                var compatibleDistributionRanges = _.filter($scope.ranges, function(range){
                    return range.isCompatible;
                });
                return compatibleDistributionRanges.length !== 0;
            } else {
                return false;
            }
        };
    });
