'use strict';

/**
 * @class angular_module.rest.productPriceService
 */
angular.module('rest').service('productPriceService', function (_, $q, $cookies, apiHelper, apiConstants, appConstants, partInfoService, loginService) {
    var service = {};

    service.pacePriceBaseUrl = {};
    service.pacePriceListIdsUrl = {};
    service.paceBomUrl = {};
    service.publicPriceApplicationDate = new Date();
    /**
     * @description initialize price url api end point
     * @return {Promise.<{String url}>} the promise that will contain the user information
     */
    service.initPacePriceUrl = function () {
        var deferred = $q.defer();
        apiHelper.get(apiConstants.serviceUrl, {'urlId': 'pacePriceApiUrl'}).then(
            function (url) {
                service.pacePriceBaseUrl = url;
                service.pacePriceListIdsUrl = url + apiConstants.pacePriceLists;
                deferred.resolve(service.pacePriceListIdsUrl);
            },
            function (errorGettingUrl) {
                deferred.reject(errorGettingUrl);
            });
        return deferred.promise;
    };

    service.initApplicationPriceDate = function () {


        return apiHelper.get(apiConstants.priceApplicationDates).then(function (dates) {
                var today = new Date();

                var dateToUse = new Date(1, 0, 1);

                dates.forEach(function (date) {

                    var parts = date.pricedate.split('-');
                    var priceDate = new Date(parts[0], parts[1] - 1, parts[2]);
                    if (priceDate <= today && dateToUse <= priceDate) {
                        dateToUse = priceDate;
                    }
                });

                service.publicPriceApplicationDate = dateToUse;
                console.log('Price list Date ' + service.publicPriceApplicationDate);
            }
        );

    };


    /**
     * @description initialize bom url api end point
     * @return {Promise.<{String url}>} the promise that will contain the user information
     */
    service.initPaceBomUrl = function () {
        var deferred = $q.defer();
        apiHelper.get(apiConstants.serviceUrl, {'urlId': 'bomSiteUrl'}).then(
            function (url) {
                service.paceBomUrl = url;

                deferred.resolve(service.paceBomUrl);
            },
            function (errorGettingUrl) {
                deferred.reject(errorGettingUrl);
            });
        return deferred.promise;
    };


    service.priceLists = function () {
        var headers = [];

        if (loginService.getUser().authenticated) {
            headers.push({'name': 'Authorization', 'value': loginService.getUser().userId});
        }

        var deferred = $q.defer();

        $q.all([service.defaultCountryPriceList(), apiHelper.get(service.pacePriceListIdsUrl, null, headers)]).then(function (results) {
            var defaultCountryPriceList = results[0];
            var userPriceLists = results[1];
            userPriceLists.unshift(defaultCountryPriceList);
            deferred.resolve(userPriceLists);
        });

        return deferred.promise;


    };
    /**
     * @description set in cookies the default price list id
     */
    service.setDefaultPriceListId = function (priceListId) {
        $cookies.QUICKQUOTATION_DEFAULT_PRICELIST = priceListId;
    };

    /**
     * @description return the listId price list
     * @return {Promise.<{price list}>} the promise that will contain the price list id
     */
    service.priceList = function (listId) {

        var headers = [];

        if (loginService.getUser().authenticated) {
            headers.push({'name': 'Authorization', 'value': loginService.getUser().userId});
        }
        return apiHelper.get(service.pacePriceListIdsUrl + '/' + listId, null, headers, undefined, true);
    };

    /**
     * @description return the defaultCountryPriceList price list
     * @return {Promise.<{price list}>} the promise that will contain the price list id
     */
    service.defaultCountryPriceList = function () {
        return service.priceList(appConstants.priceScope);
    };


    /**
     * @description return the default price list
     * @return {Promise.<{price list}>} the promise that will contain the price list id
     */
    service.defaultPriceList = function () {
        var deferred = $q.defer();
        var defaultPriceList = {id: 'to-be-defined'};
        var defaultPriceListCookie = 0;

        var QUICKQUOTATION_DEFAULT_PRICELIST = $cookies.QUICKQUOTATION_DEFAULT_PRICELIST;

        if (QUICKQUOTATION_DEFAULT_PRICELIST !== undefined) {
            defaultPriceListCookie = QUICKQUOTATION_DEFAULT_PRICELIST;
        }

        /**
         * priceListIds ils list of {id: 1, name: 'L1', desc: 'List One', type: 'PUBLIC'|'USER', currencyCode: 'EUR'}
         */
        service.priceLists().then(function (priceListIds) {
            for (var i = 0; i < priceListIds.length; i++) {
                if (priceListIds[i].id === defaultPriceListCookie) {
                    defaultPriceList = priceListIds[i];
                    break;
                }
                else if (defaultPriceList.id === 'to-be-defined') {
                    defaultPriceList = priceListIds[i];
                }
            }
            if (defaultPriceList.id !== 'to-be-defined') {
                $cookies.QUICKQUOTATION_DEFAULT_PRICELIST = defaultPriceList.id;
            }
            deferred.resolve(defaultPriceList);
        });

        return deferred.promise;
    };

    service.updatePrices = function (priceListId) {
        partInfoService.updatePartsInfo(priceListId);
    };


    return service;
});