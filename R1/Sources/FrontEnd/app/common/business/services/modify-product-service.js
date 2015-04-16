'use strict';

/**
 * @class angular_module.business.modifyProductService
 */
angular.module('business').service('modifyProductService', function(logger, Project) {

    var service = {
    };

    /**
     * Replace an electrical product from the list by another
     * @param oldProductPack the product to be replaced
     * @param newProductPack the new product to use
     * @returns {boolean} true if the old product pack was replaced by the new. False otherwise
     */
    service.modifyElectricProductPack = function(oldProductPack, newProductPack) {
        if(oldProductPack === undefined || oldProductPack === null) {
            logger.log('modifyElectricProductPack oldProductPack must not be null.');
            return false;
        }
        if(newProductPack === undefined || newProductPack === null) {
            logger.log('modifyElectricProductPack newProductPack must not be null.');
            return false;
        }

        return Project.current.selectedSwitchboard.electricBasket.replaceProduct(oldProductPack, newProductPack);
    };

    // HACK WBA + TODO : an update / refactoring of theses 2 methods MUST BE DONE
    // because this kind of behavior can easily be merged into one function
    // But as the 2014/12/11, no time to break the existing code and rename existing uses.
    /**
     * Replace a distribution product from the list by another
     * @param oldProductPack the product to be replaced
     * @param newProductPack the new product to use
     * @returns {boolean} true if the old product pack was replaced by the new. False otherwise
     */
    service.modifyDistributionProductPack = function(oldProductPack, newProductPack) {
        if(oldProductPack === undefined || oldProductPack === null) {
            logger.log('modifyDistributionProductPack oldProductPack must not be null.');
            return false;
        }
        if(newProductPack === undefined || newProductPack === null) {
            logger.log('modifyDistributionProductPack newProductPack must not be null.');
            return false;
        }

        return Project.current.selectedSwitchboard.distributionBasket.replaceProduct(oldProductPack, newProductPack);
    };

    return service;
});
