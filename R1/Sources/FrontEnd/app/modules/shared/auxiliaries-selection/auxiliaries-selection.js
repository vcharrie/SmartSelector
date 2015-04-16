'use strict';

angular
    .module('shared')
    .controller('auxiliariesSelection', function($scope, $rootScope, $timeout, $modalInstance, $window, _, $filter, logger, gettextCatalog,
                                                 mainProductPack,
                                                 rangeService, partInfoService, productConfigurationService, productConfigurationTrackingService, saveLoadService, keyboardShortcutsService, auxiliariesService,
                                                 ProductPack, Characteristic, Project) {
        $scope.mainProductPack = mainProductPack;

        $scope.auxiliariesList = [];
        $scope.filteredAuxiliariesList = [];
        $scope.auxiliariesListCache = {};
        $scope.selectedAuxiliary = {};
        $scope.filtersLoaded = false;
        $scope.auxiliariesLoading = false;


        rangeService.loadAuxiliariesConf().then(function() {
            $scope.auxiliaryAvailableSections = rangeService.getAuxiliariesConf($scope.mainProductPack.rangeItem.auxiliariesRangeName).sections;
            if ($scope.auxiliaryAvailableSections === undefined){
                logger.error('This auxiliary range name [' + $scope.mainProductPack.rangeItem.auxiliariesRangeName + '] has not been found : configure auxiliaries button should not have been displayed',
                    '', 'auxiliaries-selection : getAuxiliariesConf', false);
                return $scope.close();
            }
            $scope.auxiliarySelectedSection = $scope.auxiliaryAvailableSections[0];
            $scope.auxiliaryRange = rangeService.getAuxiliariesConf($scope.mainProductPack.rangeItem.auxiliariesRangeName);
        });

        $scope.close = function() {
            $modalInstance.close(null);
        };

        $scope.validate = function() {
            var partsArray = $scope.selectedAuxiliary.product.parts;
            for (var i=0; i < partsArray.length; i++) {
                auxiliariesService.setPartFromBothCollectionToAuxiliaries(partsArray[i]);
            }
            auxiliariesService.setAuxiliaries($scope.mainProductPack.product, $scope.selectedAuxiliary.product.parts);
            $modalInstance.close($scope.mainProductPack);
        };

        $scope.onKeydown = function($event) {
            keyboardShortcutsService.onKeydown($event);
        };

        $scope.fillProductsList = function(characteristicsDescriptor, showAll){

            $scope.auxiliariesLoading = true;
            $scope.auxiliariesListCache = characteristicsDescriptor;
            var auxiliaries = characteristicsDescriptor.products;

            var basketList = Project.current.selectedSwitchboard.electricBasket;

            /* If products references have been returned create the detailed products*/
            if (auxiliaries.values.length > 0) {
                partInfoService.getDetailedProducts(auxiliaries.values, Project.current.priceList.id).then(function(detailedProducts) {

                    basketList = Project.current.selectedSwitchboard.electricBasket;

                    //when we get back products list, we give it to model and to view
                    $scope.auxiliariesList = detailedProducts;

                    // filter min
                    var filterMin = $filter('min');

                    //if admin must be always displayed
                    $scope.highlightedProduct = filterMin($scope.auxiliariesList, 'price');
                    var auxiliariesList = showAll ? $scope.auxiliariesList : $scope.highlightedProduct;

                    //place the default product in the top of the list
                    if (showAll) {
                        for (var i=0; i<auxiliariesList.length; i++) {
                            if (auxiliariesList[i] === $scope.highlightedProduct[0]) {
                                auxiliariesList.splice(i, 1);
                            }
                        }
                        auxiliariesList.unshift($scope.highlightedProduct[0]);
                    }

                    $scope.filteredAuxiliariesList = [];

                    basketList = Project.current.selectedSwitchboard.electricBasket;

                    auxiliariesList.forEach(function(product) {
                        var characteristics = [];
                        characteristicsDescriptor.characteristics.forEach(function(characteristic) {
                            characteristics.push(new Characteristic(characteristic.name, characteristic.values[0]));
                        });

                        $scope.filteredAuxiliariesList.push(new ProductPack(product, 1, $scope.selectedRangeItem, characteristics));
                    });

                    $scope.selectedAuxiliary = $scope.filteredAuxiliariesList[0];
                    $scope.auxiliariesLoading = false;
                });
            } else {
                $scope.auxiliariesList = [];
                $scope.filteredAuxiliariesList = [];
                $scope.auxiliariesLoading = false;
            }

            basketList = Project.current.selectedSwitchboard.electricBasket;
        };

        $scope.onShowAllAuxiliaries = function(){
            $scope.fillProductsList($scope.auxiliariesListCache, true);
        };


        $scope.onAuxiliariesListChanged = function(newAuxiliariesList, newFilteredAuxiliariesList){
            $scope.filteredAuxiliariesList = newFilteredAuxiliariesList;
            $scope.auxiliariesList = newAuxiliariesList;
        };


        $scope.isSelected = function(auxiliary){
            return auxiliary === $scope.selectedAuxiliary;
        };

        $scope.selectAuxiliary = function(auxiliary) {
            $scope.selectedAuxiliary = auxiliary;
        };

        $scope.selectSection = function(section) {
            $scope.auxiliarySelectedSection = section;
        };

        $scope.clearSelectedValues = function() {
            $scope.auxiliariesList = [];
            $scope.filteredAuxiliariesList = [];
            $scope.auxiliariesListCache = {};
            $scope.selectedAuxiliary = {};
            $scope.$broadcast('clearAuxiliarySelectedValues');
        };

        $scope.$on('updatedSelectedValues', function(event, source) {
            if (source === 'characteristics-selection'){
                $scope.filtersLoaded = true;
            }
        });
    });
