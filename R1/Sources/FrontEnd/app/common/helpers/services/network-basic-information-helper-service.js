'use strict';

/**
 * @class angular_module.helpers.services.networkBasicInformationService
 */
angular.module('helpers').service('networkBasicInformationHelperService', function($filter) {

    var service = {
    };

    /**
     * @description
     * @param
     * @returns
     */
    service.getCharacteristicFormattedAndTranslatedValue = function(deviceProductPack, characteristicName) {
        var mainCharacteristic = {};
        deviceProductPack.rangeItem.mainCharacteristics.forEach(function (characteristic) {
            if (characteristic.name === characteristicName){
                mainCharacteristic = characteristic;
            }
        });
        return $filter('formatAndTranslateCaract')(deviceProductPack.characteristicValue(characteristicName), mainCharacteristic);
    };

    return service;
});