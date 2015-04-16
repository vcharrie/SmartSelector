'use strict';

angular.module('shared').service('discountEditorService', function ($modal) {
    /*
     * Service public interface
     */
    var service = {};

    service.editDiscounts = function (editMode, selectPriceListCallback) {


        $modal.open({
            templateUrl: 'modules/shared/discount-editor/discount-editor.view.html',
            controller: 'discountEditor',
            backdrop: 'static',
            keyboard: false,
            resolve: {
                reloadApplication: function () {
                    return false;
                },
                editMode: function () {
                    return editMode;
                },
                selectPriceListCallback: function () {
                    return selectPriceListCallback;
                }

            }
        });
    };

    return service;
});
