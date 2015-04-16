'use strict';

/**
 * @class angular_module.business.switchboardOrganisationService
 */
angular.module('business').service('switchboardOrganisationService', function() {
   /*
    * Service public interface
    */
    /**
     * @property integer displayBasket
     * @property boolean displaySelection
     * @property RangeItem lastSelectedRangeItem
     */
    var service = {
        displayedZoom: 100,
        zoomCoefficient: 0.9
    };

    return service;
});