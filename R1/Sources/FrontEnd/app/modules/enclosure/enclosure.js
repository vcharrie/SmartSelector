'use strict';

/**
 * enclosure controllers
 */
angular.module('enclosure', ['ngRoute', 'business', 'dialog', 'tracking', 'viewer3d'])
    .config(function ($routeProvider) {
        $routeProvider.when('/enclosure',
            {
                controller: 'enclosure',
                templateUrl: 'modules/enclosure/enclosure.view.html',
                resolve: {
                    factory: ['projectService', '$location', function (projectService, $location) {
                        return projectService.checkProjectExists(function () {
                            $location.path('/');
                        });
                    }]
                }
            });
    })
    .controller('enclosure', function ($location, $scope, $timeout, $q, $modal, gettextCatalog, _, logger, Project, adminService, searchSolutionService, dialogService, enclosureModificationService, appConstants,apiConstants, smartPanelTrackingService) {
        var selectedPart = null;

        $scope.mechanicalParts = [];
        $scope.electricalParts = [];
        $scope.distributionParts = [];
        $scope.functionalUnitParts = [];
        $scope.additionalParts = [];
        $scope.isSolutionDirty = function() {
            return Project.current.selectedSwitchboard.isSolutionDirty;
        };

        // fill an array with a product list to have only unique part code that are available from 3D
        var extractProductList = function(array, productList){
            // temporary object that is used like a dictionary (objet's member are the keys
            var partMap = {};
            for(var i = 0; i < productList.length; i++){
                var productPack = productList[i];
                var include = false;
                if (!$scope.solution || !$scope.solution.compositionScript) {
                    include = true;
                } else {
                    for(var j = 0; j < productPack.product.parts.length; j++){
                        var reference = productPack.product.parts[j].part.partCode;
                        if ($scope.solution.compositionScript.indexOf(reference) > 0) {
                            include = true;
                        }
                    }
                }

                if (include){
                    for(var k = 0; k < productPack.product.parts.length; k++){
                        var partCode = productPack.product.parts[k].part.partCode;
                        if(!partMap[partCode]) {
                            array.push(productPack.product.parts[k]);
                            partMap[partCode] = true;
                        }
                    }
                }
            }
        };

        var getMaximalMessagesLevel = function() {

            if($scope.solution && $scope.solution.messages) {

                var levels = _.map($scope.solution.messages, function (m) {
                    return m.level;
                });

                if (levels.indexOf('ERROR') !== -1) {
                    $scope.messagesLevel = 'ERROR';
                }
                else if (levels.indexOf('WARNING') !== -1) {
                    $scope.messagesLevel = 'WARNING';
                }
                else {
                    $scope.messagesLevel = 'INFORMATION';
                }
            }
        };

        // put only distinct part code in the electrical products list
        var buildElectricalProductList = function() {
            extractProductList($scope.electricalParts, Project.current.selectedSwitchboard.electricBasket.list);
        };

        // build mechanical products list
        var buildMechanicalProductList = function(){
            extractProductList($scope.mechanicalParts, Project.current.selectedSwitchboard.mechanicBasket.list);
        };

        // build functional unit products list
        var buildFunctionalUnitProductList = function(){
            extractProductList($scope.functionalUnitParts, Project.current.selectedSwitchboard.functionalUnitsBasket.list);
        };

        // build distribution products list
        var buildDistributionProductList = function() {
            extractProductList($scope.distributionParts, Project.current.selectedSwitchboard.distributionBasket.list);
        };

        // build additional products list
        var buildAdditionalProductList = function() {
            extractProductList($scope.additionalParts, Project.current.selectedSwitchboard.additionalProductsBasket.list);
        };

        buildElectricalProductList();
        buildMechanicalProductList();
        buildDistributionProductList();
        buildFunctionalUnitProductList();
        buildAdditionalProductList();

        $scope.isProductListEmpty = $scope.electricalParts.length === 0;
        $scope.isSearchingSolution = false;

        $scope.solution = Project.current.selectedSwitchboard.enclosureSolution;

        $scope.baseUri=apiConstants.baseUri;

        // value set by child enclosure-viewer directive
        $scope.viewer = null;

        $scope.isFunctional = function(){
            return $scope.solution && $scope.solution.functionalUnits.length > 0;
        };

        $scope.highlightPart = function(part) {
            if (!$scope.viewer || $scope.isSearchingSolution){
                return;
            }

            $scope.viewer.removeCommercialReferenceHighlighting();
            if (selectedPart !== null) {
                selectedPart.isSelected = false;
            }

            if (selectedPart !== part) {

                // Only highlight parts that are in the 3d viewer
                if($scope.viewer.commercialReferences.indexOf(part.part.partCode) !== -1) {
                    $scope.viewer.highlightCommercialReference(part.part.partCode);
                }

                selectedPart = part;
                selectedPart.isSelected = true;
            } else {
                selectedPart = null;
            }
        };

        // Add or override existing filters with user wishes
        var applyUserWishes = function(filters) {

            var updatedFilters = angular.copy(filters);
            var switchboard = Project.current.selectedSwitchboard;
            for(var wish in switchboard.enclosureSolutionWishes){
                if (switchboard.enclosureSolutionWishes.hasOwnProperty(wish)) {
                    var filter = _.where(updatedFilters, {characteristic: wish});
                    if (filter.length > 0) {
                        if (filter[0].value !== switchboard.enclosureSolutionWishes[wish].selectedValue) {
                            filter[0].value = switchboard.enclosureSolutionWishes[wish].selectedValue;
                        }
                    }
                    else {
                        updatedFilters.push(switchboard.enclosureSolutionWishes[wish].getAsMechanicalFilter());
                    }
                }
            }

            return updatedFilters;
        };

        $scope.searchSolution = function (enclosureFilters, keepPreviousEnclosureSolution) {

            var deferred = $q.defer();

            if (!enclosureFilters) {
                // happens when use click the close button of the modify enclosure tab
                deferred.resolve();
                return deferred.promise;
            }

            var switchboard = Project.current.selectedSwitchboard;
            $scope.isSearchingSolution = true;

            // Add or override existing filters with user wishes
            var updatedFilters = applyUserWishes(switchboard.getMechanicFilters().concat(enclosureFilters));

            //send request to find solutions
            searchSolutionService
                .searchSolutionFromNetwork(switchboard.network, switchboard.additionalProductsBasket.list, updatedFilters)
                .then(
                // success
                function (solution) {
                    $scope.solution = solution;

                    $scope.mechanicalParts = [];
                    $scope.functionalUnitParts = [];
                    buildMechanicalProductList();
                    buildFunctionalUnitProductList();

                    $scope.isSearchingSolution = false;

                    getMaximalMessagesLevel();

                    smartPanelTrackingService.newEnclosureSolution(Project.current.getNetPrice());

                    deferred.resolve();
                },
                // reject
                function (error) {
                    $scope.isSearchingSolution = false;

                    var errorCode;
                    switch (error.statusCode) {
                        case 'NO_COMPATIBLE_ENCLOSURE':
                            errorCode = 'ERROR_NO_SOLUTION_WITH_CRITERIA';
                            break;
                        case 'TOO_MANY_PRODUCTS':
                            errorCode = 'ERROR_NO_SOLUTION_WITH_CRITERIA_AND_DEVICES';
                            break;
                        case 'NO_PRODUCTS':
                            errorCode = 'An error occurred while searching solution';
                            logger.error('Could not find product', error, 'searchSolution', true);
                            break;
                        default:
                            errorCode = 'An error occurred while searching solution';
                            logger.error('An error occurred while searching solution', error, 'searchSolution', true);
                    }

                    // If the user had wishes, ask the user to remove them and search again if there is a compatible solution
                    if(!keepPreviousEnclosureSolution) {
                        if(Object.keys(switchboard.enclosureSolutionWishes).length > 0) {
                            $scope.enclosureFilters = enclosureFilters;
                            enclosureModificationService.modifyEnclosure(enclosureModificationService.noSolutionFoundWithFiltersRequestKey, $scope.solution, $scope.searchSolution, errorCode)
                                .result.then(function(backToSwitchboardContent){
                                if (backToSwitchboardContent){
                                    $location.path('/switchboard-organisation');
                                }
                            });

                        }
                        else {
                            dialogService.showWarning([gettextCatalog.getString(errorCode)]);
                        }
                    }

                    deferred.reject(errorCode);
                }
            );

            return deferred.promise;
        };

        $scope.showMessagesDialog = function() {

            var messages = [];
            $scope.solution.messages.forEach(function(m) {

                var args = {};
                var index = 0;
                m.args.forEach(function (arg) {
                    args['arg'+index++] = arg;
                });

                messages.push(gettextCatalog.getString(m.code, args));
            });

            dialogService.showWarning(_.uniq(messages));
        };

        // auto-search when opening the tab if needed
        if ($scope.isSolutionDirty() && !$scope.isProductListEmpty) {
            $scope.searchSolution([]);
        }

        // if the basket was deleted by the user,
        // remove the old solution and clear the mechanical and distribution BOM
        // to go back to initial state
        if ($scope.isProductListEmpty && ($scope.solution)) {
            $scope.solution = null;
            Project.current.selectedSwitchboard.enclosureSolution = $scope.solution;
            Project.current.selectedSwitchboard.mechanicBasket.clearProducts();
            Project.current.selectedSwitchboard.functionalUnitsBasket.clearProducts();
        }

        getMaximalMessagesLevel();

        $scope.onPartSelected = function(selectedPart) {
          $scope.$broadcast('enclosurePartSelected', selectedPart);
        };

        $scope.modifyEnclosure = function(){
            enclosureModificationService.modifyEnclosure(enclosureModificationService.modifySolutionRequestKey, $scope.solution, $scope.searchSolution).result.then(function(backToSwitchboardContent){
                if (backToSwitchboardContent){
                    $location.path('/switchboard-organisation');
                }
                return true;
            });
        };
    });
