'use strict';

/**
 * @class angular_module.business.auxiliariesService
 */
angular.module('helpers').service('auxiliariesService', function(_) {

    var service = {
        compatibilityRequestNotDone : 0,
        noCompatibleAuxiliaries : 1,
        compatibleAuxiliaries : 2
    };

    /**
     * @description Checks if the product has got auxiliaries.
     * (do not be confused with compatibility of this product with auxiliaries -> common/rest/services/product-configuration-service.js)
     * @param {Product} product
     * @returns {boolean}
     */
    service.hasAuxiliaries = function(product) {
        var result = false;
        product.parts.forEach(function(part){
            // TODO : remove hard coded 'Auxiliaries'
            if (part.part.collection === 'Auxiliaries' || (part.part.collection === 'Both' && part.part.role === 'Auxiliaries')) {
                result = true;
            }
        });
        return result;
    };

    /**
     * @description returns auxiliaries parts of this product
     * @param {Product} product
     * @returns {[PartPack]}
     */
    service.getAuxiliaries = function(product) {
        var auxiliariesParts = [];

        product.parts.forEach(function(part){
            if (part.part.collection === 'Auxiliaries' || (part.part.collection === 'Both' && part.part.role === 'Auxiliaries')) {
                auxiliariesParts.push(part);
            }
        });

        return auxiliariesParts;
    };

    /**
     * @description returns main parts of this product
     * @param {Product} product
     * @returns {[PartPack]}
     */
    service.getMainParts = function(product) {
        var mainParts = [];
        product.parts.forEach(function(part){
            if (part.part.collection && part.part.collection !== 'Auxiliaries'  && (part.part.collection !== 'Both' || part.part.role !== 'Auxiliaries')) {
                mainParts.push(part);
            }
        });

        return mainParts;
    };

    /**
     * @description Sets the product's auxiliaries
     * @param {Product} product
     * @param {[PartPack]} newAuxiliariesParts
     */
    service.setAuxiliaries = function(product, newAuxiliariesParts) {


        var auxiliariesParts = service.getAuxiliaries(product);
        var mainParts = _.filter(product.parts, function(part) {
            return !_.contains(auxiliariesParts, part);
        });


        product.parts = mainParts.concat(newAuxiliariesParts);
    };

    /**
     * @description Returns a string containing all parts of a product concatenated with an underscore
     * @returns {String[]}
     */
    service.getProductReferences = function(product){
        return _.map(product.parts, function(partPack){
            return partPack.part.partCode;
        });
    };

    /**
     * @description Returns a string containing main parts of a product concatenated with an underscore
     * @returns {String[]}
     */
    service.getMainPartsReferences = function(product){
        return _.map(service.getMainParts(product), function(partPack){
            var partCodes = [];
            for(var i = 0; i< partPack.quantity; i++) {
                partCodes.push(partPack.part.partCode);
            }
            return partCodes.join('_');
        }).join('_').split('_');
    };

    /**
     * @description Returns a string containing auxiliaries parts of a product
     * @returns {String[]}
     */
    service.getAuxiliariesReferences = function(product){
        return _.map(service.getAuxiliaries(product), function(partPack){
            return partPack.part.partCode;
        });
    };

    /**
     * @description if a part is from both collections (main and auxiliaries), this method sets the part collection to 'Auxiliaries'
     *              else does nothing
     * @param {PartPack} partPack,  a part which should be from both collections, and which should be declared from collection 'Auxiliaries'
     * @returns
     */
    service.setPartFromBothCollectionToAuxiliaries = function(partPack){
        partPack.part.role = 'Auxiliaries';
    };

    return service;
});