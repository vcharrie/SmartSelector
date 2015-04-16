'use strict';

/**
 * @class angular_module.rest.productConfigurationService
 */
angular.module('rest').service('productConfigurationService', function (_, gettextCatalog, $q, apiHelper, apiConstants, logger, auxiliariesService, rangeService, phaseToPhaseNeutralHelper, characteristicName, RangeItemType, Filter) {
    /*
     * Service public interface
     */

    var service = {};

    /**
     *
     * @param {Filter[]} filtersToIterate
     * @param {Object} filtersToBuild
     */
    var buildFiltersArray = function (filtersToIterate, filtersToBuild) {

        if (filtersToIterate) {
            filtersToIterate.forEach(function (filter) {


                switch (filter.constraint) {
                    case 'In':
                        filtersToBuild[filter.characteristic] = { $in: filter.value };
                        break;
                    case 'Nin':
                        filtersToBuild[filter.characteristic] = { $nin: filter.value };
                        break;
                    case 'Lte':
                        filtersToBuild[filter.characteristic] = { $lte: filter.value };
                        break;
                    case 'Gte':
                        filtersToBuild[filter.characteristic] = { $gte: filter.value };
                        break;
                    case 'Equal':
                        filtersToBuild[filter.characteristic] = filter.value;
                        break;
                    case 'NotEqual':
                        filtersToBuild[filter.characteristic] = { $ne: filter.value };
                        break;
                    case 'Inside':
                        var boundaries = filter.value.split(' - ');

                        // hack : handle special case of story 7006
                        if (filter.characteristic === characteristicName.ratedOperationalVoltage) {

                            // Example of query build by code above :
                            // $or[{ RatedOperationalVoltageMin : { $gte : 380 }, RatedOperationalVoltageMax : { $lte : 415 }, PolesDescription : {$in : [2P, 3P, 3P+N, 4P]}}},
                            //     { RatedOperationalVoltageMin : { $gte : 220 }, RatedOperationalVoltageMax : { $lte : 240 }, PolesDescription : {$in : [1P, 1P+N]}}}]

                            //readdability is better none dotted

                            /*jshint sub:true*/
                            filtersToBuild['$or'] = [];
                            filtersToBuild['$or'][0] = {};
                            filtersToBuild['$or'][1] = {};

                            filtersToBuild['$or'][0][filter.characteristic + 'Min'] = { $gte: parseFloat(boundaries[0]) };
                            filtersToBuild['$or'][0][filter.characteristic + 'Max'] = { $lte: parseFloat(boundaries[1]) };
                            filtersToBuild['$or'][0][characteristicName.polesDescription] = { $in: ['3P', '3P+N', '4P'] };

                            filtersToBuild['$or'][1][filter.characteristic + 'Min'] = { $gte: phaseToPhaseNeutralHelper.convertMin(parseFloat(boundaries[0])) };
                            filtersToBuild['$or'][1][filter.characteristic + 'Max'] = { $lte: phaseToPhaseNeutralHelper.convertMax(parseFloat(boundaries[1])) };
                            filtersToBuild['$or'][1][characteristicName.polesDescription] = { $in: ['1P', '1P+N', '2P'] };
                            /*jshint sub:false*/

                        } else {
                            filtersToBuild[filter.characteristic + 'Min'] = { $gte: parseFloat(boundaries[0]) };
                            filtersToBuild[filter.characteristic + 'Max'] = { $lte: parseFloat(boundaries[1]) };
                        }
                        break;
                    case '':
                        //do nothing (for mechanic filters on electrical characteristics)
                        break;
                    default:
                        logger.error(gettextCatalog.getString('ERROR_UNEXPECTED'), 'unknown filter operator (rest-product-configuration-service)', 'buildFiltersArray', false);
                        break;
                }
            });
        }
    };

    //noinspection JSValidateJSDoc
    /**
     * Build payload for searchCompatibleFilters
     *
     * @param {Array<Filter>} filters
     * @param {Array<string>} characteristics
     * @param {number} maxProductToRetrieve
     * @param wishes
     */
    var buildFilterPayload = function (filters, characteristics, maxProductToRetrieve, wishes) {
        var payload = {};

        payload.mainCharacteristics = characteristics;
        payload.maxProductToRetrieve = maxProductToRetrieve;

        payload.filters = {};
        buildFiltersArray(filters, payload.filters);

        if (wishes) {
            payload.wishes = {};
            buildFiltersArray(wishes, payload.wishes);
        }

        return payload;
    };

    //noinspection JSValidateJSDoc
    /**
     * @param {Array<Filter>} filters
     * @param {String} valueToEraseOn
     * @returns {Array<Filter>} fixed filters
     */
    service.fixFiltersByDependencies = function(filters, valueToEraseOn) {
        console.log(filters);
        var hierarchy = [
            {parent:'trippingRelease1', child:'circuitVoltage1'},
            {parent:'trippingRelease2', child:'circuitVoltage2'},
            {parent:'trippingRelease3', child:'circuitVoltage3'}
        ];

        var getMapping = function(hierarchy, filter) {
            return _.find(hierarchy, function(elem) {
                return elem.child === filter.characteristic;
            });
        };

        var getParentFilter = function(filters, mapping) {
            return _.find(filters, function (elem) {
                return elem.characteristic === mapping.parent;
            });
        };

        for(var i = 0; i < filters.length; i++) {
            var filter = filters[i];
            var mapping = getMapping(hierarchy, filter);
            if(typeof mapping !== 'undefined') {
                var parentFilter = getParentFilter(filters, mapping);
                if(parentFilter.value === valueToEraseOn) {
                    filter.value = undefined;
                }
            }
        }

        return filters;
    };

    //noinspection JSValidateJSDoc
    /**
     * @param {Array<Filter>} filters
     * @param {Array<String>} characteristics
     * @param {int} maxProductToRetrieve
     */
    service.getAuxiliariesDefaultValues = function (filters, characteristics, maxProductToRetrieve) {
        return apiHelper.post(apiConstants.auxiliariesDefaultValues, buildFilterPayload(filters, characteristics, maxProductToRetrieve, null));
    };

    //noinspection JSValidateJSDoc
    /**
     * @param {Array<Filter>} filters
     * @param {Array<String>} characteristics
     * @param {int} maxProductToRetrieve
     */
    service.getDistributionsDefaultValues = function (filters, characteristics, maxProductToRetrieve) {
        return apiHelper.post(apiConstants.distributionsDefaultValues, buildFilterPayload(filters, characteristics, maxProductToRetrieve, null));
    };

    //noinspection JSValidateJSDoc
    /**
     * @param {Array<Filter>} filters
     * @param {Array<String>} characteristics
     * @param {int} maxProductToRetrieve
     */
    service.getDefaultValues = function (filters, characteristics, maxProductToRetrieve) {
        return apiHelper.post(apiConstants.defaultValues, buildFilterPayload(filters, characteristics, maxProductToRetrieve, null));
    };

    //noinspection JSValidateJSDoc
    /**
     * @param {Array<Filter>} filters
     * @param {Array<String>} characteristics
     * @param {int} maxProductToRetrieve
     * @param wishes
     */
    service.getDefaultValuesWithWishes = function (filters, characteristics, wishes, maxProductToRetrieve) {
        return apiHelper.post(apiConstants.defaultValuesWishes, buildFilterPayload(filters, characteristics, maxProductToRetrieve, wishes));

    };

    /**
     *
     * @param {Filter[]} filters
     * @param {String} characteristic
     * @param {RangeItemType} rangeItemType
     * @returns {Promise}
     */
    service.searchCompatibleFilters = function (filters, characteristic, rangeItemType) {

        var payload = {};

        payload.characteristic = characteristic;

        payload.filters = {};
        buildFiltersArray(filters, payload.filters);

        var endPoint;
        if (rangeItemType === RangeItemType.electricalRange) {
            endPoint = apiConstants.getElectricalFilterPossibleValues;
        }
        else if (rangeItemType === RangeItemType.mechanicalRange) {
            endPoint = apiConstants.getMechanicalFilterPossibleValues;
        }
        else if (rangeItemType === RangeItemType.auxiliariesRange) {
            endPoint = apiConstants.getAuxiliariesFilterPossibleValues;
        }
        else if (rangeItemType === RangeItemType.distributionsRange) {
            endPoint = apiConstants.getDistributionFilterPossibleValues;
        }

        return apiHelper.post(endPoint, payload);
    };

    /**
     *
     * @param {Filter[]} filters
     * @returns {Promise}
     */
    service.getCompatibleElectricalProducts = function (filters) {
        var payload = {};

        payload.filters = {};
        buildFiltersArray(filters, payload.filters);

        return apiHelper.post(apiConstants.getCompatibleElectricalProducts, payload);
    };

    /**
     *
     * @param {Filter[]} filters
     * @returns {Promise}
     */
    service.hasCompatibleAuxiliaries = function (filters) {
        var payload = {};

        payload.filters = {};
        buildFiltersArray(filters, payload.filters);

        return apiHelper.post(apiConstants.hasCompatibleAuxiliaries, payload);
    };

    /**
     * @param {String[]} productReferences
     */
    service.getProductConfigurationsFromProductReferences = function (productReferences) {
        var payload = {};
        payload.product = productReferences;
        return apiHelper.post(apiConstants.getProductInformation, payload);
    };

    /**
     * @param {Product} product
     */
    service.getProductConfigurations = function (product) {
        //Splitting Main parts and auxiliary parts
        var defered = $q.defer();

        var mainParts = auxiliariesService.getMainParts(product);
        var auxiliaryParts = auxiliariesService.getAuxiliaries(product);

        var mainPartCodes  = _.map(mainParts, function(partPack){
            return partPack.part.partCode;
        });
        var auxiliaryPartCodes  = _.map(auxiliaryParts, function(partPack){
            return partPack.part.partCode;
        });



        $q.all([service.getProductConfigurationsFromProductReferences(mainPartCodes), service.getProductConfigurationsFromProductReferences(auxiliaryPartCodes)]).then(function (results) {
                var result = results[0];
                if (result) {
                    if (result[0] && result[0].mappingReferenceBomPath &&
                        results[1][0] && results[1][0].mappingReferenceBomPath) {
                        result[0].mappingReferenceBomPath = result[0].mappingReferenceBomPath.concat(results[1][0].mappingReferenceBomPath);
                    }
                }
                else {
                    result = results[1];
                }
                defered.resolve(defered.resolve(result));
            }
        );


        return  defered.promise;
    };

    var mongoRangeCharacteristicName = 'range';
    var mongoPolesDescriptionCharacteristicName = 'polesDescription';
    var mongoPoleCompositionCharacteristicName = 'poleComposition';
    var mongoEarthLeakageProtectionCharacteristicName = 'earthLeakageProtection';
    var mongoRatedCurrentCharacteristicName = 'ratedCurrent';
    var mongoDeviceShortNameCharacteristicName = 'deviceShortName';
    var mongoControlCircuitVoltageCharacteristicName = 'controlCircuitVoltage';

    /**
     * Build filters from this main product.
     * @param mainProductPack
     * @returns {Promise} Filters that can de applied to find compatible auxiliaries.
     */
    service.buildFiltersForAuxiliaries = function (mainProductPack) {
        var deferred = $q.defer();

        if (mainProductPack.auxiliariesFilter === undefined) {
            var auxilariesFilters = rangeService.getAuxiliariesConf(mainProductPack.rangeItem.auxiliariesRangeName).auxiliariesFilters;

            //range filter
            var rangeDeferred = $q.defer();
            if (_.contains(auxilariesFilters, mongoRangeCharacteristicName)) {
                this.getProductConfigurations(mainProductPack._product).then(function (result) {
                    var rangeFilters = [];
                    var rangeName = result[0].range;
                    var mainProductPackRangeFilter = new Filter(mongoRangeCharacteristicName, Filter.equal, rangeName);
                    rangeFilters.push(mainProductPackRangeFilter);
                    mainProductPack.auxiliaryFilters = rangeFilters;
                    rangeDeferred.resolve(rangeFilters);
                });
            } else {
                rangeDeferred.resolve([]);
            }
            var rangePromise = rangeDeferred.promise;

            //poles description filter
            var polesDescriptionDeferred = $q.defer();
            if (_.contains(auxilariesFilters, mongoPolesDescriptionCharacteristicName)) {
                var polesDescriptionFilters = [];

                var polesDescriptionCharacteristic = _.find(mainProductPack.characteristics, function (characteristic) {
                    return  characteristic.name === mongoPolesDescriptionCharacteristicName;
                });

                var polesDescriptionFilter = new Filter(polesDescriptionCharacteristic.name, Filter.equal, polesDescriptionCharacteristic.selectedValue);
                polesDescriptionFilters.push(polesDescriptionFilter);
                polesDescriptionDeferred.resolve(polesDescriptionFilters);
            } else {
                polesDescriptionDeferred.resolve([]);
            }
            var polesDescriptionPromise = polesDescriptionDeferred.promise;


            //rated Current filter
            var ratedCurrentDeferred = $q.defer();
            if (_.contains(auxilariesFilters, mongoRatedCurrentCharacteristicName)) {
                var ratedCurrentFilters = [];

                var ratedCurrentCharacteristic = _.find(mainProductPack.characteristics, function (characteristic) {
                    return  characteristic.name === mongoRatedCurrentCharacteristicName;
                });

                var ratedCurrentFilter = new Filter(ratedCurrentCharacteristic.name, Filter.equal, ratedCurrentCharacteristic.selectedValue);
                ratedCurrentFilters.push(ratedCurrentFilter);
                ratedCurrentDeferred.resolve(ratedCurrentFilters);
            } else {
                ratedCurrentDeferred.resolve([]);
            }
            var ratedCurrentPromise = ratedCurrentDeferred.promise;

            //poles composition filter
            var poleCompositionDeferred = $q.defer();
            if (_.contains(auxilariesFilters, mongoPoleCompositionCharacteristicName)) {
                var poleCompositionFilters = [];

                var poleCompositionCharacteristic = _.find(mainProductPack.characteristics, function (characteristic) {
                    return  characteristic.name === mongoPoleCompositionCharacteristicName;
                });

                var poleCompositionFilter = new Filter(poleCompositionCharacteristic.name, Filter.equal, poleCompositionCharacteristic.selectedValue);
                poleCompositionFilters.push(poleCompositionFilter);
                poleCompositionDeferred.resolve(poleCompositionFilters);

            } else {
                poleCompositionDeferred.resolve([]);
            }
            var poleCompositionPromise = poleCompositionDeferred.promise;

            //earth leakage protection filter

            //RRL is in the place (developped in chrome by him pasted here by PFR
            var earthLeakageProtectionDeferred = $q.defer();
            if (_.contains(auxilariesFilters, mongoEarthLeakageProtectionCharacteristicName)) {
                this.getProductConfigurations(mainProductPack._product).then(function (result) {
                    var earthLeakageProtectionFilter = [];
                    var earthLeakageProtectionName = result[0].earthLeakageProtection;
                    var mainProductPackEarthLeakageProtectionFilter = new Filter(mongoEarthLeakageProtectionCharacteristicName, Filter.equal, earthLeakageProtectionName);
                    earthLeakageProtectionFilter.push(mainProductPackEarthLeakageProtectionFilter);
                    mainProductPack.auxiliaryFilters =earthLeakageProtectionFilter;
                    earthLeakageProtectionDeferred.resolve(earthLeakageProtectionFilter);
                });
            } else {
                earthLeakageProtectionDeferred.resolve([]);
            }
            var earthLeakageProtectionPromise = earthLeakageProtectionDeferred.promise;

            var deviceShortNameDeferred = $q.defer();
            if (_.contains(auxilariesFilters, mongoDeviceShortNameCharacteristicName)) {
                this.getProductConfigurations(mainProductPack._product).then(function (result) {
                    var deviceShortNameFilter = [];
                    var deviceShortName = result[0].deviceShortName;
                    var mainProductPackDeviceShortNameFilter = new Filter(mongoDeviceShortNameCharacteristicName, Filter.equal, deviceShortName);
                    deviceShortNameFilter.push(mainProductPackDeviceShortNameFilter);
                    mainProductPack.auxiliaryFilters =deviceShortNameFilter;
                    deviceShortNameDeferred.resolve(deviceShortNameFilter);
                });
            } else {
                deviceShortNameDeferred.resolve([]);
            }
            var deviceShortNamePromise = deviceShortNameDeferred.promise;

            var controlCircuitVoltageDeferred = $q.defer();
            if (_.contains(auxilariesFilters, mongoControlCircuitVoltageCharacteristicName)) {
                var controlCircuitVoltageCharacteristic = _.find(mainProductPack.characteristics, function (characteristic) {
                    return  characteristic.name === mongoControlCircuitVoltageCharacteristicName;
                });
                var controlCircuitVoltageFilter = [];
                var mainProductPackControlCircuitVoltageFilter = new Filter(mongoControlCircuitVoltageCharacteristicName, Filter.equal, controlCircuitVoltageCharacteristic.selectedValue);
                controlCircuitVoltageFilter.push(mainProductPackControlCircuitVoltageFilter);
                mainProductPack.auxiliaryFilters = controlCircuitVoltageFilter;
                controlCircuitVoltageDeferred.resolve(controlCircuitVoltageFilter);
            } else {
                controlCircuitVoltageDeferred.resolve([]);
            }
            var controlCircuitVoltagePromise = controlCircuitVoltageDeferred.promise;

            //gather all filters
            $q.all([
                rangePromise,
                polesDescriptionPromise,
                ratedCurrentPromise,
                poleCompositionPromise,
                earthLeakageProtectionPromise,
                deviceShortNamePromise,
                controlCircuitVoltagePromise
            ]).then(function (filtersArray) {
                var filters = [];
                filtersArray.forEach(function (filter) {
                    filters = filters.concat(filter);
                });
                deferred.resolve(filters);
            });
        } else {
            deferred.resolve(mainProductPack.auxiliaryFilters);
        }
        return deferred.promise;
    };

    /**
     * Find if the main product have auxiliaries.
     * @param mainProductPack
     * @returns {Promise} True if the main product have compatible auxiliaries. False otherwise.
     */
    service.findIfCompatibleAuxiliariesExist = function (mainProductPack) {
        var deferred = $q.defer();
        var compatibilityResult;

        // If 'auxiliariesRangeName' value in range items configuration file is empty it means the product has no compatible auxiliary
        // So we return immediately false in that case
        var auxilariesFilters = rangeService.getAuxiliariesConf(mainProductPack.rangeItem.auxiliariesRangeName).auxiliariesFilters;
        if (auxilariesFilters === undefined) {
            deferred.resolve(false);
            return deferred.promise;
        }

        if (mainProductPack.compatibilityWithAuxiliaries === auxiliariesService.compatibilityRequestNotDone) {

            var that = this;
            this.buildFiltersForAuxiliaries(mainProductPack).then(function (filters) {

                // If no filter was build, no need to check if auxiliaries are compatible : they are !
                if (filters === undefined || filters.length === 0) {
                    deferred.resolve(true);
                }

                that.hasCompatibleAuxiliaries(filters).then(function (result) {
                    mainProductPack.compatibilityWithAuxiliaries = result ? auxiliariesService.compatibleAuxiliaries : auxiliariesService.noCompatibleAuxiliaries;
                    compatibilityResult = (mainProductPack.compatibilityWithAuxiliaries === auxiliariesService.compatibleAuxiliaries);
                    deferred.resolve(compatibilityResult);
                });
            });
        } else {
            compatibilityResult = (mainProductPack.compatibilityWithAuxiliaries === auxiliariesService.compatibleAuxiliaries);
            deferred.resolve(compatibilityResult);
        }
        return deferred.promise;
    };

    return service;
});
