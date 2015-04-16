'use strict';

/**
 * productConfiguration controller
 */
angular.module('productConfiguration', ['ngRoute', 'business', 'rest', 'helpers', 'gettext', 'tracking'])
    .controller('productConfiguration', function($scope, gettextCatalog, _, $q,apiConstants, Project, logger, productConfigurationService, defaultValuesHistoricService, googleAnalyticsService, ProductPack, Characteristic, productConfigurationTrackingService, rangeService, stringHelper, characteristicsHelper, partInfoService, adminService, $filter, Filter, switchboardContentService) {
        // init caracts initializes mainCaracts and equipmentCaract
        $scope.productsLoaded = true;
        $scope.productLoaded = true;
        $scope.productFound = true;
        $scope.showAll = false;
        $scope.ranges = [];
        $scope.selectedRangeItem = switchboardContentService.lastSelectedRangeItem;
        $scope.lastDefaultValuesRetrievedFromHistoric = null;
        $scope.productsListCache = {};

        $scope.firstRangeItemIndex = 0 ;
        $scope.lastRangeItemIndex = 0 ;
        $scope.displayedRangeItemsCount = 6;

        $scope.baseUri=apiConstants.baseUri;

        rangeService.loadAuxiliariesConf();
        rangeService.loadRangeItems().then(function() {
            rangeService.getRangeItems().forEach(function(range) {
                $scope.ranges.push(range);
            });
            $scope.lastRangeItemIndex = Math.min($scope.displayedRangeItemsCount-1,  $scope.ranges.length -1) ;
        });

        $scope.onRightArrowButtonClick = function(){
            if (!$scope.rightArrowDisabled()) {
                $scope.firstRangeItemIndex++;
                $scope.lastRangeItemIndex++;
            }
        };

        $scope.onLeftArrowButtonClick = function(){
            if (!$scope.leftArrowDisabled()) {
                $scope.firstRangeItemIndex--;
                $scope.lastRangeItemIndex--;
            }
        };

        $scope.leftArrowDisabled = function(){
            return $scope.firstRangeItemIndex === 0;
        } ;
        $scope.rightArrowDisabled = function(){
            return $scope.lastRangeItemIndex === $scope.ranges.length-1;
        } ;

        $scope.onShowAllProducts = function() {
            $scope.fillProductsList($scope.productsListCache, true);
        };

        $scope.fillProductsList = function(characteristicsDescriptor, showAll) {

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
                        // called this way to optimize performances
                        productConfigurationService.findIfCompatibleAuxiliariesExist(productPack).then(function() {
                            $scope.filteredProductsList.push(productPack);
                            $scope.productsLoaded = true;
                            $scope.productLoaded = true;
                        });
                    });
                });
            } else {
                $scope.productsList = [];
                $scope.filteredProductsList = [];
                $scope.productsLoaded = true;
                $scope.productLoaded = true;
            }
        };

        $scope.selectRangeItem = function(selectedRangeItem) {
            if(switchboardContentService.lastSelectedRangeItem !== selectedRangeItem) {
                $scope.productsLoaded = false;
            }
            $scope.selectedRangeItem = switchboardContentService.lastSelectedRangeItem = selectedRangeItem;
        };

        // HACK_WBA : look for characteristics values if a range item was already selected
        if(!_.isEmpty($scope.selectedRangeItem)) {
            $scope.selectRangeItem($scope.selectedRangeItem);
        }

        $scope.onDisplayBasketButtonClick = function() {
            $scope.$parent.onDisplayBasketButtonClick();
        };

        $scope.onProductsListChanged= function(newProductsList, newFilteredProductsList) {
            $scope.filteredProductsList = newFilteredProductsList;
            $scope.productsList = newProductsList;
        };

});
