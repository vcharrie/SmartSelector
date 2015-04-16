'use strict';

angular
    .module('smartPanelWizzard', ['ngRoute', 'business', 'helpers', 'gettext', 'tracking','editProfileDirective'])
    .controller('smartPanelWizzard', function($scope, $rootScope, $timeout, $modalInstance, $window, _, $filter, logger, gettextCatalog, apiConstants,
                                                 rangeService, partInfoService, productConfigurationService, Project, switchboardContentService, productConfigurationTrackingService, saveLoadService, keyboardShortcutsService, auxiliariesService, auxiliariesSelectionService, alternativeProductSelectionService, networkService,
                                                 Product, Characteristic, data, steps, hadEnclosure, $q, smartPanelWizzardSmartifyService) {


        $scope.iCurrentStep = 0;
        $scope.originalData = data;
        $scope.convertibleDataMap = {};
        $scope.isBusy = false;
        $scope.busyReason = '';

        $scope.currentStep = steps[$scope.iCurrentStep];

        $scope.validationLabel = (steps && steps.length>1)?gettextCatalog.getString('smart-panel-wizard-next'):gettextCatalog.getString('smart-panel-wizard-validate');
        $scope.cancelLabel = ($scope.iCurrentStep===0)?gettextCatalog.getString('smart-panel-wizard-cancel'):gettextCatalog.getString('smart-panel-wizard-previous');
        $scope.backupedSwitchboardName = Project.current.selectedSwitchboardPack.switchboard.name;
        var newName = ($scope.backupedSwitchboardName + ' ' + gettextCatalog.getString('smart-revision-suffix')).trim();
        var newIndex = Project.current.getLastSwitchboardNumberNamed(newName) + 1;
        $scope.futureSwitchboardName = newIndex===0 ? newName : (newName + ' ' + newIndex).trim();

        /**
         * Call the smart panel web service to get a map between previous objects and new objects
         * @param selectedItems
         * @returns {*}
         */
        var smartifyDevices = function(selectedItems) {
            $scope.errorMessage = null;
            return smartPanelWizzardSmartifyService.smartifyDevices(selectedItems);
        };

        var smartifyPanel = function(selectedItems) {
            $scope.errorMessage = null;
            return smartPanelWizzardSmartifyService.smartifyPanel(selectedItems);
        };

        var error = function (err, fatal){
            $scope.errorBlocking = fatal;
            $scope.errorMessage = err;
            $scope.isBusy = false;
        };

        /**
         *
         * @param reference {String}
         * @param rawSmartifiedProducts {Array} : rawSmartifiedProducts[ ].parts[ ].reference or bompath
         * @return {String} the bompath or undefined if nothing was found
         */
        var findBomPathByReference = function(reference, rawSmartifiedProducts) {
            // rawSmartifiedProducts[ ].parts[ ].reference or bompath
            for(var i = 0; i < rawSmartifiedProducts.length; i++) {
                var product = rawSmartifiedProducts[i];

                for(var j = 0; j < product.parts.length; j++) {
                    var part = product.parts[j];
                    if(part.reference === reference) {
                        return part.bompath;
                    }
                }
            }

            return undefined;
        };

        /**
         *
         * @param productList
         * @param rawRefsWithBomPath {Object} : rawRefsWithBomPath.smartifiedProducts[ ].parts[ ].reference or bompath
         * @returns {Array}
         */
        var getSelectedItems = function(productList, rawRefsWithBomPath) {
            var smartProducts = [];

            $scope.convertibleDataMap.selectedSmartifiedItems = [];

            _.each(productList, function(product) {
                if(product.before.convert) {
                    var parts = [];

                    for(var i = 0; i < product.after.product._parts.length; i++) {
                        var currentReference = product.after.product._parts[i]._part.partCode;
                        var currentBomPath = findBomPathByReference(currentReference, rawRefsWithBomPath.smartifiedProducts);

                        parts.push(
                            {
                                reference: currentReference,
                                bompath: currentBomPath
                            }
                        );
                    }

                    smartProducts.push({parts: parts});
                    $scope.convertibleDataMap.selectedSmartifiedItems.push(product);
                }
            });

            return smartProducts;
        };

        var splitProductsByLevel = function() {

            $scope.levels = {};
            for(var deviceIndex in $scope.originalData) {

                // Do not add device if its conversion is disabled
                if(!$scope.originalData[deviceIndex].disabled) {
                    var level = networkService.getDeviceLevelInNetwork($scope.originalData[deviceIndex]);
                    // ignore distribution levels
                    level = (level + 1) / 2;
                    $scope.originalData[deviceIndex].level = level;
                    if (!$scope.levels[level]) {
                        $scope.levels[level] = [];
                    }
                    $scope.levels[level].push($scope.originalData[deviceIndex]);
                }
            }
        };

        $scope.init = function() {
            $scope.errorMessage = null;
            $scope.busyReason = gettextCatalog.getString('smart-panel-wizard-look-for-smart-products');
            $scope.isBusy = true;
            $scope.errorMessage = null;

            $scope.level = {};

            var smartableData = smartifyDevices($scope.originalData);
            smartableData.then(function(tableMap) {
                $scope.convertibleDataMap.smartified = tableMap.smartified;
                $scope.rawSmartifiedRefsWithBomPath = tableMap.rawSmartifiedRefsWithBomPath;

                splitProductsByLevel();

                $scope.level['1'] = $scope.levels['1'] !== undefined;
                $scope.level['2'] = $scope.levels['2'] !== undefined;
                $scope.level['3'] = $scope.levels['3'] !== undefined;

                $scope.iCurrentStep = 0;
                $scope.isBusy = false;
                $scope.reloadData();
                $scope.checkErrors();
            }, function(err) {
                error(err[0], true);
            });

        };

        $scope.updateLevelCheckbox = function(level) {

            var allChecked = _.every($scope.levels[level], function(device){
                return device.convert === true;
            });
            var allUnchecked = _.every($scope.levels[level], function(device){
                return device.convert === false;
            });

            if(allChecked) {
                $scope.level[level] = true;
            }
            else if(allUnchecked) {
                $scope.level[level] = false;
            }
            else {
                $scope.level[level] = -1;
            }
        };

        $scope.checkAll = function(level) {
            for(var deviceIndex in $scope.levels[level]){
                $scope.levels[level][deviceIndex].convert = $scope.level[level];
            }
        };

        $scope.validate = function() {
            if ($scope.currentStep==='select') {
                $scope.busyReason = gettextCatalog.getString('smart-panel-wizard-calculating-new-products');
                $scope.isBusy = true;
                var selectedItems = getSelectedItems($scope.convertibleDataMap.smartified, $scope.rawSmartifiedRefsWithBomPath);
                smartifyPanel(selectedItems).then( function(smartyPanelTableMap) {
                    $scope.convertibleDataMap.additional = smartyPanelTableMap.additional;
                    $scope.isBusy = false;
                    $scope.reloadData();
                    $scope.checkErrors();
                }, function (err) {
                    error(err[0], true);
                });
            } else if ($scope.currentStep==='addedProducts') {
                if (hadEnclosure) {
                    $scope.busyReason = '';
                    $scope.isBusy = false;
                } else {
                    $scope.busyReason = gettextCatalog.getString('smart-panel-wizard-applying');
                    $scope.isBusy = true;
                }
            } else if ($scope.currentStep==='updateEnclosure') {
                $scope.busyReason = gettextCatalog.getString('smart-panel-wizard-applying');
                $scope.isBusy = true;
            }
            if (!$scope.next()){
                $modalInstance.close($scope.convertibleDataMap);
            }
        };

        $scope.next = function() {
            $scope.iCurrentStep ++;
            if ($scope.iCurrentStep >= steps.length) {
                return false;
            }
            $scope.errorMessage = null;
            $scope.reloadData();
            return true;
        };

        $scope.previous = function() {
            if ($scope.iCurrentStep===0) {
                $modalInstance.close(null);
            } else {
                $scope.iCurrentStep --;
                $scope.errorMessage = null;
                $scope.reloadData();
                $scope.checkErrors();
            }
        };

        $scope.checkErrors = function () {
            if ($scope.currentStep==='addedProducts') {
                if ($scope.convertibleDataMap && $scope.convertibleDataMap.additional && $scope.convertibleDataMap.additional.length === 0) {
                    error(gettextCatalog.getString('smart-panel-wizard-no-additional-product'));
                }
            } else if ($scope.currentStep==='select') {
                if (_.filter($scope.convertibleDataMap.smartified, function (elt){
                    return elt && elt.before && !elt.before.disabled;
                }).length===0) {
                    error(gettextCatalog.getString('smart-panel-wizard-cant-be-smarter'));
                }
            }
        };

        $scope.isFirstConvert = function() {
            return Project.current.selectedSwitchboard.additionalProductsBasket.getTotalProductCount() === 0;
        };

        $scope.reloadData = function() {
            $scope.currentStep = steps[$scope.iCurrentStep];
            $scope.validationLabel = (steps && steps.length>1 && $scope.iCurrentStep<(steps.length-1))?gettextCatalog.getString('smart-panel-wizard-next'):gettextCatalog.getString('smart-panel-wizard-validate');
            $scope.cancelLabel = ($scope.iCurrentStep===0)?gettextCatalog.getString('smart-panel-wizard-cancel'):gettextCatalog.getString('smart-panel-wizard-previous');
        };

        $scope.close = function() {
            $modalInstance.close(null);
        };

        $scope.init();

    })
    .directive('ngIndeterminate', function() {
        return {
            restrict: 'A',
            link: function(scope, element, attributes) {
                scope.$watch(attributes.ngIndeterminate, function (value) {
                    element.prop('indeterminate', !!value);
                });
            }
        };
    });