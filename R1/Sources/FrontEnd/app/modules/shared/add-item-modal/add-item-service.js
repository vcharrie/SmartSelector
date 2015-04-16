'use strict';

angular.module('shared').service('addItemService', function ($modal) {
    /*
     * Service public interface
     */
    var service = {};

    service.addItem = function (additionalItems) {

        return $modal.open({
            templateUrl: 'modules/shared/add-item-modal/add-item.view.html',
            controller: 'addItem',
            backdrop: 'static',
            keyboard: false,
            resolve: {
                additionalItems: function () {
                    return additionalItems;
                }
            }
        });
    };

    return service;
});

