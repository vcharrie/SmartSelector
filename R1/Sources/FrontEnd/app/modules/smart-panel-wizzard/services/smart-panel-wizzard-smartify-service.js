'use strict';

angular.module('smartPanelWizzard').service('smartPanelWizzardSmartifyService', function(_, $q, googleAnalyticsService, productConfigurationService, smartPanelService, partInfoService, Project, gettextCatalog){
    /*
     * Service public interface
     */
    var that = this;

    var service = {
    };

    that.getBomPathForPartCode = function (bomPathedProductMap, partCode) {
        var partCodeFound = _.find(bomPathedProductMap, function (items) {
            return items.reference === partCode;
        });
        if (partCodeFound) {
            return partCodeFound.bomPath;
        } else {
            return '';
        }
    };

    that.getProductReferences = function (product) {
        var refs = [];
        for (var i = 0; i < product.parts.length; i++) {
            var curPart = product.parts[i];
            for (var j = 0; j < curPart.quantity; j++) {
                refs.push(curPart.part.partCode);
            }
        }
        return refs;
    };

    that.getBomPathedProductMap = function (bomPathedMap, product) {
        var foundBPProduct = _.find(bomPathedMap, function (item) {
            return (!!item) && (!!item.productContent) && _.difference(item.productContent.split('_').sort(), that.getProductReferences(product).sort()).length === 0;
        });
        if (foundBPProduct) {
            return foundBPProduct.mappingReferenceBomPath;
        } else {
            return [];
        }
    };

    that.getBomPathedPart = function (part, bomPathedProductMap) {
        var bomPathedPart = {
            'reference': part.partCode,
            'bompath': that.getBomPathForPartCode(bomPathedProductMap, part.partCode)
        };
        return bomPathedPart;
    };

    that.getBomPathedPartList = function (parts, bomPathedProductMap) {
        var bomPathedPartList = [];
        for (var j = 0; j < parts.length; j++) {
            var currentPart = parts[j];
            var bomPathedPart = that.getBomPathedPart(currentPart.part, bomPathedProductMap);
            for (var qj = 0; qj < currentPart.quantity; qj++) {
                bomPathedPartList.push(bomPathedPart);
            }
        }
        return {'parts': bomPathedPartList};
    };

    that.getPartedProductPromise = function (product) {
        return productConfigurationService.getProductConfigurations(product).then(function (res) {
            return res[0];
        }, function () {
            return null;
        });
    };

    that.getBomPathedPromise = function (partedProductList) {
        var deferred = $q.defer();
        var bomPathedPromises = [];
        for (var i = 0; i < partedProductList.length; i++) {
            bomPathedPromises.push(that.getPartedProductPromise(partedProductList[i].product));
        }
        $q.all(bomPathedPromises).then(function (results) {
            deferred.resolve(results);
        }, function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    };

    /**
     * Converts a bomPathedProduct list to a Product list
     * @param bomPathedProduct
     * @returns {*} The converter promise
     */
    that.getDetailedProductPromise = function (bomPathedProducts) {
        var refsArray = [];
        for (var i = 0; i < bomPathedProducts.length; i++) {
            var currentBomPathedProduct = bomPathedProducts[i];
            var productsRefs = [];
            for (var j = 0; j < currentBomPathedProduct.parts.length; j++) {
                var currentBomPathedPart = currentBomPathedProduct.parts[j];
                productsRefs.push(currentBomPathedPart.reference);
            }
            refsArray.push(productsRefs);
        }
        if (refsArray.length>0) {
            return partInfoService.getDetailedProducts(refsArray, Project.current.priceList.id);
        } else {
            var deferred = $q.defer();
            deferred.resolve([]);
            return deferred.promise;
        }
    };

    that.getSmartifiedDetailedProducts = function (wsResult) {
        var deferred = $q.defer();
        var detailedSmartifiedProductPromise = [that.getDetailedProductPromise(wsResult.smartifiedProducts)];
        var detailedAdditionalProductPromise = [that.getDetailedProductPromise(wsResult.additionalProducts)];
        $q.all(detailedSmartifiedProductPromise).then(function (detailedSmartifiedProduct) {
            $q.all(detailedAdditionalProductPromise).then(function (detailedAdditionalProduct) {
                deferred.resolve({'smartifiedProducts': detailedSmartifiedProduct[0], 'additionalProducts': detailedAdditionalProduct[0]});
            }, function (err) {
                deferred.reject(err);
            });
        }, function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    };

    that.convertProductListToBomPathedProductList = function (partedProductList) {
        var deferred = $q.defer();
        that.getBomPathedPromise(partedProductList).then(function (bomPathedMap) {
            var bomPathedProductList = [];
            for (var i = 0; i < partedProductList.length; i++) {
                var currentProduct = partedProductList[i];
                var bomPathedPartList = that.getBomPathedPartList(currentProduct.product.parts, that.getBomPathedProductMap(bomPathedMap, currentProduct.product));
                for (var qi = 0; qi < currentProduct.quantity; qi++) {
                    bomPathedProductList.push(bomPathedPartList);
                }
            }
            deferred.resolve(bomPathedProductList);
        }, function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    };

    that.getReferences = function (partArray) {
        var refs = [];
        for (var i = 0; i < partArray.length; i++) {
            var partCode = partArray[i].part.partCode;
            for (var j = 0; j < partArray[i].quantity; j++) {
                refs.push(partCode);
            }
        }
        return refs.sort();
    };

    that.productPartsEquals = function (partArrayA, partArrayB) {
        var equals = partArrayA.length === partArrayB.length;

        equals = equals && _.difference(that.getReferences(partArrayA), that.getReferences(partArrayB)).length === 0;

        return equals;
    };

    that.productsAreEquals = function (productA, productB) {
        return productA && productB &&
            productA.product && productB.product &&
            productA.product.parts && productB.product.parts &&
            productA.product.parts.length === productB.product.parts.length &&
            that.productPartsEquals(productA.product.parts, productB.product.parts);
    };

    that.createMapping = function (smartified, originalItems) {
        var mapping = [];
        var iSmartified = 0;
        for (var iOriginalItems = 0; iOriginalItems < originalItems.length; iOriginalItems++) {
            var beforeProduct = originalItems[iOriginalItems];
            var afterProduct = {
                'product': smartified[iSmartified],
                'parent': beforeProduct.parent,
                'quantity': beforeProduct.quantity,
                'type': beforeProduct.type
            };


            /** then changing css we can display not converted data */
            if (that.productsAreEquals(beforeProduct, afterProduct)) {
                // already smart but needs to be added for additional products. If not smartisable, no effect
                beforeProduct.convert = true;
                beforeProduct.disabled = true;
            } else {
                beforeProduct.disabled = false;
            }
            mapping.push({'before': beforeProduct, 'after': afterProduct});


            iSmartified += beforeProduct.quantity;
        }
        if (iSmartified !== smartified.length) {
            console.log('Error of length of received smartified products. Expected ' + iSmartified + ' but received ' + smartified.length);
        }
        return mapping;
    };

    that.identifyProduct = function(parts) {
        var partsCodes = [];
        _.each(parts, function(part) {
            partsCodes.push(part._part.partCode);
        });
        return partsCodes.join('_');
    };

    that.createAdditionals = function (additional) {
        var mapping = [];
        var previousProductId = '';
        for (var i = 0; i < additional.length; i++) {
            var currentProductId = that.identifyProduct(additional[i]._parts);
            var product = {
                'product': additional[i],
                'parent': null,
                'quantity': 1,
                'type': null
            };

            if(currentProductId === previousProductId) {
                mapping[mapping.length-1].quantity++;
            } else {
                mapping.push(product);
            }

            previousProductId = currentProductId;
        }
        return mapping;
    };

    service.SERVICE_ERROR = gettextCatalog.getString('smart-panel-wizard-detailed-products-error');
    service.WEB_SERVICE_ERROR = gettextCatalog.getString('smart-panel-wizard-web-service-error');

    /**
     * @param selectedItems Row products in internal JS model
     * @returns { smartified[{before:Pb1,after:Pc1},{before:Pb2,after:Pc2},...] , additional[Pa1,Pa2,...] } , in the internal JS model format!!! for directive display
     * Needs to reconstruct objects with description and pictures etc
     */
    service.smartifyDevices = function (selectedItems) {
        var deferred = $q.defer();
        setTimeout(function () {
            that.convertProductListToBomPathedProductList(selectedItems).then(function (bomPathedProductList) {
                smartPanelService.convertToSmartDevices(bomPathedProductList).then(function (result) {
                    that.getSmartifiedDetailedProducts(result).then(function (detailedResult) {
                        var mapping = that.createMapping(detailedResult.smartifiedProducts, selectedItems);
                        deferred.resolve({'smartified': mapping, 'rawSmartifiedRefsWithBomPath': result});
                    }, function (error) {
                        console.log('Error : ' + error);
                        deferred.reject([service.SERVICE_ERROR, error]);
                    });
                }, function (err) {
                    console.log('Error : ' + err);
                    deferred.reject([service.WEB_SERVICE_ERROR, err]);
                });

            });
        }, 10);

        return deferred.promise;
    };

    /**
     * @param selectedItems Row products in internal JS model
     * @returns { smartified[{before:Pb1,after:Pc1},{before:Pb2,after:Pc2},...] , additional[Pa1,Pa2,...] } , in the internal JS model format!!! for directive display
     * Needs to reconstruct objects with description and pictures etc
     */
    service.smartifyPanel = function (selectedItems) {
        var deferred = $q.defer();
        setTimeout(function () {
            smartPanelService.convertToSmartPanel(selectedItems).then(function (result) {
                that.getSmartifiedDetailedProducts(result).then(function (detailedResult) {
                    var additional = that.createAdditionals(detailedResult.additionalProducts);
                    deferred.resolve({'additional': additional});
                }, function (error) {
                    console.log('Error : ' + error);
                    deferred.reject([service.SERVICE_ERROR, error]);
                });
            }, function (err) {
                console.log('Error : ' + err);
                deferred.reject([service.WEB_SERVICE_ERROR, err]);
            });
        }, 10);

        return deferred.promise;
    };

    return service;
});
