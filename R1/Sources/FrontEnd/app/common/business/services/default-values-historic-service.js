'use strict';

angular.module('business').service('defaultValuesHistoricService', function (_, Filter, localStorageService, applicationConfigurationService) {

    var service = {};

    /**
     * Sort in descending order the historic array of selected default values according to the following rules :
     * - most used values are greater
     * - if equal sort characteristics by display order (from left to right according to product configuration screen)
     *
     * @param {Array<{'characteristicName':characteristic, 'used':integer}>} : the historic array to sort
     * @return {Array<{'characteristicName':characteristic, 'used':integer}>} : the historic sorted array of selected default values
     */
    var sortHistoricArray = function (historicArray) {
        return historicArray.sort(function (a, b) {
            // HACK WBA : simple implementation. Could be a bottle neck later with many data
            if (a.used > b.used) {
                return -1;
            }
            if (a.used < b.used) {
                return 1;
            }

            // a.used is equal to b.used --> second rule : compare all other keys
            // extract object keys except 'used', iterate over and compare values
            // like above, 'a' object is the reference
            var keysWithoutUsed = _.keys(_.omit(a, 'used'));
            var length = keysWithoutUsed.length;

            for (var i = 0; i < length; i++) {
                var property = keysWithoutUsed[i];
                var comparisonResult = 0;

                if (_.isString(a[property])) {
                    comparisonResult = a[property].localeCompare(b[property]);
                } else {
                    if (a[property] < b[property]) {
                        comparisonResult = -1;
                    }
                    if (a[property] > b[property]) {
                        comparisonResult = 1;
                    }
                }

                if (comparisonResult !== 0) {
                    return comparisonResult;
                }
            }

            return 0;
        });
    };

    /**
     * Get the historic sorted array corresponding to a historic key
     *
     * @param {historicKey} the key of the historic arry : it is composed of contextCharacteristics and range name
     * @return {Array<{'characteristicName':characteristic, 'used':integer}>} : the historic sorted array of selected default values
     */
    service.getDefaultValuesHistoric = function (historicKey) {
        var storedHistoricArray = localStorageService.get(historicKey);
        if (storedHistoricArray) {
            return storedHistoricArray;
        } else {
            var historicArray = [];
            localStorageService.set(historicKey, historicArray);
            return historicArray;
        }
    };

    /**
     * Store the historic sorted array corresponding to a historic key
     *
     * @param {historicKey} the key to store the array : it is composed of contextCharacteristics and range name
     * @param {Array<{'characteristicName':characteristic, 'used':integer}>} : the historic sorted array of selected default values to store locally
     */
    service.setDefaultValuesHistoric = function (historicKey, array) {
        localStorageService.set(historicKey, array);
    };

    /**
     * Generate the historic key to use for historic values storage from context characteristics and selected range name
     *
     * @param {projectContextCharacteristics : {'characteristicName' : characteristicValue}} : characteristics from project context that impact electric products selection
     * @param {selectedRangeName} : name of current selected products range
     * @return {historicKey} the key of the historic arry : it is composed of contextCharacteristics and range name
     */
    service.getHistoricKey = function (projectContextFilters, selectedRangeName) {
        var historicKey = '';

        projectContextFilters.forEach(function (filter) {
            historicKey += filter.characteristic + '-' + filter.value + '-';
        });

        historicKey += selectedRangeName;

        return historicKey;
    };

    /**
     * Search the object corresponding to characteristics by looking in the historic sorted array for the first line which corresponds to the asked characteristics
     *
     * @param {historicKey} the key of the historic arry : it is composed of contextCharacteristics and range name
     * @param {filters : [Filter]} : Filters containing characteristics that we are looking for
     * @return {characteristics : {'characteristicName' : characteristicValue}, 'used':integer}} : the first object in the array corresponding to the asked characteristics
     */
    var searchObject = function (historicArray, filters) {
        var correspondingObject = _.find(historicArray, function (o) {
            return filters.every(function (element) {
                if (element.value !== o[element.characteristic]) {
                    return false;
                }
                return true;
            });
        });

        return correspondingObject;
    };

    /**
     * Increments the usage of a characteristics choice in the historic sorted array ; then sort it again
     *
     * @param {historicKey} the key of the historic arry : it is composed of contextCharacteristics and range name
     * @param {filters : [Filter]} : Filters containing characteristics that we are looking for
     */
    service.incrementDefaultValuesUsage = function (historicKey, filters, productKey) {
        //search the corresponding object in the historic array var
        var historicArray = service.getDefaultValuesHistoric(historicKey);
        var correspondingObject = searchObject(historicArray, filters);

        if (correspondingObject !== undefined) {
            //if we found this object, add one usage
            correspondingObject.used++;

            if (correspondingObject.productKeys === undefined) {
                correspondingObject.productKeys = {};
            }

            if (correspondingObject.productKeys[productKey] !== undefined) {
                correspondingObject.productKeys[productKey]++;
            }
            else {
                correspondingObject.productKeys[productKey] = 1;
            }


        } else {
            //if we didn't find this object, add it in the historic array, with 1 usage
            var objectToStore = {
                'used': 1,
                'productKeys': {}
            };

            objectToStore.productKeys[productKey] = 1;

            filters.forEach(function (filter) {
                objectToStore[filter.characteristic] = filter.value;
            });
            historicArray.push(objectToStore);
        }

        var sortedHistoricArray = sortHistoricArray(historicArray);

        //store the new historic array
        service.setDefaultValuesHistoric(historicKey, sortedHistoricArray);
    };

    /**
     * Search the default values by looking in the historic sorted array for the first line which corresponds to the characteristics asked by the user
     *
     * @param {historicKey} the key of the historic arry : it is composed of contextCharacteristics and range name
     * @param {characteristics : {'characteristicName' : characteristicValue}} : characteristics asked by the user
     * @param {getProductChoices : boolean : if true return also the chosenProducts in composite object
     * @return corresponding filter or composite object
     */
    service.searchDefaultFilters = function (historicKey, characteristics, getProductChoices) {
        var filterArray = null;
        //search the corresponding object in the historic array var
        var historicArray = service.getDefaultValuesHistoric(historicKey);
        var correspondingObject = searchObject(historicArray, characteristics);
        if (correspondingObject !== undefined && correspondingObject !== null) {
            filterArray = [];
            delete correspondingObject.used;
        }
        if (filterArray !== null) {
            for (var p in correspondingObject) {
                if ((correspondingObject[p] !== correspondingObject.used) && (correspondingObject[p] !== correspondingObject.productKeys)) {
                    filterArray.push(new Filter(p, Filter.equal, correspondingObject[p]));
                }
            }
        }

        if (getProductChoices) {
            var returnObject = {'filterArray': filterArray};

            if (correspondingObject && correspondingObject.productKeys) {
                returnObject.chosenProducts = correspondingObject.productKeys;
            }


            return returnObject;
        }

        return filterArray;
    };

    /**
     * Reset the local storage if version mismatch
     **/
    service.resetLocalStorageIfNeeded = function () {

        applicationConfigurationService.getApplicationParameter('version').then(function (parameter) {
            var versionParameter = parameter.parameterObject;
            if(versionParameter.localStorageVersion!==undefined)
            {
                var localStorageVersion=localStorageService.get('localStorageVersion');
                if(localStorageVersion!==undefined &&localStorageVersion< versionParameter.localStorageVersion)
                {
                    //Erase local storage
                    localStorageService.clearAll();

                    localStorageService.set('localStorageVersion',versionParameter.localStorageVersion);
                }

            }



        });


    };
    return service;


});