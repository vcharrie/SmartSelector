'use strict';

angular.module('smartPanelWizzard').service('smartPanelWizzardService', function($modal){
    /*
     * Service public interface
     */
    var service = {
    };

    service.runWizzard = function(data, hadEnclosure) {
        var steps = hadEnclosure ? ['select', 'addedProducts', 'updateEnclosure'] : ['select', 'addedProducts'];
        return $modal.open({
            templateUrl: 'modules/smart-panel-wizzard/smart-panel-wizzard.view.html',
            windowClass: 'extended-modal-dialog',
            controller: 'smartPanelWizzard',
            backdrop : 'static',
            keyboard: false,
            resolve: {
                data : function() {
                    return data;
                },
                steps : function() {
                    return steps;
                },
                hadEnclosure : function() {
                    return hadEnclosure;
                }
            }
        });
    };

    return service ;
});