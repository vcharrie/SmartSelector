'use strict';

/**
 * home controller
 */
angular.module('projectContext', ['ngRoute', 'business', 'rest'])
    .config(function ($routeProvider) {
        $routeProvider.when('/project-context',
            {
                controller: 'projectContext',
                templateUrl: 'modules/project-context/project-context.view.html',
                resolve: {
                    factory: ['projectService', '$location', function (projectService, $location) {
                        return projectService.checkProjectExists(function () {
                            $location.path('/');
                        });
                    }]
                }
            });
    })
    .controller('projectContext', function ($scope, $location, $timeout, gettextCatalog, _, projectService, Project, productConfigurationService, googleAnalyticsService, logger, RangeItemType, $q, dialogService, appConstants) {

        var characteristicsGlobal = [
            {
              "name": "Voltage",
              "tooltipDesc": "Insert tooltip desc",
              "displayTooltip": "true",
              "unit": "V",
              "selectedValue": "INDIFFERENT_CHARACTERISTIC_VALUE",
              "values": [
                "220...240 three phases",
                "380...415",
                "440"
              ]
            },
            {
              "name": "Motor rated power",
              "tooltipDesc": "Insert tooltip desc",
              "displayTooltip": "true",
              "unit": "kW",
              "selectedValue": "INDIFFERENT_CHARACTERISTIC_VALUE",
              "values": [
                "0,06",
                "0,09",
                "0,12"
              ]
            },
            {
              "name": "Starter Type",
              "tooltipDesc": "Insert tooltip desc",
              "displayTooltip": "true",
              "unit": "",
              "selectedValue": "INDIFFERENT_CHARACTERISTIC_VALUE",
              "values": [
                "Drive IP2x",
                "Direct on Line ; Reversing", 
                "Soft starter in line",
                "Soft starter inside Delta",
                "Drive IP5x",
                "Star-Delta"
              ]
            },
            {
              "name": "Circuit Breaker Protection Type",
              "tooltipDesc": "Insert tooltip desc",
              "displayTooltip": "true",
              "unit": "",
              "selectedValue": "INDIFFERENT_CHARACTERISTIC_VALUE",
              "values": [
                "Circuit Breaker",
                "FUSE"
              ]
            },
            {
              "name": "Motor Overload Protection Location",
              "tooltipDesc": "Insert tooltip desc",
              "displayTooltip": "true",
              "unit": "",
              "selectedValue": "INDIFFERENT_CHARACTERISTIC_VALUE",
              "values": [
                "ATS",
                "ATV",
                "Circuit Breaker",
                "Comb. Motor Starter",
                "Separate Relay"
              ]
            },
            {
              "name": "Coordination",
              "tooltipDesc": "Insert tooltip desc",
              "displayTooltip": "true",
              "unit": "",
              "selectedValue": "INDIFFERENT_CHARACTERISTIC_VALUE",
              "values": [
                "Total",
                "Type 1",
                "Type 2"
              ]
            }
        ];

        $scope.ranges = [
            {
              "name": "Short circuit protection",
              "tooltipDesc": "Insert tooltip desc",
              "displayTooltip": "true",
              "value": "GV2 L"
            },
            {
              "name": "Control contactor",
              "tooltipDesc": "Insert tooltip desc",
              "displayTooltip": "true",
              "value": "LC1D"
            },
            {
              "name": "Overload protection",
              "tooltipDesc": "Insert tooltip desc",
              "displayTooltip": "true",
              "value": "LRD"
            }
        ];

        $scope.switchobardAvailableType =
            [
                {
                    label:'switchboard-type-main',
                    value:'main'
                },
                {
                    label:'switchboard-type-secondary',
                    value:'secondary'
                }
            ];

        $scope.switchboardPacks = Project.current.switchboardPacks;

        $scope.project = Project.current;

        $scope.currency = appConstants.currency;

        $scope.allSwitchboardsInTheBomTooltip = '<span class="info-icon-tooltip-label">' + gettextCatalog.getString('all-switchboards-in-the-bom-tooltip-1') + '</span><br/><span class="info-icon-tooltip-label">' + gettextCatalog.getString('all-switchboards-in-the-bom-tooltip-2') + '</span>';
        $scope.projectContextSwitchboardPriceTooltip = '<span class="info-icon-tooltip-label">' + gettextCatalog.getString('project-context-switchboard-price-tooltip-1') + '</span><br/><br/><span class="info-icon-tooltip-label">' + gettextCatalog.getString('project-context-switchboard-price-tooltip-2') + '</span>';
        $scope.projectContextCompatibleRangesTooltip =  '<span class="info-icon-tooltip-label">' + gettextCatalog.getString('project-context-compatibles-ranges-tooltip') + '</span>';
        $scope.characteristicRatedCurrentTooltip = '<span class="info-icon-tooltip-label">' + gettextCatalog.getString('characteristic-rated-current-tooltip') + '</span>';
        $scope.projectContextRatedOperationalVoltageTooltip = '<div class="info-icon-tooltip-label"><span class="project-context-tip-content">' + gettextCatalog.getString('project-context-tip-1-content-1') + '</span><br><br><span class="project-context-tip-content-list-item">' + gettextCatalog.getString('project-context-tip-1-content-2') + '</span><br><br><span class="project-context-tip-content-list-item">' + gettextCatalog.getString('project-context-tip-1-content-3') + '</span><br><br><span class="project-context-tip-content-margined">' + gettextCatalog.getString('project-context-tip-1-content-4') + '</span></div>';

        $scope.allSelected = true;
        $scope.switchboardSelectionLoading = false;

        var areAllSelectedValue = function () {
            var allSelected = true;
            for (var iswitchboard in Project.current.switchboardPacks) {
                var switchboard = Project.current.switchboardPacks[iswitchboard];
                allSelected = allSelected && switchboard.isSelectedForBom;
            }
            return allSelected;
        };

        $scope.updateAreAllSelectedValue = function () {
            $scope.allSelected = areAllSelectedValue();
        };

        $scope.updateAreAllSelectedValue();

        function Characteristic () {
        }

        $scope.initCharacteristics = function () {
            $scope.characteristics = characteristicsGlobal;
        };

        $scope.initCharacteristics();

        var getCompatibleRanges = function(){

            var characteristics = $scope.characteristics();

            // If incomingInDuct is set to "YES", only PRISMA_G enclosures are compatible
            var incomingInDuctCharacteristic = _.reject(characteristics, function (c) {
                return c.name !== 'incomingInDuct';
            });

            characteristics = _.reject(characteristics, function (c) {
                return c.name === 'incomingInDuct';
            });

            var filters = _.without(_.map(characteristics, function (c) {
                return c.getAsMechanicalFilter();
            }), null);

            productConfigurationService
                .searchCompatibleFilters(filters, 'range', RangeItemType.mechanicalRange)
                .then(function (result) {
                    $scope.ranges = result;

                    if(incomingInDuctCharacteristic[0] && incomingInDuctCharacteristic[0]._selectedValue === 'YES'){
                        if($scope.ranges && $scope.ranges.indexOf('PRISMA_G') !== -1) {
                            $scope.ranges = ['PRISMA_G'];
                        }
                        else {
                            $scope.ranges = null;
                        }
                    }

                }, function (err) {
                    // alert the user if there's an error
                    logger.error(gettextCatalog.getString('ERROR_CANNOT_GET_FILTERS'), err, 'searchCompatibleFilter', true);
                });
        };

        var searchCharacteristics = function (excludedCharacteristic, searchCompatibleRanges) {

            /*var characteristics = $scope.characteristics();
            if (excludedCharacteristic) {
                characteristics = _.reject(characteristics, function (c) {
                    return c.name === excludedCharacteristic.name || c.name === 'incomingInDuct';
                });
            }
            var filters = _.without(_.map(characteristics, function (c) {
                return c.getAsMechanicalFilter();
            }), null);

            var characteristicNames = _.map(Project.current.selectedSwitchboard.contextCharacteristics, function (c) {
                return c.name;
            });


            var promises = [];
            characteristicNames.forEach(function(characteristicName){

                promises.push(productConfigurationService
                    .searchCompatibleFilters(filters, characteristicName, RangeItemType.mechanicalRange)
                    .then(function (result) {
                        var characteristicToUpdate = _.findWhere($scope.characteristics(), {name : characteristicName});
                        if (characteristicToUpdate){
                            characteristicToUpdate.updateValues(result);
                        }
                    }, function (err) {
                        // alert the user if there's an error
                        logger.error(gettextCatalog.getString('ERROR_CANNOT_GET_FILTERS'), err, 'searchCompatibleFilter', true);
                    }));
            });

            $q.all(promises).then(function() {
                if(searchCompatibleRanges) {
                    getCompatibleRanges();
                }
            });*/
        };

        var warnAboutMajorChange = function() {
            if(Project.current.selectedSwitchboard.enclosureSolution && !Project.current.selectedSwitchboard.isSolutionDirty) {
                logger.warning(gettextCatalog.getString('WARNING_PROJECT_MAJOR_IMPACT'), 'Changing a characteristic in the project context has a major impact on the project', 'warnAboutMajorChange', true, null, {
                    timeOut: 7000,
                    showUser: true
                });
            }
        };

        var storeSelectedCharacteristic = function(characteristic) {
            if(characteristic.name !== 'ratedCurrent') {
                var selectedCharacteristic = {};
                selectedCharacteristic[characteristic.name] = characteristic;
                Project.current.selectedSwitchboard.addEnclosureSolutionWishes(selectedCharacteristic);
            }
        };

        $scope.onCharacteristicSelected = function (characteristic, value, manualSelection, searchCompatibleRanges) {

            if(!manualSelection) {
                characteristic.selectedValue = value;
                searchCharacteristics(characteristic, searchCompatibleRanges);
            }
            else if(characteristic.selectedValue !== value) {
                warnAboutMajorChange();
                characteristic.selectedValue = value;
                characteristic.displayValue = value;
                storeSelectedCharacteristic(characteristic);
                searchCharacteristics(characteristic, searchCompatibleRanges);
            }
        };

        $scope.onDropdownOpen = function (characteristic) {
            searchCharacteristics(characteristic, false);
        };

        $scope.resetContextCharacteristics = function() {
            warnAboutMajorChange();
            googleAnalyticsService.sendEvent('Application', 'Project context clear button click', 'Project context clear button click');
            projectService.resetContextCharacteristics(Project.current.selectedSwitchboard).then( function () {

                getCompatibleRanges();

                // clear the wishes
                Project.current.selectedSwitchboard.clearEnclosureSolutionWishes();
            });
        };

        // Switchboards management

        $scope.createSwitchboard = function(){
            $scope.switchboardSelectionLoading = true;
            var translatedName = gettextCatalog.getString('new-switchboard-name');
            var newIndex = Project.current.getLastSwitchboardNumberNamed(translatedName) + 1;
            Project.current.createSwitchboard(newIndex===0 ? translatedName : (translatedName + ' ' + newIndex),1);

            // load project characteristics
            projectService.loadCharacteristics(Project.current.selectedSwitchboard).then(function() {
                $timeout(function(){
                    $scope.switchboardSelectionLoading = false;
                    searchCharacteristics(null,true);
                }, 100);

                $timeout(function(){
                    $('.switchboard-name-field').select();
                }, 200);
            });
        };

        $scope.stopPropagation = function(event){
            if (event.stopPropagation) {
                event.stopPropagation();
            }
            event.cancelBubble=true;
        };

        $scope.deleteSwitchboard = function(switchboardPack, event){
            $scope.stopPropagation(event);
            Project.current.deleteSwitchboard(switchboardPack);
        };

        $scope.moveUpSwitchboard = function(switchboardPack, event){
            $scope.stopPropagation(event);
            Project.current.moveUpSwitchboard(switchboardPack);
        };

        $scope.moveDownSwitchboard = function(switchboardPack, event){
            $scope.stopPropagation(event);
            Project.current.moveDownSwitchboard(switchboardPack);
        };

        $scope.selectSwitchboard = function(switchboardPack){
            if (!$scope.isSwitchboardSelected(switchboardPack)){
                $scope.switchboardSelectionLoading = true;
                Project.current.selectSwitchboard(switchboardPack);
                getCompatibleRanges();
                $timeout(function(){
                    $scope.switchboardSelectionLoading = false;
                }, 200);

                $timeout(function(){
                    $('.switchboard-name-field').select();
                }, 300);
            }
        };

        $scope.isSwitchboardSelected = function(switchboardPack){
            return Project.current.selectedSwitchboard === switchboardPack.switchboard;
        };

        $scope.isSwitchboardSelectedForBom = function(switchboardPack){
            return switchboardPack.isSelectedForBom;
        };

        $scope.isLastSwitchboard = function(switchboardPack){
            return Project.current.getSwitchboardIndex(switchboardPack)===Project.current.getSwitchboardsSize()-1;
        };

        $scope.isFirstSwitchboard = function(switchboardPack){
            return Project.current.getSwitchboardIndex(switchboardPack)===0;
        };

        $scope.isSwitchboardPriceValid = function(switchboardPack){
            return switchboardPack.switchboard.enclosureSolution !== null && !switchboardPack.switchboard.isSolutionDirty;
        };

        var getNameWithoutNumberSuffix = function (name) {
            name = name.trim();
            var suffix = name.match(/\d*$/)[0];
            if (suffix.length === 0) {
                return name;
            } else {
                return name.slice(0, -suffix.length).trim();
            }
        };

        $scope.duplicateSwitchboard = function(switchboardPack, event){
            $scope.stopPropagation(event);
            $scope.switchboardSelectionLoading = true;
            var oldName = /*gettextCatalog.getString('switchboard-copy-of') + ' ' +*/ getNameWithoutNumberSuffix(switchboardPack.switchboard.name);
            var newIndex = Project.current.getLastSwitchboardNumberNamed(oldName) + 1;
            var newName = newIndex===0 ? oldName : (oldName + ' ' + newIndex).trim();
            var newSwitchboardPack = Project.current.duplicateSwitchboard(switchboardPack, newName);
            $scope.selectSwitchboard(newSwitchboardPack);
            $timeout(function(){
                $scope.switchboardSelectionLoading = false;
            }, 200);

            $timeout(function(){
                $('.switchboard-name-field').select();
            }, 300);
        };

        $scope.selectAllForBom = function () {
            var newValue = $scope.allSelected;
            for (var switchboard in Project.current.switchboardPacks) {
                var currentSb = Project.current.switchboardPacks[switchboard];
                currentSb.isSelectedForBom = newValue;
            }
            $scope.allSelected = areAllSelectedValue();
        };

        $scope.decrementQuantity = function (val) {
            Project.current.selectedSwitchboardPack.quantity -= val;
        };

        $scope.incrementQuantity = function (val) {
            Project.current.selectedSwitchboardPack.quantity += val;
        };

        $scope.getLabelForType = function (value) {
            var type = _.find($scope.switchobardAvailableType, function(elt) {
                return value === elt.value;
            });
            return type ? type.label : '';
        };

        $scope.onSwitchboardTypeSelected = function (value) {
            $scope.project.selectedSwitchboardPack.type = value;
        };

        $scope.onGoForward = function(){
            $location.path('/switchboard-organisation');
        };

        $scope.$watch('project.selectedSwitchboardPack.switchboard.name', function(newValue, oldValue){
            var existingSwitchboardSelected = false;
            for (var i in Project.current.switchboardPacks) {
                var selectedSb = Project.current.selectedSwitchboardPack;
                var currentSb = Project.current.switchboardPacks[i];
                if (currentSb.switchboard.name === oldValue){
                    //if old value is among the switchboards of the project, then the action was to select an existing switchboard
                    // (and not to rename the selected switchboard)
                    //in this case, we put a loading effect (see the next usage of the boolean existingSwitchboardSelected)
                    existingSwitchboardSelected = true;
                }
                if (currentSb !== selectedSb && currentSb.switchboard.name.trim() === newValue.trim()) {
                    selectedSb.switchboard.name = oldValue;
                    var message = gettextCatalog.getString('switchboard-name-duplication-error');
                    logger.error(message, message, 'renameSwitchboard', true);
                    dialogService.showWarning([message]);
                    return;
                }
            }

            if (existingSwitchboardSelected) {
                $scope.switchboardSelectionLoading = true;
                $timeout(function(){
                    $scope.switchboardSelectionLoading = false;
                }, 200);
            }

            if(/^[^*"<>/?:!]*$/.test(newValue) === false){
                Project.current.selectedSwitchboardPack.switchboard.name = oldValue;
            }
        });

        //initialize default values (it will also initialize possible values lists)
        searchCharacteristics(null,true);

        $scope.additionalItemSwitchboardPackFilter = function (switchboardPack){
            return switchboardPack.type !== 'other';
        };

    });
