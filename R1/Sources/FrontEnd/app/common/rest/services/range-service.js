'use strict';

// TODO : KVL : moved from business to rest to fix dependencies => used by product configuration service (rest service) => some refacto is needed

/**
 * @description read the conf and get the list of available product ranges
 * @class angular_module.business.rangeService
 */
angular.module('rest').service('rangeService', function($rootScope, $q, apiHelper, apiConstants, applicationConfigurationService, RangeItem, _, Filter, RangeItemType) {
    /*
   * Service public interface
   */
    var service = {};

    /**
     *
     * @type {RangeItem[]}
     */
    service.rangeItems = [];
    service.displayedMetaRanges = [];
    service.auxiliaries = [];


    /**
     *
     * @returns {String[]}
     */
    service.getDisplayedMetaRanges = function() {
        return service.displayedMetaRanges;
    };

    /**
     *
     * @returns {RangeItem[]}
     */
    service.getRangeItems = function() {
        return service.rangeItems;
    };

    /**
   * @description Gets the list of range items
   * @return {Promise} the range items list
   */
    service.loadRangeItems = function() {
        var deferred = $q.defer();
        if (service.rangeItems.length > 0) {
            deferred.resolve(service.rangeItems);
        } else {
            applicationConfigurationService.getApplicationParameter('rangeItems').then(function(parameter) {
                var data = parameter.parameterObject;

                if (service.rangeItems.length === 0) {
                    _.each(data.displayMetaRanges, function(displayedMetaRange) {
                        service.displayedMetaRanges.push(displayedMetaRange);
                    });
                    _.each(data.rangeItems, function(rangeItem) {
                        var permanentFilters = [];
                        _.each(rangeItem.permanentFilters, function(filter) {
                            permanentFilters.push(new Filter(filter.characteristic, filter.operator, filter.values));
                        });

                        service.rangeItems.push(new RangeItem(rangeItem.rangeName,
                            RangeItemType.electricalRange,
                            rangeItem.pictureUrl,
                            rangeItem.mainCharacteristics,
                            permanentFilters,
                            rangeItem.projectContextFiltersIgnored,
                            rangeItem.metaRanges,
                            rangeItem.auxiliariesRangeName));
                    });
                }

                deferred.resolve(service.rangeItems);
            });
        }

        return deferred.promise;
    };

    /**
     *
     * @type {RangeItem[]}
     */
    service.distributionItems = [];

    /**
     * Return a sub set of distributions
     * @param level : 'MAIN' or 'SECONDARY'
     * @returns {RangeItem[]}
     */
    service.getDistributions = function(level) {
        return _.filter(service.distributionItems, function(distributionItem) {
            return _.indexOf(distributionItem.levelType, level) !== -1;
        });
    };

    /**
     * @description Gets the list of distributions
     * @return {Promise} the distributions list
     */
    service.loadDistributions = function() {
        var deferred = $q.defer();
        if (service.distributionItems.length > 0) {
            deferred.resolve(service.distributionItems);
        } else {
            applicationConfigurationService.getApplicationParameter('distributions').then(function(parameter) {
                var data = parameter.parameterObject;

                if (service.distributionItems.length === 0) {
                    _.each(data.distributionItems, function(distributionItem) {
                        var permanentFilters = [];
                        _.each(distributionItem.permanentFilters, function(filter) {
                            permanentFilters.push(new Filter(filter.characteristic, filter.operator, filter.values));
                        });

                        service.distributionItems.push(new RangeItem(distributionItem.rangeName,
                            RangeItemType.distributionsRange,
                            distributionItem.pictureUrl,
                            distributionItem.mainCharacteristics,
                            permanentFilters,
                            distributionItem.projectContextFiltersIgnored,
                            [],
                            '',
                            [],
                            '',
                            distributionItem.levelType));
                    });
                }

                deferred.resolve(service.distributionItems);
            });
        }

        return deferred.promise;
    };

    /**
     *
     * @param {String} rangeName range name (auxiliaries-modular-circuit-breaker, auxiliaries-mouled-case-circuit-breaker, ...)
     * @returns {RangeItem}
     */
    service.getAuxiliariesConf = function(rangeName) {
        if (rangeName === ''){
            return {};
        }
        return _.find(service.auxiliaries, function(range){
            return range.rangeName === rangeName;
        });
    };

    /**
     * @description Gets the list of auxiliaries
     * @returns {Promise}
     */
    service.loadAuxiliariesConf = function() {
        var deferred = $q.defer();
        if (service.auxiliaries.length > 0)  {
            deferred.resolve(service.auxiliaries);
        } else {
            applicationConfigurationService.getApplicationParameter('auxiliaries').then(function(parameter) {
                var data = parameter.parameterObject.auxiliaries;

                if (service.auxiliaries.length === 0 && data!==undefined && data.forEach!==undefined) {
                    data.forEach(function(auxiliariesRange){
                        service.auxiliaries.push(new RangeItem(auxiliariesRange.rangeName,
                            RangeItemType.auxiliariesRange,
                            null,
                            auxiliariesRange.mainCharacteristics,
                            null, null, [],
                            '',
                            auxiliariesRange.filters,
                            auxiliariesRange.sections));
                    });
                }

                deferred.resolve(service.auxiliaries);
            });
        }

        return deferred.promise;
    };

    /**
     * @description Gets the compatible distributions according to upstream and downstream products range
     * @param {Array} productsRange
     * @returns {Promise}
     */
    service.getCompatibleDistributions = function(productsRange) {

        var deferred = $q.defer();
        var payload = {'upstream' : productsRange[0], 'downstream' : _.rest(productsRange)};
        apiHelper.post(apiConstants.getCompatibleDistributions, payload).then(function (results) {
            deferred.resolve(results);
        }, function(err) {
            deferred.reject(err);
        });
        return deferred.promise;
    };

    return service;
});