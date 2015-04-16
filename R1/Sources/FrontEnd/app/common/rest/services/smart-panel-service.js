'use strict';

/**
 * smartPanelService : Provides APIs for interactions with smart panel backEnd services
 */
angular.module('rest').service('smartPanelService', function($q, _, apiHelper, apiConstants, partInfoService, adminService, ProductPack, appConstants) {
    /*
    * Service public interface
    */
    var service = {};

    var countryCodes = {};
    countryCodes.ES = 'Z002';
    countryCodes.FR = 'Z003';
    countryCodes.RU = 'Z009';

    /**
     /**
     * Call the smart panel service to convert main products
     * @param productPacks an array of productPacks to try to convert
     * @returns a promise which will contains an array of productPacks (mixed with old ones : not converted)
     */
    service.convertProjectToSmartPanel = function(productPacks){

        var deferred = $q.defer();

        // build the list from the productPacks
        var referencesToConvert = [];
        _.each(productPacks, function(productPack) {
            var product = productPack.product;
            var multipleRefsConcatenation = '';

            _.each(product.parts, function (part) {
                var partCode = part.part.partCode;
                multipleRefsConcatenation += partCode + '_';
            });

            referencesToConvert.push(multipleRefsConcatenation.substr(0, multipleRefsConcatenation.length - 1));
        });

        // prepare request and do it
        var serviceArguments = {'references': referencesToConvert, 'countryCode': adminService.getLocale()};
        var converterPromise = apiHelper.post(apiConstants.smartPanelConversion, serviceArguments);

        converterPromise.then(function(converterResult) {
            if(converterResult.status === 'NO_CONVERSION_DONE') {
                deferred.reject('SMART_PANEL_NO_CONVERSION_DONE');
            } else {
                // rebuild a productPack list before sending it back
                var convertedProductsPromise = partInfoService.getDetailedProducts(converterResult.references);

                convertedProductsPromise.then(function(convertedProducts){
                    var convertedProductsPacks = [];

                    _.each(convertedProducts, function (product) {
                        var productPack = new ProductPack(product, 1, {}, []);
                        convertedProductsPacks.push(productPack);
                    });

                    deferred.resolve(convertedProductsPacks);
                });
            }
        }, function(err) {
            deferred.reject(err);
        });

        return deferred.promise;
    };


    service.convertToSmartDevices = function(pathedProductList){
        var serviceArguments = {'productsToSmartify': pathedProductList, 'countryCode': countryCodes[appConstants.priceScope]};
        return apiHelper.post(apiConstants.smartPanelSmartifyDevices, serviceArguments);
    };

    service.convertToSmartPanel = function(pathedProductList){
        var serviceArguments = {'productsToSmartify': pathedProductList, 'countryCode': countryCodes[appConstants.priceScope]};
        return apiHelper.post(apiConstants.smartPanelSmartifyPanel, serviceArguments);
    };

    return service;
});