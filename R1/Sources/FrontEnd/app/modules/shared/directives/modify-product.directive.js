'use strict';

angular
.module('shared')
.directive('modifyProduct', function() {
    return {
        restrict: 'E',
        scope: {
            productitem: '=productitem'
        },
        templateUrl: 'modules/shared/directives/modify-product.directive.view.html',
        controller: function($scope, $timeout, _, Characteristic, Filter, productConfigurationService , Project, partInfoService, auxiliariesService, $filter, RangeItemType, auxiliariesSelectionService, networkService) {

            $scope.displayedCharacteristics = [];

            var getHeritedFilters = function(){
                return Project.current.selectedSwitchboard.getElectricFilters().filter(function (el) {
                    return $scope.productitem.rangeItem.projectContextFiltersIgnored.indexOf(el.characteristic) < 0;
                }).concat($scope.productitem.rangeItem.permanentFilters);
            };

            var getCharacteristicAsFilter = function(characteristic) {
                return new Filter(characteristic.name, Filter.equal, characteristic.displayValue);
            };

            // update possible values and displayed values of each combos
            var updateCombos = function() {

                $scope.busy = true;

                var selectedCharacteristics = _.filter($scope.displayedCharacteristics, function(c) {
                    return c.selectedValue !== null;
                });
                var selectedCharacteristicsFilters = _.map(selectedCharacteristics, function(c) {
                    return getCharacteristicAsFilter(c);
                });

                var updateComboPossibleValues = function(characteristic) {
                    var filters = getHeritedFilters().concat(_.filter(selectedCharacteristicsFilters, function(f) {
                        return f.characteristic !== characteristic.name;
                    }));

                    productConfigurationService.searchCompatibleFilters(
                        filters,
                        characteristic.name,
                        RangeItemType.electricalRange)
                        .then(function(result) {
                            // update combo possible values
                            characteristic.values = result;
                        });
                };

                // update possible values
                $scope.displayedCharacteristics.forEach(function(characteristic) {
                    updateComboPossibleValues(characteristic);
                });

                // update displayed values

                // get filters corresponding to characteristics which have not been selected (wishes)
                var notSelectedCharacteristics = _.filter($scope.displayedCharacteristics, function(c) {
                    return c.selectedValue === null;
                });
                var notSelectedCharacteristicsFilters = _.map(notSelectedCharacteristics, function(c) {
                    return getCharacteristicAsFilter(c);
                });

                var filters = getHeritedFilters().concat(selectedCharacteristicsFilters);

                productConfigurationService.getDefaultValuesWithWishes(
                    filters,
                    _.map(notSelectedCharacteristics, function(c) { return c.name; }),
                    notSelectedCharacteristicsFilters,
                    300
                ).then(function(result) {
                        result.characteristics.forEach(function(characteristic) {
                            _.findWhere($scope.displayedCharacteristics, { name: characteristic.name }).displayValue = characteristic.values[0];
                        });
                        $scope.busy = false;
                    }, function() {
                        $scope.busy = false;
                    });
            };

            // init characteristics
            // displayed value are those which have been selected by the user when he added the product
            var initDisplayedCharacteristics = function() {
                $scope.displayedCharacteristics = [];
                $scope.productitem.characteristics.forEach(function(characteristic) {
                    var displayedCharacteristic = new Characteristic(characteristic.name, null);
                    displayedCharacteristic.displayValue = characteristic.selectedValue;
                    $scope.displayedCharacteristics.push(displayedCharacteristic);
                });
                updateCombos();
            };

            $scope.busy = false;

            $scope.onCharacteristicSelected = function(characteristic, value) {
                characteristic.selectedValue = value;
                characteristic.displayValue = value;
                updateCombos();
            };

            $scope.onClearButtonClick = function() {
                initDisplayedCharacteristics();
            };

            // Update the product
            $scope.onApplyButtonClick = function() {

                var newProductPack = $scope.productitem.clone();

                var productHadAuxiliaries = auxiliariesService.hasAuxiliaries($scope.productitem.product);

                var characteristicsFilters = _.map($scope.displayedCharacteristics, function(c) {
                    return getCharacteristicAsFilter(c);
                });

                var filters = Project.current.selectedSwitchboard.getElectricFilters().filter(function (el) {
                        return newProductPack.rangeItem.projectContextFiltersIgnored.indexOf(el.characteristic) < 0;
                    }).concat(newProductPack.rangeItem.permanentFilters).concat(characteristicsFilters);

                // Update productitem characteristics
                var characteristics = [];
                $scope.displayedCharacteristics.forEach(function(characteristic) {
                    characteristics.push(new Characteristic(characteristic.name, characteristic.displayValue));
                });

                newProductPack.characteristics = characteristics;

                // TODO : Add an API to get products compatible with specified filters
                productConfigurationService.getDefaultValues(
                    filters,
                    _.map(newProductPack.rangeItem.mainCharacteristics, function(c) { return c.name; }),
                    50).then(function(characteristicsDescriptor) {

                    var products = characteristicsDescriptor.products;

                    /* If products references have been returned create the detailed products*/
                    if (products.values.length > 0) {
                        partInfoService.getDetailedProducts(products.values, Project.current.priceList.id).then(function(detailedProducts) {

                            newProductPack.product = $filter('min')(detailedProducts, 'price')[0];

                            if(productHadAuxiliaries) {
                                // check if modified product can have auxiliaries
                                productConfigurationService.findIfCompatibleAuxiliariesExist(newProductPack).then(function (productCanHaveAuxilaries) {
                                    // if it does, open the window to configure auxiliaries
                                    if (productCanHaveAuxilaries) {
                                        auxiliariesSelectionService.selectAuxiliaries(newProductPack);
                                    }
                                });
                            }

                            networkService.modifyProduct($scope.productitem.product, newProductPack);
                            $scope.$emit('ProductModified', newProductPack);
                        });
                    }
                });
            };

            // retrieve characteristic definition corresponding to characteristic name.
            // characteristic definition are used to format and translate characteristic value
            $scope.getCharacteristicDefinition = function(charactName) {
                return _.find($scope.productitem.rangeItem.mainCharacteristics, function(mainCharact) {
                    return mainCharact.name === charactName;
                });
            };

            initDisplayedCharacteristics();
        }
    };
});