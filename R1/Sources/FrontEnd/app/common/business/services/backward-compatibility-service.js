'use strict';

/**
 * @description backward compatibility service : handle compatibility with previous version of projects
 * @class angular_module.business.backwardCompatibilityService
 */
angular.module('business').service('backwardCompatibilityService', function(_, $q, gettextCatalog, productPriceService, auxiliariesService, apiHelper, apiConstants){

    var service = {};

    /**
     *
     * @param {Object} projectFile
     * @param {Number} version
     * @param {Function} transformFunction function to apply on projectFile if project version is inferior to version
     * @returns {Promise}
     */
    function transformProject(projectFile, version, transformFunction){
        var deferred = $q.defer();

        if (projectFile.version < version){
            transformFunction(projectFile).then(function(transformedProjectFile){
                deferred.resolve(transformedProjectFile);
            });
        } else {
            deferred.resolve(projectFile);
        }

        return deferred.promise ;
    }

    //1.1 version add pricelist id concept
    function transformInto1dot1Project(projectFile) {
        var deferred = $q.defer();

        productPriceService.defaultCountryPriceList().then(function (defaultPricelist) {
            projectFile.priceList = defaultPricelist;
            deferred.resolve(projectFile);
        });

        return deferred.promise;
    }

    function initFlag(device){
        device.basketIndexUpdated = false ;
        device.children.forEach(function(child){
            initFlag(child);
        });
    }

    function findFirstIndexOfProductPack(productPack1, basket) {
        for (var productPackId = 0 ; productPackId<basket.list.length ; productPackId++) {
            var productPack2 = basket.list[productPackId];
            var product1 = productPack1.product ;
            var product2 = productPack2.product ;
            if (product1.parts.length === product2.parts.length){
                var isSameProduct = true ;
                for (var partPackId = 0 ; partPackId<product1.parts.length ; partPackId++){
                    var partPack1 = product1.parts[partPackId];
                    var partPack2 = product2.parts[partPackId];
                    if (partPack1.quantity !== partPack2.quantity || partPack1.part.partCode !== partPack2.part.partCode){
                        isSameProduct = false;
                        break;
                    }
                }
                if (isSameProduct){
                    return productPackId ;
                }
            }
        }
        return -1 ;
    }

    function findDevice(device, basketIndex, deviceTypes) {
        if (device.basketIndex === basketIndex &&  _.contains(deviceTypes,device.type) && !device.basketIndexUpdated){
            delete device.basketIndexUpdated;
            return device ;
        }

        for (var i=0 ; i<device.children.length ; i++){
            var child = device.children[i];
            var foundDevice = findDevice(child,basketIndex,deviceTypes);
            if (foundDevice !== null){
                return foundDevice ;
            }
        }

        return null ;
    }

    function findDeviceInNetwork(network, basketIndex, deviceTypes) {
        for (var i=0 ; i<network.incomerDevices.length ; i++){
            var incomerDevice = network.incomerDevices[i];
            var foundDevice = findDevice(incomerDevice,basketIndex,deviceTypes);
            if (foundDevice !== null){
                return foundDevice;
            }
        }
        return null ;
    }

    function fixProductsBasketIndexInNetwork(projectFile){
        // add flag on devices that indicates if basketIndex has been updated
        projectFile.network.incomerDevices.forEach(function(device){
            initFlag(device);
        });

        [projectFile.electricBasket,projectFile.distributionBasket].forEach(function(basket){
            var deviceTypes = basket.name === 'electricBasket' ? ['electrical','measure', 'surgeArrester'] : ['distribution'];
            for (var basketIndex=0 ; basketIndex<basket.list.length ; basketIndex++){
                var productPack = basket.list[basketIndex];
                var firstIndexOfProductInBasket = findFirstIndexOfProductPack(productPack,basket);
                var deviceToUpdate = findDeviceInNetwork(projectFile.network,firstIndexOfProductInBasket,deviceTypes);
                if (deviceToUpdate !== null){
                    deviceToUpdate.basketIndex = basketIndex ;
                    productPack.quantity = deviceToUpdate.quantity;
                }
            }
        });
    }

    function fixReferencesCollection(projectFile){
        var deferred = $q.defer();

        var httpPromises = [] ;

        projectFile.switchboardPacks.forEach(function(switchboardPack){
            var switchboard = switchboardPack.switchboard ;
            [switchboard.electricBasket,switchboard.mechanicBasket,switchboard.distributionBasket,switchboard.functionalUnitsBasket, switchboard.additionalProductsBasket, switchboard.additionalItemsBasket].forEach(function(basket){
                basket.list.forEach(function(productPack){
                    productPack.product.parts.forEach(function(partPack){
                        var promise = $q.defer();
                        httpPromises.push(promise.promise);
                        apiHelper.get(apiConstants.getReferenceCollection+partPack.part.partCode).then(function(referenceCollection){
                            partPack.part.collection = referenceCollection ;
                            promise.resolve();
                        });
                    });
                });
            });
        });

        $q.all(httpPromises).then(function(){
            deferred.resolve(projectFile);
        });

        return deferred.promise ;
    }

    //1.9 version add multi switchboards functionality
    function transformInto1dot9Project(projectFile) {
        var deferred = $q.defer();

        transformProject(projectFile,1.1,transformInto1dot1Project).then(function(transformedProjectFile){
            fixProductsBasketIndexInNetwork(transformedProjectFile);

            //Create switchboard pack from project values
            transformedProjectFile.switchboardPacks = [];
            var switchboardPack = {};
            switchboardPack.quantity = 1;
            var switchboard = {};
            switchboard.name = gettextCatalog.getString('default-switchboard-name');
            switchboard.electricBasket = transformedProjectFile.electricBasket;
            switchboard.mechanicBasket = transformedProjectFile.mechanicBasket;
            switchboard.distributionBasket = transformedProjectFile.distributionBasket;
            switchboard.functionalUnitsBasket = transformedProjectFile.functionalUnitsBasket;
            switchboard.additionalProductsBasket = transformedProjectFile.additionalProductsBasket;
            switchboard.contextCharacteristics = transformedProjectFile.contextCharacteristics;
            switchboard.network = transformedProjectFile.network;
            if (transformedProjectFile.enclosureSolution && transformedProjectFile.enclosureSolution.length > 0) {
                switchboard.enclosureSolution = transformedProjectFile.enclosureSolution[0];
            }
            switchboard.isSolutionDirty = transformedProjectFile.isSolutionDirty;

            switchboardPack.switchboard = switchboard;
            transformedProjectFile.switchboardPacks.push(switchboardPack);

            deferred.resolve(transformedProjectFile);
        });

        return deferred.promise ;
    }

    //1.91 add additionalItemsBasket
    function transformInto1dot91Project(projectFile) {
        var deferred = $q.defer();

        transformProject(projectFile,1.9,transformInto1dot9Project).then(function(transformedProjectFile){
            transformedProjectFile.switchboardPacks.forEach(function(switchboardPack) {
                switchboardPack.switchboard.additionalItemsBasket = {
                    name: 'additionalItemsBasket',
                    list: []
                };
            });
            deferred.resolve(transformedProjectFile);
        });

        return deferred.promise ;
    }

    //1.92 fix part collectoon
    function transformInto1dot92Project(projectFile) {
        var deferred = $q.defer();

        transformProject(projectFile,1.91,transformInto1dot91Project).then(function(transformedProjectFile){
            fixReferencesCollection(projectFile).then(function(){
                deferred.resolve(transformedProjectFile);
            });
        });

        return deferred.promise ;
    }

    /**
     *
     * @param {Object} projectFile
     * @returns {Promise}
     */
    service.transformIntoCurrentVersionFormat = function(projectFile){
        return transformProject(projectFile,1.92,transformInto1dot92Project);
    };

    service.getInvalidProducts = function(productPacks){
        var deferred = $q.defer();

        var productsReferences = _.map(productPacks,function(productPack){
            return auxiliariesService.getMainPartsReferences(productPack.product);
        });

        apiHelper.post(apiConstants.getInvalidProducts,productsReferences).then(function(invalidProductsReferences){
            var invalidProductPacks = _.filter(productPacks,function(productPack){
                 var foundProductPack = _.find(invalidProductsReferences, function(invalidProductReferences){
                     var productPackReferences = productPack.product.references() ;

                     if (invalidProductReferences.length !== productPackReferences.length){
                         return false;
                     }

                     for (var i=0 ; i<invalidProductReferences.length ; i++){
                         if (invalidProductReferences[i] !== productPackReferences[i]){
                             return false;
                         }
                     }

                     return true;
                 });

                return foundProductPack !== undefined ;
            });

            deferred.resolve(invalidProductPacks);
        });

        return deferred.promise ;
    };

    return service ;
});
