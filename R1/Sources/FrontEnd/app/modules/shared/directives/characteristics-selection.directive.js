'use strict';

angular
    .module('shared')
    .directive('characteristicsSelection', function () {
        return {
            restrict: 'E',
            scope: {
                range: '=range',
                onProductsListChanged: '=onProductsListChanged',
                fillProductsList: '=fillProductsList',
                mainProductPack: '=mainProductPack',
                auxiliarySelectedSection: '=auxiliarySelectedSection',
                hideClearButton: '=hideClearButton',
                auxiliaries: '@auxiliaries',
                defaultProductPack: '=defaultProductPack'
            },
            templateUrl: 'modules/shared/directives/characteristics-selection.directive.view.html',
            controller: function ($scope, $q, gettextCatalog, $filter, _, logger, Filter, Characteristic, ProductPack, Project, rangeService, productConfigurationService, switchboardContentService, productConfigurationTrackingService, defaultValuesHistoricService, googleAnalyticsService, RangeItemType) {

                $scope.possibleValues = {};
                var historicKey = null;
                var auxiliariesAlreadyInitialized = false;
                var NONE_VALUE = 'NOT_APPLICABLE';
                $scope.isEmptySection = true;

                var getHeritedFilters = function () {
                    return Project.current.selectedSwitchboard.getElectricFilters().filter(function (el) {
                        return $scope.range.projectContextFiltersIgnored.indexOf(el.characteristic) < 0;
                    }).concat($scope.range.permanentFilters);
                };

                var getCombosPossibleValues = function () {

                    var deferredGlobal = $q.defer();

                    var getComboPossibleValues = function (characteristic) {

                        //PFR add array of promise to synchronize
                        var deferredCharacteristic = $q.defer();

                        var characteristicFilters = _.reject($scope.selectedEquipmentCaract, function (c) {
                            return c.characteristic === characteristic;
                        });

                        var filters;
                        if ($scope.range.type === RangeItemType.auxiliariesRange) {
                            filters = characteristicFilters;
                            if ($scope.mainProductPackFilters !== undefined) {
                                filters = $scope.mainProductPackFilters.concat(characteristicFilters);
                            }
                        } else {
                            filters = getHeritedFilters().concat(characteristicFilters);
                        }

                        var promise = productConfigurationService.searchCompatibleFilters(filters, characteristic, $scope.range.type);

                        promise.then(function (result) {
                            deferredCharacteristic.resolve({characteristic: characteristic, values: result});
                        }, function (err) {
                            // Alert the user if there's an error
                            logger.error(gettextCatalog.getString('ERROR_CANNOT_GET_FILTERS'), err, 'getComboPossibleValues', true);
                            deferredCharacteristic.reject(err);
                        });


                        return deferredCharacteristic.promise;
                    };
                    //PFR introduce promise to synchronise
                    var arrayOfPromise = [];

                    for (var index in $scope.range.mainCharacteristics) {
                        arrayOfPromise.push(getComboPossibleValues($scope.range.mainCharacteristics[index].name));
                    }

                    $q.all(arrayOfPromise).then(function (results) {
                        results.forEach(function (result) {
                            if (result.values.length < 1) {
                                $scope.possibleValues[result.characteristic] = [];
                            } else {
                                $scope.possibleValues[result.characteristic] = result.values;
                            }
                        });
                        deferredGlobal.resolve(results);
                    }, function (error) {
                        deferredGlobal.reject(error);
                    });

                    return deferredGlobal.promise;
                };

                var fillDefaultValues = function (result) {
                    $scope.defaultValues = [];
                    result.characteristics.forEach(function (characteristic) {
                        $scope.defaultValues.push(new Filter(characteristic.name, Filter.equal, characteristic.values[0]));
                    });
                };

                var getAuxiliariesRangePromise = function (deferred) {

                    if (!auxiliariesAlreadyInitialized) {
                        $scope.defaultValues = [];
                        for (var index in $scope.range.mainCharacteristics) {

                            var characteristic = $scope.range.mainCharacteristics[index];
                            $scope.defaultValues.push(new Filter(characteristic.name, Filter.equal, characteristic.defaultValue));

                            if (characteristic.defaultValue !== '') {
                                var filter = _.findWhere($scope.selectedEquipmentCaract, {characteristic: characteristic.name});
                                if (filter === undefined || filter === null) {
                                    $scope.selectedEquipmentCaract.push(new Filter(characteristic.name, Filter.equal, characteristic.defaultValue));
                                } else {
                                    filter.value = characteristic.defaultValue;
                                }
                            }
                        }

                        auxiliariesAlreadyInitialized = true;
                        deferred.resolve('getCombosDefaultValues done');
                    } else {


                        deferred.resolve('getCombosDefaultValues done');
                    }

                    return deferred;
                };

                var getDistributionsRangePromise = function (deferred) {
                    var distributionPromise;
                    var distributionFilters = getHeritedFilters().concat($scope.selectedEquipmentCaract);

                    if ($scope.defaultProductPack !== null && $scope.defaultProductPack !== undefined) {
                        var distributionDefaultProductPackValuesFilters = [];
                        $scope.defaultProductPack.characteristics.forEach(function (characteristic) {
                            var characteristicFilter = new Filter(characteristic.name, Filter.equal, characteristic.selectedValue);
                            distributionDefaultProductPackValuesFilters.push(characteristicFilter);
                        });

                        distributionFilters = distributionFilters.concat(distributionDefaultProductPackValuesFilters);

                        distributionPromise = productConfigurationService.getDistributionsDefaultValues(
                            distributionFilters,
                            _.map($scope.range.mainCharacteristics, function (c) {
                                return c.name;
                            }),
                            300);
                    } else {

                        distributionPromise = productConfigurationService.getDistributionsDefaultValues(
                            distributionFilters,
                            _.map($scope.range.mainCharacteristics, function (c) {
                                return c.name;
                            }),
                            300);
                    }

                    distributionPromise.then(function (distributionResult) {
                        if (distributionResult.products.count < 1) {
                            //TODO add message/notification
                            $scope.productFound = false;
                            $scope.productsList = [];
                            $scope.filteredProductsList = [];
                            productConfigurationTrackingService.clearSelectedCharacteristics();
                            $scope.fillProductsList(distributionResult, false);
                        } else {
                            $scope.productFound = true;
                            $scope.fillProductsList(distributionResult, false);
                            fillDefaultValues(distributionResult);
                        }

                        deferred.resolve('getCombosDefaultValues done');
                    }, function (err) {
                        // Alert the user if there's an error
                        logger.error(gettextCatalog.getString('ERROR_CANNOT_GET_FILTERS'), err, 'getCombosDefaultValues', true);
                        deferred.reject(err);
                    });

                    return deferred;
                };

                var getCombosDefaultValues = function () {

                    //PFR introduce promise to synchronise
                    var deferred = $q.defer();

                    // for auxiliaries, default values are coming directly from the JSON configuration
                    if ($scope.range.type === RangeItemType.auxiliariesRange) {
                        // TODO WBA : better way to do ?
                        return getAuxiliariesRangePromise(deferred).promise;
                    }

                    if ($scope.range.type === RangeItemType.distributionsRange) {
                        return getDistributionsRangePromise(deferred).promise;
                    }

                    //Use defaultValuesHistoricService to get most used devices
                    var defaultValuesFromHistoric = defaultValuesHistoricService.searchDefaultFilters(historicKey, $scope.selectedEquipmentCaract, true);
                    // if default values are found from historic use them directly
                    if (defaultValuesFromHistoric && defaultValuesFromHistoric.filterArray) {
                        $scope.lastDefaultValuesRetrievedFromHistoric = defaultValuesFromHistoric.filterArray;
                    }

                    var filters = getHeritedFilters().concat($scope.selectedEquipmentCaract);

                    var promise;

                    if ($scope.defaultProductPack !== null && $scope.defaultProductPack !== undefined) {
                        //if we're modifying a device, then get default values from the modified product pack (=defaultProductPack)
                        var defaultProductPackValuesFilters = [];
                        $scope.defaultProductPack.characteristics.forEach(function (characteristic) {
                            var characteristicFilter = new Filter(characteristic.name, Filter.equal, characteristic.selectedValue);
                            defaultProductPackValuesFilters.push(characteristicFilter);
                        });

                        filters = filters.concat(defaultProductPackValuesFilters);

                        promise = productConfigurationService.getDefaultValues(
                            filters,
                            _.map($scope.range.mainCharacteristics, function (c) {
                                return c.name;
                            }),
                            300);
                    } else if ($scope.lastDefaultValuesRetrievedFromHistoric) {
                        // use lastDefaultValuesRetrievedFromHistoric as wishes to select best value
                        promise = productConfigurationService.getDefaultValuesWithWishes(
                            filters,
                            _.map($scope.range.mainCharacteristics, function (c) {
                                return c.name;
                            }),
                            $scope.lastDefaultValuesRetrievedFromHistoric,
                            300
                        );
                    } else {
                        promise = productConfigurationService.getDefaultValues(
                            filters,
                            _.map($scope.range.mainCharacteristics, function (c) {
                                return c.name;
                            }),
                            300);
                    }

                    promise.then(function (result) {

                        if (result.products.count < 1) {
                            //TODO add message/notification
                            $scope.productFound = false;
                            $scope.productsList = [];
                            $scope.filteredProductsList = [];
                            $scope.fillProductsList(result, false);
                            fillDefaultValues(result);
                            productConfigurationTrackingService.clearSelectedCharacteristics();
                        } else {
                            $scope.productFound = true;
                            $scope.fillProductsList(result, false, defaultValuesFromHistoric.chosenProducts);
                            fillDefaultValues(result);
                        }

                        deferred.resolve('getCombosDefaultValues done');

                    }, function (err) {
                        // Alert the user if there's an error
                        logger.error(gettextCatalog.getString('ERROR_CANNOT_GET_FILTERS'), err, 'getCombosDefaultValues', true);
                        deferred.reject(err);
                    });

                    return deferred.promise;
                };

                var getFilter = function (array, characteristic) {
                    return _.find(array, function (filter) {
                        return filter.characteristic === characteristic.name;
                    });
                };

                var getNoneValue = function (characteristic) {
                    return _.find($scope.possibleValues[characteristic.name], function (value) {
                        return value === NONE_VALUE;
                    });
                };

                var updateCombos = function () {
                    $scope.busy = true;

                    getCombosDefaultValues().then(
                        function () {
                            getCombosPossibleValues().then(function () {

                                if ($scope.range.type === RangeItemType.auxiliariesRange) {
                                    var defaultValuesFilter;
                                    var selectedEquipmentFilter;
                                    var noneValue;

                                    //for each main characteristic
                                    for (var index in $scope.range.mainCharacteristics) {

                                        var characteristic = $scope.range.mainCharacteristics[index];

                                        //look if this characteristic is already set (by the user or by a None value)
                                        selectedEquipmentFilter = getFilter($scope.selectedEquipmentCaract, characteristic);
                                        defaultValuesFilter = getFilter($scope.defaultValues, characteristic);

                                        if (selectedEquipmentFilter === undefined) {

                                            //if it is not a selected value, look if there is a None value in possible values
                                            noneValue = getNoneValue(characteristic);

                                            if (noneValue !== undefined) {
                                                //if there is a None value, select it and use it as a filter for other possible values
                                                defaultValuesFilter.value = NONE_VALUE;

                                                var filter = _.findWhere($scope.selectedEquipmentCaract, {characteristic: characteristic.name});

                                                if (filter === undefined || filter === null) {
                                                    $scope.selectedEquipmentCaract.push(new Filter(characteristic.name, Filter.equal, NONE_VALUE));
                                                }
                                            } else {
                                                //if there is no None value, select the first possible value that the user would see
                                                var sorted = $filter('orderBy1210ab')($scope.possibleValues[characteristic.name]);
                                                defaultValuesFilter.value = sorted[0];
                                            }
                                        }
                                    }

                                    var filters = $scope.defaultValues.concat($scope.mainProductPackFilters);
                                    var hierarchizedFilters = productConfigurationService.fixFiltersByDependencies(filters, NONE_VALUE);

                                    var promise = productConfigurationService.getAuxiliariesDefaultValues(
                                        hierarchizedFilters,
                                        _.map($scope.range.mainCharacteristics, function (c) {
                                            return c.name;
                                        }),
                                        300);

                                    promise.then(function (result) {

                                        if (result.products.values.length === 1 && result.products.values[0] === '') {
                                            result.products.values = [];
                                        }
                                        if (result.products.count < 1) {
                                            //TODO add message/notification
                                            $scope.productFound = false;
                                            $scope.productsList = [];
                                            $scope.filteredProductsList = [];
                                            productConfigurationTrackingService.clearSelectedCharacteristics();
                                        } else {
                                            $scope.productFound = true;
                                            $scope.fillProductsList(result, false);
                                        }

                                        //setting default values may have an impact on possible values => we reload them
                                        getCombosPossibleValues().then(function () {
                                            $scope.setDisplayedMainCharacteristics();
                                            $scope.$emit('updatedSelectedValues', 'characteristics-selection');
                                        }, function () {
                                            $scope.$emit('updatedSelectedValues', 'characteristics-selection');
                                        });

                                    }, function (err) {
                                        // Alert the user if there's an error
                                        logger.error(gettextCatalog.getString('ERROR_CANNOT_GET_FILTERS'), err, 'getCombosDefaultValues', true);
                                    });
                                }
                                else {
                                    $scope.setDisplayedMainCharacteristics();
                                    $scope.$emit('updatedSelectedValues', 'characteristics-selection');
                                }
                                $scope.busy = false;
                            }, function () {
                                $scope.$emit('updatedSelectedValues', 'characteristics-selection');
                                $scope.busy = false;
                            });
                        }, function () {
                            $scope.$emit('updatedSelectedValues', 'characteristics-selection');
                            $scope.busy = false;
                        });
                };

                $scope.onCharacteristicSelected = function (caractName, caractValue) {
                    $scope.defaultProductPack = null;
                    var filter = _.findWhere($scope.selectedEquipmentCaract, {characteristic: caractName});

                    if (filter === undefined || filter === null) {
                        $scope.selectedEquipmentCaract.push(new Filter(caractName, Filter.equal, caractValue));
                    } else {
                        filter.value = caractValue;
                    }

                    productConfigurationTrackingService.characSelected(caractName);

                    if ($scope.range.type === RangeItemType.auxiliariesRange) {

                        $scope.defaultValues.forEach(function (defaultValue) {
                            if (defaultValue.characteristic === caractName) {
                                defaultValue.value = caractValue;
                            }
                        });
                    }

                    updateCombos();
                };

                $scope.onClearButtonClick = function () {
                    $scope.selectedEquipmentCaract = [];
                    updateCombos();
                    googleAnalyticsService.sendEvent('Application', 'Product configuration clear button click', 'Product configuration clear button click');
                };

                $scope.clearAuxiliariesSelectedValues = function () {
                    if ($scope.range.type === RangeItemType.auxiliariesRange) {
                        auxiliariesAlreadyInitialized = false;
                        $scope.defaultValues = [];
                        $scope.selectedEquipmentCaract = [];
                        updateCombos();
                    }
                };

                $scope.$on('clearAuxiliarySelectedValues', $scope.clearAuxiliariesSelectedValues);
                $scope.$on('clearSelectedValues', $scope.onClearButtonClick);

                $scope.busy = false;

                /**
                 * Determines if the characteristic choices can be displayed by analyzing the list of possibles values.
                 * Implemented following EQ-701
                 * @param possibleValues
                 * @returns {boolean} True if the characteristic selector can be displayed. False otherwise.
                 */
                $scope.canBeDisplayed = function (possibleValues) {
                    if (possibleValues) {

                        var valuesSize = possibleValues.length;

                        switch (valuesSize) {
                            case 0:
                                return false;
                            case 1:
                                var onlyValue = possibleValues[0];
                                if (onlyValue === null || onlyValue === NONE_VALUE) {
                                    return false;
                                }
                                break;
                            case 2:
                                // HACK WBA : in some cases there is NOT_APPLICABLE and a null value
                                // and this is a disappearing case
                                if (_.contains(possibleValues, NONE_VALUE) &&
                                    _.contains(possibleValues, null)) {
                                    return false;
                                }
                                break;
                            default:
                                return true;
                        }
                    }

                    return true;
                };

                $scope.unselectCaract = function (caractName) {
                    productConfigurationTrackingService.characUnselected(caractName);
                };

                $scope.isSelected = function (charactName) {
                    return _.findWhere($scope.selectedEquipmentCaract, {characteristic: charactName}) !== undefined;
                };

                $scope.setDisplayedMainCharacteristics = function () {
                    $scope.range.displayedMainCharacteristics = _.filter($scope.range.mainCharacteristics, function (c) {
                        return c.auxiliariesSection === $scope.auxiliarySelectedSection;
                    });

                    $scope.isEmptySection = true;
                    $scope.range.displayedMainCharacteristics.forEach(function (characteristic) {
                        if ($scope.canBeDisplayed($scope.possibleValues[characteristic.name])) {
                            $scope.isEmptySection = false;
                        }
                    });

                };

                var init = function () {
                    if ($scope.defaultProductPack !== null && $scope.defaultProductPack !== undefined) {
                        $scope.selectedEquipmentCaract = [];
                        $scope.defaultValues = [];
                        updateCombos();
                    } else if ($scope.range.type === RangeItemType.auxiliariesRange) {
                        productConfigurationService.buildFiltersForAuxiliaries($scope.mainProductPack).then(function (result) {
                            $scope.mainProductPackFilters = result;
                            $scope.selectedEquipmentCaract = [];
                            $scope.defaultValues = [];
                            updateCombos();
                        });
                    } else {
                        if ($scope.range.rangeName !== undefined) {
                            $scope.selectedEquipmentCaract = [];
                            $scope.defaultValues = [];
                            $scope.lastDefaultValuesRetrievedFromHistoric = null;

                            historicKey = defaultValuesHistoricService.getHistoricKey(Project.current.selectedSwitchboard.getElectricFilters(), $scope.range.rangeName);

                            updateCombos();
                        }
                    }
                    $scope.setDisplayedMainCharacteristics();
                };

                $scope.$watch('range', function () {
                    if ($scope.range !== null) {
                        init();
                    }
                });

                $scope.$watch('auxiliarySelectedSection', function () {
                    if ($scope.range !== null) {
                        $scope.setDisplayedMainCharacteristics();
                    }
                });

                $scope.$on('updateHistoryValues', function (event, productPack) {
                    defaultValuesHistoricService.incrementDefaultValuesUsage(historicKey, $scope.defaultValues, productPack);
                });
            }
        };
    });
