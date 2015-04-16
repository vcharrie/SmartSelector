'use strict';

/**
 * @class angular_module.business.switchboardContentService
 */
angular.module('business').service('switchboardContentService', function() {
   /*
    * Service public interface
    *
    * This service helps keeping state for the switchboard-content controller
    * When user navigates away from this module and come back, we want to keep the same state
    */
    /**
     * @property boolean displayBasket
     * @property boolean displaySelection
     * @property RangeItem lastSelectedRangeItem
     */
    var service = {
        displayBasket: false,
        displaySelection: true,
        lastSelectedRangeItem: {},
        lastSelectedDistributionRange: {}
    };

    return service;
});