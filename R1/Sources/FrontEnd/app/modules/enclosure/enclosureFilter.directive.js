'use strict';

angular
.module('enclosure')
.directive('enclosureFilter', function() {
    return {
        restrict: 'E',
        scope: {
            solution: '=solution',
            searchSolution: '=search'
        },
        templateUrl: 'modules/enclosure/enclosureFilter.directive.view.html',
        controller: function ($scope, $element, _, Project, productConfigurationService, searchSolutionService, RangeItemType, Filter, Characteristic) {
            $scope.characteristics = [];
            $scope.selectedCharacteristics = {};
            $scope.busy = false;

            var enclosureCharacteristics = Project.current.selectedSwitchboard.enclosureCharacteristics;
            enclosureCharacteristics.forEach(function(c){
                if (!c.sourcedFromEnclosuresDB){
                    c.values = c.displayFilter(c.values);
                }
            });

            // map a set of Filter objects to a set of Characteristic objects for Characteristic that have a selected value
            var getAsFilters = function(characteristics){
                var subset = _.filter(characteristics, function(c) {
                    return c.selectedValue !== null && c.sourcedFromEnclosuresDB && c.selectedValue !== Characteristic.indifferentValue;
                });
                return _.map(subset, function(c) {
                    return c.getAsMechanicalFilter();
                });
            };

            // TODO : Quick and dirty hack to fix bug with prisma G and modular enclosure shared combos having incoherent possible values
            var getInvisibleFilters = function () {
                var filters = [];
                if ($scope.solution.numberOfVerticalModules > 0) {
                    filters.push( new Filter('range', 'Equal', 'PRISMA_G'));
                } else {
                    filters.push( new Filter('range', 'NotEqual', 'PRISMA_G'));
                }
                return filters ;
            };

            var filterRangeValues = function() {
                var rangeCharacteristic = _.filter($scope.characteristics, function(characteristic) {
                    return characteristic.name === 'range';
                });

                if(rangeCharacteristic.length > 0) {
                    if ($scope.solution.numberOfVerticalModules > 0) {
                        // Only "PRISMA_G" value is available in the range values to prevent the user to switch from modular to functional enclosure
                        rangeCharacteristic[0].values = ['PRISMA_G'];
                    } else {
                        // Remove "PRISMA_G" value in the range list to prevent the user to switch from modular to functional enclosure
                        if (rangeCharacteristic[0].values.indexOf('PRISMA_G') !== -1) {
                            rangeCharacteristic[0].values.splice(rangeCharacteristic[0].values.indexOf('PRISMA_G'), 1);
                        }
                    }
                }
            };

            var filterFiltersCompatibleWithSolution = function() {
                if ($scope.solution.numberOfVerticalModules > 0) {
                    $scope.characteristics = _.filter($scope.characteristics, function(characteristic) {
                        return characteristic.name !== 'rows' && characteristic.name !== 'modulesWidth' && characteristic.name !== 'range';
                    });
                } else {
                    $scope.characteristics = _.filter($scope.characteristics, function(characteristic) {
                        return characteristic.name !== 'numberOfVerticalModules' && characteristic.name !== 'doorDuct' && characteristic.name !== 'wireOutgoingInDuct';
                    });
                }
            };

            var searchCharacteristics = function () {
                $scope.busy = true;

                var enclosureFilters = [];
                enclosureFilters = enclosureFilters.concat(getInvisibleFilters());
                enclosureFilters = enclosureFilters.concat(getAsFilters(enclosureCharacteristics));
                enclosureFilters = enclosureFilters.concat(getAsFilters(Project.current.selectedSwitchboard.contextCharacteristics));
                enclosureFilters = enclosureFilters.filter(function(n){
                    return n !== null;
                });

                searchSolutionService.updateMechanicalFilters(Project.current.selectedSwitchboard.electricBasket.list, enclosureFilters, []).then(function(updatedFilters) {
                    enclosureCharacteristics.forEach(function(characteristic) {
                        // take filters that do not match current characteristic name to find its possible values
                        var adaptedFilters = _.filter(updatedFilters.enclosureFilters, function(f) {
                            return f.characteristic !== characteristic.name;
                        });

                        productConfigurationService
                            .searchCompatibleFilters(adaptedFilters, characteristic.name, RangeItemType.mechanicalRange)
                            .then(function(result) {
                                characteristic.updateValues(characteristic.displayFilter(result));
                                characteristic.displayValue = characteristic.selectedValue? characteristic.selectedValue:characteristic.values[0];
                            }).then(function(){
                                filterFiltersCompatibleWithSolution();
                                filterRangeValues();
                                $scope.busy = false;
                            });
                    });
                }, function() {
                    $scope.busy = false;
                });
            };

            // clear all selected value of characteristics
            $scope.clear = function() {
                $scope.characteristics.forEach(function(characteristic) {
                    characteristic.selectedValue = null;
                });

                // clear the wishes
                Project.current.selectedSwitchboard.clearEnclosureSolutionWishes();

                searchCharacteristics();
            };

            // use the current characteristics to find a new solution
            $scope.apply = function() {
                // sets the selected value to the currently displayed value
                $scope.characteristics.forEach(function(characteristic){
                    characteristic.selectedValue = characteristic.displayValue;
                });

                Project.current.selectedSwitchboard.addEnclosureSolutionWishes($scope.selectedCharacteristics);
                $scope.searchSolution(getAsFilters(enclosureCharacteristics), true);
            };

            $scope.close = function() {
                $scope.searchSolution();
            };

            var storeSelectedCharacteristic = function(characteristic) {
                $scope.selectedCharacteristics[characteristic.name] = characteristic;
            };

            // occurs when user selects a characteristic
            $scope.onCharacteristicSelected = function(characteristic, selectedValue) {
                characteristic.selectedValue = selectedValue;
                characteristic.displayValue = selectedValue;

                storeSelectedCharacteristic(characteristic, selectedValue);

                if (_.contains(enclosureCharacteristics, characteristic)){
                    searchCharacteristics();
                }
            };

            var initCharacteristicValuesToUserWishes = function(){
                for(var wish in Project.current.selectedSwitchboard.enclosureSolutionWishes) {
                    if (Project.current.selectedSwitchboard.enclosureSolutionWishes.hasOwnProperty(wish)) {
                        var characteristic = _.findWhere($scope.characteristics, {name: wish});
                        if (characteristic) {
                            characteristic.selectedValue = Project.current.selectedSwitchboard.enclosureSolutionWishes[wish].selectedValue;
                        }
                    }
                }
            };

            // watch changes on the 'solution' scope property and recompute filters when it changes
            $scope.$watch('solution', function(){
                if ($scope.solution) {
                    // clear all selected value
                    enclosureCharacteristics.forEach(function(characteristic){
                        characteristic.selectedValue = null;
                    });

                    $scope.characteristics = Project.current.selectedSwitchboard.enclosureCharacteristics;

                    initCharacteristicValuesToUserWishes();

                    searchCharacteristics();
                }
            });
        }
    };
});