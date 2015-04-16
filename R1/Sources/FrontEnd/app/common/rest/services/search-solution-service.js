'use strict';

/**
 * searchSolutionService : Provides APIs to find solutions
 */
angular.module('rest').service('searchSolutionService', function(
    $q,
    _, apiHelper, apiConstants,appConstants, logger,
    Project, partInfoService, auxiliariesService, productConfigurationService, loginService,
    Solution, ProductPack, Distribution,
    characteristicName) {
    /*
    * Service public interface
    */
    var service = {};

    /**
     *
     * @param {String[]} parts
     * @param {ProductPack[]}productPacks list to fill
     */
    var createProductPackFromParts = function(parts, productPacks){
        return partInfoService
            .getDetailedProducts([parts], Project.current.priceList.id)
            .then(function (detailedProducts) {
                _.each(detailedProducts, function (detailedProduct) {
                    var productPack = new ProductPack(detailedProduct, 1, {}, []);
                    productPacks.push(productPack);
                }, function(err){
                    logger.error('Error while fetching part details ' + JSON.stringify(parts), err, 'search-solution-service', false);
                });
            });
    };

    /**
     *
     * @param item
     * @returns {Promise.<Solution>}
     * @param {String[]} messages
     * @param {String[]} alternativeRanges
     * @param {String} incomingInDuct
     * @param {String} wireOutgoingInDuct
     */
    var createSolution = function(item, messages, alternativeRanges, incomingInDuct, wireOutgoingInDuct) {

        var deferred = $q.defer();

        // fetch enclosure information from db (get size, ip, door, etc.)
        productConfigurationService.getProductConfigurationsFromProductReferences(item.enclosureReferences).then(function (enclosureInformations) {
            if (!enclosureInformations || enclosureInformations.length < 1 || !enclosureInformations[0]) {
                deferred.reject('Could not find enclosure information for product ' + item.enclosureReferences.join('_'));
            }
            else {
                var enclosureInformation = enclosureInformations[0];
                var promises = [];

                var solution = new Solution(
                    '',
                    1,
                    item.enclosureReferences,
                    Math.round(enclosureInformation.height * 1000),
                    Math.round(enclosureInformation.width * 1000),
                    Math.round(enclosureInformation.depth * 1000),
                    enclosureInformation.range,
                    enclosureInformation.iP,
                    enclosureInformation.rows,
                    enclosureInformation.numberOfVerticalModules,
                    enclosureInformation.door,
                    enclosureInformation.installation,
                    enclosureInformation.isolation,
                    enclosureInformation.modulesWidth,
                    enclosureInformation.doorDuct,
                    item.freeSpace,
                    null,
                    item.compositionScript,
                    messages,
                    alternativeRanges,
                    incomingInDuct,
                    wireOutgoingInDuct
                );

                item.functionalUnitReferences.forEach(function (functionalUnitProductReferences) {
                    if (functionalUnitProductReferences.length !== 0) {
                        promises.push(createProductPackFromParts(functionalUnitProductReferences, solution.functionalUnits));
                    }
                });

                promises.push(createProductPackFromParts(solution.parts, solution.products));

                $q.all(promises).then(function () {
                    deferred.resolve(solution);
                });
            }
        });

        return deferred.promise ;
    };

    service.updateMechanicalFilters = function(productPacks, enclosureFilters, distributionFilters) {
        var deferred = $q.defer();
        var products = [];
        var updatedEnclosureFilters = [];
        var updatedDistributionFilters = [];

        if (productPacks.length === 0) {
            deferred.reject('product list is empty');
        } else {
            productPacks.forEach(function (productPack) {
                products.push({ references: auxiliariesService.getProductReferences(productPack.product), quantity: productPack.quantity });
            });

            // find the highest rated current of all products
            var productsReferences = _.map(productPacks, function (p) {
                return auxiliariesService.getMainPartsReferences(p.product);
            });
            var maxRatedCurrent = 0;

            // retrieve the rated current of each product to find the higher
            apiHelper
                .post(apiConstants.productInfo, { productsReferences: productsReferences, characteristics: [characteristicName.ratedCurrent] })
                .then(function (results) {
                    maxRatedCurrent = _.max(results, function (r) {
                        return r.ratedCurrent;
                    }).ratedCurrent;

                    enclosureFilters.forEach(function (filter) {
                        var value = filter.value;
                        // special case for the rated current, do not use the one from project context
                        // but uses the higher rated current from the product list
                        if (filter.characteristic === characteristicName.ratedCurrent) {
                            value = maxRatedCurrent;
                        }

                        updatedEnclosureFilters.push({ name: filter.characteristic, characteristic: filter.characteristic, value: value, constraint: filter.constraint });
                    });

                    distributionFilters.forEach(function (filter) {
                        updatedDistributionFilters.push({ name: filter.characteristic, characteristic: filter.characteristic, value: filter.value, constraint: filter.constraint });
                    });

                    deferred.resolve({enclosureFilters : updatedEnclosureFilters, distributionFilters : updatedDistributionFilters});
                });
        }
        return deferred.promise;
    };

    var handleSearchSolutionResult = function(deferred, result) {

        if (result.statusCode === 'OK' && result.solutions.length === 1) {
            // create a new Solution object
            createSolution(result.solutions[0], result.messages, result.alternativeRanges, result.incomingInDuct, result.wireOutgoingInDuct).then(function(solution) {
                // add solution's product to the appropriate baskets
                Project.current.selectedSwitchboard.mechanicBasket.clearProducts();
                _.each(solution.products, function (productPack) {
                    Project.current.selectedSwitchboard.mechanicBasket.addProduct(productPack);
                });
                Project.current.selectedSwitchboard.functionalUnitsBasket.clearProducts();
                _.each(solution.functionalUnits, function (productPack) {
                    Project.current.selectedSwitchboard.functionalUnitsBasket.addProduct(productPack);
                });

                Project.current.selectedSwitchboard.enclosureSolution = solution;
                Project.current.selectedSwitchboard.isSolutionDirty = false;
                Project.current.isProjectDirty = true;

                deferred.resolve(solution);
            }, function(err) {
                deferred.reject(err);
            });
        } else {
            deferred.reject(result);
        }
    };

    function convertSmartElements(smartElements) {
        var convertedSmartElements = [] ;
        smartElements.forEach(function(smartElement){
            for (var i=0 ; i<smartElement.quantity ; i++){
                convertedSmartElements.push({references : smartElement.product.references()});
            }
        });
        return convertedSmartElements;
    }

    var recursivelyAdaptDeviceForSolutionSearch = function(device){
        var adaptedDevices = [{
            references : [],
            children : []
        }];

        adaptedDevices[0].references = device.product.references();

        //quantity management : copy/paste the adapted device
        var i = device.quantity;
        while (i > 1) {
            adaptedDevices.push(adaptedDevices[0]);
            i--;
        }

        //adapt children too : note that there can't be any children if there is a multiple quantity
        device.children.forEach(function(childDevice){
            var adaptedChildren = recursivelyAdaptDeviceForSolutionSearch(childDevice);
            //some children can be in a multiple quantity
            adaptedChildren.forEach(function(adaptedChild){
                adaptedDevices[0].children.push(adaptedChild);
            });
        });

        return adaptedDevices;
    };

    service.searchSolutionFromNetwork = function(network, smartElements, enclosureFilters) {
        var deferred = $q.defer();

        if (network.length === 0) {
            deferred.reject('switchboard organisation is empty');
        } else {
            var networkElements = [];
            network.incomerDevices.forEach(function(device) {
                var adaptedDevices = recursivelyAdaptDeviceForSolutionSearch(device);
                adaptedDevices.forEach(function(adaptedDevice) {
                    networkElements.push(adaptedDevice);
                });
            });

            var headers = {};
            if (loginService.getUser().authenticated) {
                headers.Authorization = loginService.getUser().userId;
                headers.priceScope= appConstants.priceScope;
                headers.priceListId = Project.current.priceList.id;
            }

            headers.scope = appConstants.priceScope ;

            apiHelper.post(
                apiConstants.solutionsFindSwitchboardSolution, {
                    enclosureCharacteristics: enclosureFilters,
                    networkElements: networkElements,
                    smartElements: convertSmartElements(smartElements),
                    freeSpace: 0
                },{headers:headers})
                .then(function (result) {
                    handleSearchSolutionResult(deferred, result);
                }, function (err) {
                    deferred.reject(err);
                });
        }

        return deferred.promise;
    };

    service.generateCompositionScript = function(parameter){
        return apiHelper.post(apiConstants.solutionGenerateCompositionScriptAdmin, parameter);
    };

    service.generate3dModel = function(parameter, exportCollada, useAdminEndpoint){
        var deferred = $q.defer();

        var httpParam = {};

        if (exportCollada){
            parameter.type = 'collada';
        } else {
            parameter.type = 'jpeg';
            httpParam.responseType = 'blob';
        }

        var endpoint = apiConstants.solutionGenerate3d;
        if (useAdminEndpoint) {
            endpoint = apiConstants.solutionGenerate3dAdmin;
        }

        apiHelper.post(endpoint, parameter, httpParam).then(function(result){
            deferred.resolve(result);
        }, function(err){
            deferred.reject(err);
        });

        return deferred.promise;
    };

    return service;
});