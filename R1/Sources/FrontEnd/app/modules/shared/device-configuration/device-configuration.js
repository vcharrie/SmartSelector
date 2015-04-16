'use strict';

angular
    .module('shared')
    .controller('deviceConfiguration', function ($scope, $rootScope, $timeout, $modalInstance, $window, _, $filter, logger, gettextCatalog, apiConstants,
                                                 rangeService, partInfoService, productConfigurationService, Project, switchboardContentService, productConfigurationTrackingService, saveLoadService, keyboardShortcutsService, auxiliariesService, auxiliariesSelectionService, alternativeProductSelectionService,
                                                 ProductPack, Product, Characteristic,
                                                 requestKey, modifiedDevice, dialogService) {

        $scope.selectedRangeItem = switchboardContentService.lastSelectedRangeItem;
        $scope.firstRangeItemIndex = 0;
        $scope.lastRangeItemIndex = 0;
        $scope.displayedRangeItemsCount = 7;
        $scope.ranges = [];
        $scope.displayedRanges = [];
        $scope.defaultProductPack = null;
        $scope.fillProductListWithDefaultProductPack = false;

        $scope.productsList = [];
        $scope.productsListCache = {};

        $scope.productsLoaded = true;
        $scope.productLoaded = true;
        $scope.productFound = true;
        $scope.showAll = false;

        $scope.currentProductPack = null;
        $scope.AddMore = false;
        $scope.validating = false;

        $scope.baseUri = apiConstants.baseUri;

        $scope.incrementQuantity = function () {
            $scope.currentProductPack.quantity++;
        };

        $scope.decrementQuantity = function () {
            $scope.currentProductPack.quantity--;
        };

        $scope.toggleAddMore = function () {
            $scope.AddMore = !$scope.AddMore;
        };

        $scope.onRightArrowButtonClick = function () {
            if (!$scope.rightArrowDisabled()) {
                $scope.firstRangeItemIndex += $scope.displayedRangeItemsCount;
                $scope.lastRangeItemIndex += $scope.displayedRangeItemsCount;
            }
        };

        $scope.onLeftArrowButtonClick = function () {
            if (!$scope.leftArrowDisabled()) {
                $scope.firstRangeItemIndex -= $scope.displayedRangeItemsCount;
                $scope.lastRangeItemIndex -= $scope.displayedRangeItemsCount;
            }
        };

        $scope.leftArrowDisabled = function () {
            return $scope.firstRangeItemIndex === 0;
        };
        $scope.rightArrowDisabled = function () {
            return $scope.lastRangeItemIndex >= $scope.displayedRanges.length - 1;
        };

        $scope.selectMetaRange = function (metaRange) {
            // block selection if products are loading
            if (!$scope.productLoaded) {
                return;
            }

            $scope.defaultProductPack = null;
            $scope.selectedMetaRange = metaRange;
            $scope.displayedRanges = _.filter($scope.ranges, function (range) {
                return _.contains(range.metaRanges, $scope.selectedMetaRange);
            });
            $scope.firstRangeItemIndex = 0;
            $scope.lastRangeItemIndex = Math.min($scope.displayedRangeItemsCount - 1, $scope.displayedRanges.length - 1);

            if ($scope.selectedRangeItem.metaRanges !== undefined && $scope.selectedRangeItem.metaRanges[0] !== metaRange) {
                // pre-select the first range item to avoid a false "rollback" functional bug
                $scope.selectRangeItem($scope.displayedRanges[0]);
            }
        };

        $scope.selectRangeItem = function (selectedRangeItem) {
            if ($scope.selectedRangeItem.rangeName !== selectedRangeItem.rangeName && $scope.productLoaded) {
                $scope.defaultProductPack = null;
                $scope.productsLoaded = false;
                $scope.selectedRangeItem = switchboardContentService.lastSelectedRangeItem = selectedRangeItem;
            }
        };

        $scope.productsList = [];
        $scope.productsListCache = {};
        $scope.productPackTab = [];

        $scope.close = function () {
            $modalInstance.close($scope.productPackTab);
        };

        var addProductPack = function (productPack) {
            $scope.productPackTab.push(productPack);
            if ($scope.AddMore) {
                logger.success(gettextCatalog.getString('SUCCESS_ADD_PRODUCT'), '', 'device-configuration', true, null, {showUser: true});
            }
        };

        $scope.validate = function () {

            if ($scope.validating) {
                return;
            }

            $scope.validating = true;
            var productPack = $scope.filteredProductsList[0].clone();

            productPack.deviceQuantity = 1;
            productPack.quantity = $scope.currentProductPack.quantity;

            // HACK WBA : fastest way to fix EQ-1169 (auto-learning not working)
            $scope.$broadcast('updateHistoryValues', auxiliariesService.getMainPartsReferences(productPack.product).join('_'));

            addProductPack(productPack);

            if (!$scope.AddMore) {
                $modalInstance.close($scope.productPackTab);
            } else {
                $scope.currentProductPack.quantity = 1;
                $scope.validating = false;
            }
        };

        $scope.onKeydown = function ($event) {
            keyboardShortcutsService.onKeydown($event);
        };

        $scope.fillProductsList = function (characteristicsDescriptor, val, chosenProducts) {
            $scope.productLoaded = false;

            $scope.productsListCache = characteristicsDescriptor;
            var products = characteristicsDescriptor.products;

            /* If products references have been returned create the detailed products*/
            if (products.values.length > 0) {
                partInfoService.getDetailedProducts(products.values, Project.current.priceList.id).then(function (detailedProducts) {
                    //when we get back products list, we give it to model and to view
                    $scope.productsList = detailedProducts;

                    // filter min
                    var orderProductByRangeOrderAndPrice = $filter('orderProductByRangeOrderAndPrice');
                    $scope.productsList = orderProductByRangeOrderAndPrice($scope.productsList);
                    // If the user has already added a product that is in the productsList the
                    // selected product is the one with the higher weight
                    if (chosenProducts) {
                        var weight = 0;
                        var productToSelect = null;
                        $scope.productsList.forEach(function (product) {
                            var productKey = auxiliariesService.getMainPartsReferences(product).join('_');
                            if (chosenProducts[productKey] && chosenProducts[productKey] > weight) {
                                weight = chosenProducts[productKey];
                                productToSelect = product;
                            }
                        });
                        if (productToSelect !== null) {
                            $scope.highlightedProduct = [productToSelect];
                        }
                        else {
                            $scope.highlightedProduct = [$scope.productsList[0]];
                        }
                    }
                    else {
                        $scope.highlightedProduct = [$scope.productsList[0]];
                    }

                    var productList = $scope.highlightedProduct;

                    $scope.filteredProductsList = [];

                    productList.forEach(function (product) {
                        var characteristics = [];
                        characteristicsDescriptor.characteristics.forEach(function (characteristic) {
                            characteristics.push(new Characteristic(characteristic.name, characteristic.values[0]));
                        });

                        var productPack;
                        if ($scope.fillProductListWithDefaultProductPack) {
                            var defaultProduct = new Product(auxiliariesService.getMainParts($scope.defaultProductPack.product));
                            productPack = new ProductPack(defaultProduct, 1, $scope.selectedRangeItem, characteristics);
                        } else {
                            productPack = new ProductPack(product, 1, $scope.selectedRangeItem, characteristics);
                        }

                        // called this way to optimize performances
                        productConfigurationService.findIfCompatibleAuxiliariesExist(productPack).then(function (compatibilityResult) {
                            if ($scope.fillProductListWithDefaultProductPack) {
                                $scope.filteredProductsList.push($scope.defaultProductPack);
                                $scope.fillProductListWithDefaultProductPack = false;
                            } else {
                                $scope.filteredProductsList.push(productPack);
                            }

                            var tempQuantity = $scope.quantity;
                            if ($scope.currentProductPack){
                                tempQuantity = $scope.currentProductPack.quantity;
                            }
                            $scope.currentProductPack = $scope.filteredProductsList[0].clone();
                            $scope.currentProductPack.quantity = tempQuantity;
                            $scope.productsLoaded = true;
                            $scope.productLoaded = true;
                            $scope.hasCompatibleAuxiliaries = compatibilityResult;
                        });
                    });
                });
            } else {
                $scope.productsList = [];
                $scope.filteredProductsList = [];
                $scope.currentProductPack = null;
                $scope.productsLoaded = true;
                $scope.productLoaded = true;
            }
        };

        $scope.selectAlternativeProductHolder = function () {

            var auxiliaries = auxiliariesService.getAuxiliaries($scope.filteredProductsList[0].product);

            var alreadyHasAuxiliaries = auxiliaries.length > 0;
            if (alreadyHasAuxiliaries) {
                dialogService.showYesNoDialog(gettextCatalog.getString('switchboard-organisation-change-alternate-product-having-auxiliaries-warning')).result.then(function (result) {
                    if (result) {
                        $scope.selectAlternativeProduct();
                    }
                });
            } else {
                $scope.selectAlternativeProduct();
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
                    //remove eventual auxiliaries
                    var auxiliariesCache = auxiliariesService.getAuxiliaries(productPack.product);
                    auxiliariesService.setAuxiliaries(productPack.product, []);
                    alternativeProductSelectionService.selectAlternativeProduct(productPack, alternativeProductsList).then(function (alternativeProduct) {
                        if (alternativeProduct !== null) {
                            productConfigurationService.findIfCompatibleAuxiliariesExist(alternativeProduct).then(function (compatibilityResult) {
                                $scope.filteredProductsList = [];
                                $scope.filteredProductsList.push(alternativeProduct);
                                $scope.hasCompatibleAuxiliaries = compatibilityResult;
                            });
                        } else {
                            $scope.filteredProductsList = filteredProductsListCache;
                            auxiliariesService.setAuxiliaries($scope.filteredProductsList[0].product, auxiliariesCache);
                        }
                        $scope.productLoaded = true;
                    });
                });
            }
        };

        $scope.configureAuxiliaries = function () {
            var mainProductPack = $scope.filteredProductsList[0].clone();
            mainProductPack.product.parts = auxiliariesService.getMainParts(mainProductPack.product);
            auxiliariesSelectionService.selectAuxiliaries(mainProductPack).then(function (newProductPack) {
                if (newProductPack !== null) {
                    $scope.filteredProductsList[0] = newProductPack;
                }
            });
        };

        $scope.onProductsListChanged = function (newProductsList, newFilteredProductsList) {
            $scope.filteredProductsList = newFilteredProductsList;
            $scope.productsList = newProductsList;
        };

        $scope.clearSelectedValues = function () {
            $scope.$broadcast('clearSelectedValues');
        };

        $scope.configureRequestKey = 'configure';
        $scope.modifyRequestKey = 'modify';
        $scope.requestKey = requestKey;
        $scope.modifiedDevice = modifiedDevice;

        if ($scope.requestKey === $scope.configureRequestKey) {
            $scope.modalTitle = gettextCatalog.getString('device-configuration-title');
            $scope.validationLabel = gettextCatalog.getString('device-configuration-validation-button');
        } else if ($scope.requestKey === $scope.modifyRequestKey) {
            $scope.modalTitle = gettextCatalog.getString('device-modification-title');
            $scope.validationLabel = gettextCatalog.getString('device-modification-validation-button');

            $scope.quantity = $scope.modifiedDevice.quantity;
            $scope.hasDistribution = $scope.modifiedDevice.children && $scope.modifiedDevice.children.length && $scope.modifiedDevice.children.length > 0;
            $scope.modifiedProductPack = Project.current.selectedSwitchboard.electricBasket.searchProductPack($scope.modifiedDevice.product);
        }

        var whichPageForThisRangeItem = function (selectedRangeItem, rangeItems, rangeItemsPerPage) {
            for(var i = 0; i < rangeItems.length; i++) {
                if(rangeItems[i].rangeName === selectedRangeItem.rangeName) {
                    return Math.floor(i / rangeItemsPerPage);
                }
            }
            return -1;
        };

        rangeService.loadAuxiliariesConf();
        rangeService.loadRangeItems().then(function () {
            $scope.displayedMetaRanges = rangeService.getDisplayedMetaRanges();
            rangeService.getRangeItems().forEach(function (range) {
                $scope.ranges.push(range);
            });
            if ($scope.requestKey === $scope.configureRequestKey) {
                if ($scope.selectedRangeItem.metaRanges !== undefined) {
                    $scope.selectMetaRange($scope.selectedRangeItem.metaRanges[0]);
                    $scope.selectRangeItem($scope.selectedRangeItem);
                } else {
                    $scope.selectMetaRange($scope.displayedMetaRanges[0]);
                    $scope.selectRangeItem($scope.displayedRanges[0]);
                }
            } else if ($scope.requestKey === $scope.modifyRequestKey) {
                $scope.selectMetaRange($scope.modifiedProductPack.rangeItem.metaRanges[0]);
                $scope.selectRangeItem($scope.modifiedProductPack.rangeItem);
                $scope.productsLoaded = false;
                $scope.defaultProductPack = $scope.modifiedProductPack;
                $scope.fillProductListWithDefaultProductPack = true;

                //reject meta-ranges which would display no range
                var rejectedMetaRanges = [];
                $scope.displayedMetaRanges.forEach(function (metaRange) {
                    var rejected = true;
                    $scope.ranges.forEach(function (range) {
                        if (_.contains(range.metaRanges, metaRange)) {
                            rejected = false;
                        }
                    });

                    if (rejected) {
                        rejectedMetaRanges.push(metaRange);
                    }
                });

                $scope.displayedMetaRanges = _.reject($scope.displayedMetaRanges, function (metaRange) {
                    return _.contains(rejectedMetaRanges, metaRange);
                });
            }
            applyHeight();

            // pre scroll range items if previous selection is out of sight
            var pageToDisplay = whichPageForThisRangeItem($scope.selectedRangeItem, $scope.displayedRanges, $scope.displayedRangeItemsCount);
            $scope.firstRangeItemIndex = pageToDisplay * $scope.displayedRangeItemsCount;
            $scope.lastRangeItemIndex = ($scope.firstRangeItemIndex + $scope.displayedRangeItemsCount) - 1;
        });

        // Height of modal body

        function applyHeight() {
            var modalHeight = $('.device-configuration').outerHeight();
            var headerHeight = $('.device-configuration .modal-header').outerHeight();
            var footerHeight = $('.device-configuration .modal-footer').outerHeight();
            var bodyMargins = parseInt($('.device-configuration .modal-body').css('padding-top'), 10) + parseInt($('.device-configuration .modal-body').css('padding-bottom'), 10);
            var additionalMagin = 12;
            var bodyHeight = modalHeight - (headerHeight + footerHeight + bodyMargins + additionalMagin);
            $('.device-configuration .modal-body').height(bodyHeight);
        }

        angular.element($window).bind('resize', function () {
            $scope.$apply(function () {
                applyHeight();
            });
        });

    });
