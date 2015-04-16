'use strict';

/**
 * @class angular_module.business.distributionService
 */
angular.module('business').service('distributionService', function (_, $q, productConfigurationService) {


    /*
     * Service public interface
     */
    var service = {

    };

    // Define all public methods

    /**
     * Extract parent of current distribution and children in order to get matching ranges
     * @param distributionDevice
     * @returns {promise} [Strings] of ranges. [0] is the parent's, [1...N] are children's
     */
    service.getTopologyRanges = function(distributionDevice){
        // TODO HACK WBA
        /* I know this is not a proper way to handle this case.
         But to avoid any side effect, considering the time to do it, I've isolated it as much as possible.
         */
        var deferred = $q.defer();

        var parentProduct = distributionDevice.parent.product;
        var childrenProducts =[];
        _.each(distributionDevice.children, function(child) {
            childrenProducts.push(child.product);
        });

        var bunchOfPromises = [];
        bunchOfPromises.push(productConfigurationService.getProductConfigurations(parentProduct));
        _.each(childrenProducts, function(child) {
            bunchOfPromises.push(productConfigurationService.getProductConfigurations(child));
        });

        $q.all(bunchOfPromises).then(function(results) {
            // stack all result in a way to get it after to filter the found ranges
            // theses ranges will be used to find compatible distribution categories
            var ranges = [];
            _.each(results, function(result) {
                ranges.push(result[0].range);
            });
            deferred.resolve(ranges);
        });

        return deferred.promise;
    };

    return service;
});
