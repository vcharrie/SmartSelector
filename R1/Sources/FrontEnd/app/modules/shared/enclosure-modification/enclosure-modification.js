'use strict';

angular
    .module('shared')
    .controller('enclosureModification', function ($scope, $rootScope, $timeout, logger, $modalInstance, $window, $q, _, $filter, gettextCatalog, apiConstants, googleAnalyticsService,
                                                   Characteristic, Filter, searchSolutionService, RangeItemType,
                                                 rangeService, partInfoService, productConfigurationService, Project, switchboardContentService, productConfigurationTrackingService, saveLoadService, keyboardShortcutsService, translationService, discoversService,
                                                 requestKey, solution, searchSolution, errorMessage) {

        $scope.noSolutionFoundWithFiltersRequestKey = 'noSolutionWithFilters';
        $scope.noSolutionFoundWithoutFiltersRequestKey = 'noSolutionWithoutFilters';
        $scope.modifySolutionRequestKey = 'modify';
        $scope.requestKey = requestKey;
        $scope.solution = solution;
        $scope.searchSolution = searchSolution;
        $scope.errorMessage = '';

        $scope.projectContextCharacteristics = [];
        $scope.enclosureCharacteristics = [];
        $scope.selectedCharacteristics = {};
        $scope.closed = false;

        $scope.enclosureModificationLegendTooltip = '<div class="info-icon-tooltip-label"><span>' + gettextCatalog.getString('enclosure-modification-legend-tooltip-1') + '</span><br><br><span>' + gettextCatalog.getString('enclosure-modification-legend-tooltip-2') + '</span><br><br><span>' + gettextCatalog.getString('enclosure-modification-legend-tooltip-3') + '</span></div>';

        var switchboardProjectContextCharacteristics = Project.current.selectedSwitchboard.contextCharacteristics.filter(function (characteristic) {
            return characteristic.displayInProjectContext !== 'hidden';
        });
        var switchboardEnclosureCharacteristics = Project.current.selectedSwitchboard.enclosureCharacteristics;

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
            var rangeCharacteristic = _.filter($scope.enclosureCharacteristics, function(characteristic) {
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
                $scope.enclosureCharacteristics = _.filter($scope.enclosureCharacteristics, function(characteristic) {
                    return characteristic.name !== 'rows' && characteristic.name !== 'modulesWidth' && characteristic.name !== 'range';
                });
            } else {
                $scope.enclosureCharacteristics = _.filter($scope.enclosureCharacteristics, function(characteristic) {
                    return characteristic.name !== 'numberOfVerticalModules' && characteristic.name !== 'doorDuct' && characteristic.name !== 'wireOutgoingInDuct';
                });
            }
        };

        var searchProjectContextCharacteristics = function(excludedCharacteristic){
            var promise;

            var projectContextCharacteristics = $scope.projectContextCharacteristics;
            projectContextCharacteristics = _.reject(projectContextCharacteristics, function (c) {
                return c.name === excludedCharacteristic.name || c.name === 'incomingInDuct';
            });
            var filters = _.without(_.map(projectContextCharacteristics, function (c) {
                return c.getAsMechanicalFilter();
            }), null);

            var characteristicNames = _.map(switchboardProjectContextCharacteristics, function (c) {
                return c.name;
            });
            characteristicNames.forEach(function(characteristicName){

                promise = productConfigurationService
                    .searchCompatibleFilters(filters, characteristicName, RangeItemType.mechanicalRange)
                    .then(function (result) {
                        var characteristicToUpdate = _.findWhere($scope.projectContextCharacteristics, {name : characteristicName});
                        if (characteristicToUpdate){
                            characteristicToUpdate.updateValues(result);
                        }
                    }, function (err) {
                        // alert the user if there's an error
                        logger.error(gettextCatalog.getString('ERROR_CANNOT_GET_FILTERS'), err, 'searchCompatibleFilter', true);
                    });
            });

            return promise;
        };

        var searchCharacteristics = function () {

            var defered = $q.defer();

            if(!$scope.solution) {
                defered.resolve();
                return  defered.promise;
            }

            var enclosureFilters = [];
            enclosureFilters = enclosureFilters.concat(getInvisibleFilters());
            enclosureFilters = enclosureFilters.concat(getAsFilters(switchboardEnclosureCharacteristics));
            enclosureFilters = enclosureFilters.concat(getAsFilters(switchboardProjectContextCharacteristics));
            enclosureFilters = enclosureFilters.filter(function(n){
                return n !== null;
            });

            var promises = [];
            promises.push(searchProjectContextCharacteristics(''));
            promises.push(searchSolutionService.updateMechanicalFilters(Project.current.selectedSwitchboard.electricBasket.list, enclosureFilters, []));

            $q.all(promises).then(function(result){

                promises = [];

                switchboardEnclosureCharacteristics.forEach(function(characteristic) {

                    var updatedFilters = result[1];
                    // take filters that do not match current characteristic name to find its possible values
                    var adaptedFilters = _.filter(updatedFilters.enclosureFilters, function(f) {
                        return f.characteristic !== characteristic.name;
                    });

                    promises.push(productConfigurationService
                        .searchCompatibleFilters(adaptedFilters, characteristic.name, RangeItemType.mechanicalRange)
                        .then(function(result) {
                            characteristic.updateValues(characteristic.displayFilter(result));
                            characteristic.displayValue = characteristic.selectedValue? characteristic.selectedValue:characteristic.values[0];
                        }));
                });

                $q.all(promises).then(function(){
                    filterFiltersCompatibleWithSolution();
                    filterRangeValues();
                    defered.resolve();
                }, function(err) {
                    defered.reject(err);
                });


            }, function(err) {
                defered.reject(err);
            });

            return  defered.promise;
        };

        var storeSelectedCharacteristic = function(characteristic) {
            $scope.selectedCharacteristics[characteristic.name] = characteristic;
        };

        // occurs when user selects a characteristic
        $scope.onCharacteristicSelected = function(characteristic, selectedValue) {

            //HACK JRU
            var callback = characteristic.onSelectedValueChanged;
            characteristic.onSelectedValueChanged = null;

            characteristic.selectedValue = selectedValue;
            characteristic.displayValue = selectedValue;

            storeSelectedCharacteristic(characteristic, selectedValue);
            searchCharacteristics();

            characteristic.onSelectedValueChanged = callback;
        };

        $scope.onDropdownOpen = function(characteristic) {
            searchProjectContextCharacteristics(characteristic);
        };

        var initCharacteristicValuesToUserWishes = function(){
            for(var wish in Project.current.selectedSwitchboard.enclosureSolutionWishes) {
                if (Project.current.selectedSwitchboard.enclosureSolutionWishes.hasOwnProperty(wish)) {
                    var characteristic = _.findWhere($scope.enclosureCharacteristics, {name: wish});
                    if (characteristic) {
                        characteristic.selectedValue = Project.current.selectedSwitchboard.enclosureSolutionWishes[wish].selectedValue;
                    }
                }
            }
        };

        $scope.incrementQuantity = function () {
            $scope.currentProductPack.quantity++;
        };

        $scope.isProjectContextCharacteristicFiltered = function (characteristic){
          if (characteristic.selectedValue === Characteristic.indifferentValue) {
              return false;
          }
          return true;
        };

        $scope.isEnclosureCharacteristicFiltered = function (characteristic){
            if (characteristic.displayValue === Characteristic.indifferentValue){
                return false;
            }

            if (characteristic.name === 'wireOutgoingInDuct' && characteristic.displayValue === 'NO') {
                return false;
            }
            return true;
        };

        var storeProjectContextInitialValues = function() {
            $scope.storedInitialProjectContextCharacteristics = {};
            for(var characteristic in switchboardProjectContextCharacteristics) {
                $scope.storedInitialProjectContextCharacteristics[characteristic] = switchboardProjectContextCharacteristics[characteristic].selectedValue;
            }
        };

        var restoreProjectContextInitialValues = function() {
            for(var characteristic in switchboardProjectContextCharacteristics) {
                if($scope.storedInitialProjectContextCharacteristics[characteristic]) {
                    var callback = switchboardProjectContextCharacteristics[characteristic].onSelectedValueChanged;
                    switchboardProjectContextCharacteristics[characteristic].onSelectedValueChanged = null;
                    switchboardProjectContextCharacteristics[characteristic].selectedValue = $scope.storedInitialProjectContextCharacteristics[characteristic];
                    switchboardProjectContextCharacteristics[characteristic].onSelectedValueChanged = callback;
                }
            }
        };

        $scope.close = function (backToSwitchboardContent) {
            restoreProjectContextInitialValues();
            $modalInstance.close(backToSwitchboardContent);
            $scope.closed = true;
        };

        $scope.validate = function () {

            $scope.isSearchingSolution = true;
            $scope.errorMessage = null;
            $scope.storedInitialProjectContextCharacteristics = {};

            googleAnalyticsService.sendEvent('Application', 'Enclosure solution modified', 'Enclosure solution modified');

            // sets the selected value to the currently displayed value
            $scope.enclosureCharacteristics.forEach(function(characteristic){
                characteristic.selectedValue = characteristic.displayValue;
            });

            Project.current.selectedSwitchboard.addEnclosureSolutionWishes($scope.selectedCharacteristics);
            Project.current.selectedSwitchboard.isSolutionDirty = true;

            $scope.searchSolution(getAsFilters(switchboardEnclosureCharacteristics), true).then( function() {
                if(!$scope.closed) {
                    $modalInstance.close();
                }
            },
            // reject
            function () {
                // Keep the modal open
                // Display an error message
                $scope.isSearchingSolution = false;
                if (!solution){
                    $scope.errorMessage = gettextCatalog.getString('ERROR_NO_SOLUTION_WITH_CRITERIA_AND_DEVICES');
                } else {
                    $scope.errorMessage = gettextCatalog.getString('ERROR_NO_SOLUTION_WITH_CRITERIA');
                }

                //label animation
                $('.enclosure-modification-solution-still-not-found-label').animate({ opacity : 1}, 200);
                $('.enclosure-modification-solution-still-not-found-label').animate({ opacity : 1}, 800);
                $('.enclosure-modification-solution-still-not-found-label').animate({ opacity : 0}, 1000);
            });
        };

        $scope.onKeydown = function ($event) {
            keyboardShortcutsService.onKeydown($event);
        };

        // clear all selected value of characteristics
        $scope.clear = function () {

            // Clear enclosure characteristics
            $scope.enclosureCharacteristics.forEach(function(characteristic) {
                characteristic.selectedValue = null;
                characteristic.displayValue = null;
            });

            // Clear project context characteristics
            switchboardProjectContextCharacteristics.forEach(function(characteristic) {
                characteristic.selectedValue = Characteristic.indifferentValue;
            });

            // clear the wishes
            Project.current.selectedSwitchboard.clearEnclosureSolutionWishes();

            // clear the stored initial values
            $scope.storedInitialProjectContextCharacteristics = {};

            searchCharacteristics().then( function() {
                // search solution after clearing all parameters
                $scope.validate();
            });
        };

        // Height of modal body
        function applyHeight() {
            var modalHeight = $('.enclosure-modification').outerHeight();
            var headerHeight = $('.enclosure-modification .modal-header').outerHeight();
            var footerHeight = $('.enclosure-modification .modal-footer').outerHeight();
            var bodyMargins = parseInt($('.enclosure-modification .modal-body').css('padding-top'), 10) + parseInt($('.enclosure-modification .modal-body').css('padding-bottom'), 10);
            var additionalMargin = 12;
            var bodyHeight = modalHeight - (headerHeight + footerHeight + bodyMargins + additionalMargin);
            $('.enclosure-modification .modal-body').height(bodyHeight);
        }

        angular.element($window).bind('resize', function() {
            $scope.$apply(function() {
                applyHeight();
            });
        });

        $scope.noSolutionFoundInitialState = function(){
            return ($scope.requestKey === $scope.noSolutionFoundWithFiltersRequestKey || $scope.requestKey === $scope.noSolutionFoundWithoutFiltersRequestKey);
        };

        $scope.help = function(){
            var enclosureModificationDiscoverMagicId = 4;
            discoversService.openDialog(translationService.lang.authenticationLangKey, enclosureModificationDiscoverMagicId);
        };

        var init = function(){
            if ($scope.noSolutionFoundInitialState()) {
                $scope.modalTitle = gettextCatalog.getString('enclosure-modification-modal-title-no-solution-found');
            } else if ($scope.requestKey === $scope.modifySolutionRequestKey) {
                $scope.modalTitle = gettextCatalog.getString('enclosure-modification-modal-title-modify');
            }

            if (!solution){
                $scope.errorMessage = gettextCatalog.getString('ERROR_NO_SOLUTION_WITH_CRITERIA_AND_DEVICES');
            } else {
                if (errorMessage !== undefined) {
                    $scope.errorMessage = gettextCatalog.getString('ERROR_NO_SOLUTION_WITH_CRITERIA');
                }
            }

            switchboardEnclosureCharacteristics.forEach(function(c){
                if (!c.sourcedFromEnclosuresDB){
                    c.values = c.displayFilter(c.values);
                }
            });

            switchboardEnclosureCharacteristics.forEach(function(characteristic){
                characteristic.selectedValue = null;
            });

            $scope.projectContextCharacteristics = _.reject(switchboardProjectContextCharacteristics, function (c) {
                return c.name === 'ratedCurrent';
            });
            $scope.projectContextCharacteristics.forEach(function(c) {
                c.solutionName = c.name;
            });
            var ipCharacteristic = _.findWhere($scope.projectContextCharacteristics, {name: 'iP'});
            ipCharacteristic.solutionName = 'ip';

            $scope.enclosureCharacteristics = switchboardEnclosureCharacteristics;

            initCharacteristicValuesToUserWishes();
            searchCharacteristics();
            applyHeight();
            storeProjectContextInitialValues();
        };

        init();
    });
