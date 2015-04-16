'use strict';

/**
 * @class angular_module.business.partInfoService
 */
angular.module('rest').service('partInfoService', function ($q, gettextCatalog, _, appConstants, Product, Part, PartPack, logger, productConfigurationService, apiHelper, apiConstants, loginService) {

    var rangeOrdering = {};

    var loadRangePromise = apiHelper.get(apiConstants.rangeOrders).then(function (rangeOrders) {

        rangeOrders.forEach(function (rangeOrder) {
            rangeOrdering[rangeOrder.range] = { 'medium' : rangeOrder.medium, 'optimum' : rangeOrder.optimum };
        });

    });

    /*
     * Service public interface
     */
    var service = {
        locale: 'en-GB',
        loadRangePromise: loadRangePromise,
        partUpdatedCallBack:{}
    };


    // Define all public methods

    /**
     *
     * @param {String[][]} foundProducts
     * @returns {{String language, String[] partInfos}}
     */
    var buildPartInfoParams = function (foundProducts) {
        var references = [];

        foundProducts.forEach(function (product) {
            product.forEach(function (reference) {
                references.push(reference);
            });
        });

        return references;
    };

    /**
     *
     * @param {Object} partInfos
     * @param {String} partInfos.partCode
     * @param {String} partInfos.longName
     * @param {String} partInfos.resCode
     * @param {Number} partInfos.price
     * @param (String) partInfos.dataSheetUrl
     *
     * @returns {{}}
     */
    var populatePartInfos = function (partInfos) {
        var partsList = {};

        partInfos.forEach(function (partinfo) {
            if (partinfo.priceInfo === undefined) {
                partinfo.priceInfo = {price: 0, discount: 0};
            }

            partsList[partinfo.partCode] = new Part(partinfo.partCode, partinfo.longName, partinfo.resCode, partinfo.priceInfo.price, partinfo.priceInfo.discount, partinfo.dataSheetUrl, partinfo.image, partinfo.collection);

        });
        return partsList;
    };

    /**
     *
     * @param {String[]} products
     * @param {{}} partsList
     * @returns {Array}
     */
    var populateDetailedProducts = function (products, partsList) {
        var productsList = [];

        products.forEach(function (product) {
            var p = new Product([]);
            var multipleParts = {};
            product.forEach(function (part) {
                if (multipleParts[part] === undefined) {
                    multipleParts[part] = new PartPack(partsList[part], 0);
                    p.parts.push(multipleParts[part]);
                }
                multipleParts[part].quantity++;
            });
            productsList.push(p);
        });
        return productsList;
    };


    service.registerPartUpdatedCallBack=function(callBackStruct)
    {

        service.partUpdatedCallBack[callBackStruct.Id]=callBackStruct.func;

    };

    service.unRegisterPartUpdatedCallBack=function(callBackStruct)
    {
        delete service.partUpdatedCallBack[callBackStruct.Id];


    };

    /**
     * @description Gets detailed products (products with part infos)
     * @return {Promise} the promise that will contain the products
     * @param products
     * @param {String} priceListId
     */
    service.getDetailedProducts = function (products, priceListId) {

        var deferred = $q.defer();

        service.getPartInfos(buildPartInfoParams(products), priceListId)
            .then(function (partInfos) {
                //place received information in a correct data model
                var parts = populatePartInfos(partInfos);

                var detailedProducts = populateDetailedProducts(products, parts);

                var rangePromises = [];
                rangePromises.push(detailedProducts);
                detailedProducts.forEach(function (detailedProduct) {
                    rangePromises.push(productConfigurationService.getProductConfigurations(detailedProduct));
                });

                $q.all(rangePromises).then(function (results) {
                    var detailedProducts = results[0];
                    for (var i = 1; i < results.length; ++i) {
                        if (results[i] && results[i].length > 0) {
                            var product = results[i][0];
                            detailedProducts[i - 1].range = product.range;
                            if (rangeOrdering[product.range] !== undefined) {
                                detailedProducts[i - 1].rangeOrder = product.ratedCurrent <= 160 ? rangeOrdering[product.range].medium : rangeOrdering[product.range].optimum;
                            }
                        }
                    }
                    deferred.resolve(detailedProducts);
                });


            }, function (err) {
                // Alert if there's an error
                logger.error('Cannot build products list', err, 'getDetailedReferences', true);
                deferred.reject();
            });

        return deferred.promise;
    };

    /**
     *
     * @param {String[]} references
     * @param {String} priceListId
     * @returns {*}
     */
    service.getPartInfos = function (references, priceListId) {

        var payload = {};

        payload.language = gettextCatalog.getCurrentLanguage();
        payload.scope = service.locale;
        payload.partInfos = references;
        payload.priceListId = priceListId;

        var headers = {'Content-Type': 'application/json'};
        if (loginService.getUser().authenticated) {
            headers.Authorization = loginService.getUser().userId;
            headers.priceScope = appConstants.priceScope;
        }
        return apiHelper.post(apiConstants.partsInfo, payload, {
            headers: headers
        });
    };

    /**
     *
     */
    service.updatePartsInfo = function (priceListId) {

        var defered=$q.defer();

        var refs = [];
        for (var referenceId in Part.partDictionary) {
            if (!Part.partDictionary[referenceId].isAdditional){
                refs.push(referenceId);
            }
        }

        if (refs.length > 0) {
            this.getPartInfos(refs, priceListId).then(function (partInfos) {
                var referenceUpdateDictionary = {};
                partInfos.forEach(function (partInfo) {

                    referenceUpdateDictionary[partInfo.partCode] = {
                        priceInfo: {
                            price: partInfo.priceInfo.price,
                            discount: (isNaN(parseFloat(partInfo.priceInfo.discount)) ? 0 : partInfo.priceInfo.discount)
                        },
                        longName: partInfo.longName,
                        dataSheetUrl: partInfo.dataSheetUrl,
                        image: partInfo.image,
                        resCode: partInfo.resCode,
                        collection: partInfo.collection
                    };
                });
                Part.updateParts(referenceUpdateDictionary);
                defered.resolve();

                for(var callBack in service.partUpdatedCallBack)
                {
                    service.partUpdatedCallBack[callBack]();
                }
            });
        }
        else
        {
            defered.resolve();
        }

        return defered.promise;
    };

    return service;
});
