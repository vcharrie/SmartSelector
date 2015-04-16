'use strict';

/**
 * @class angular_module.removedProducts
 */
angular.module('removedProducts',['business','gettext'])
    .run(function($rootScope, projectService, removedProductsService){
        $rootScope.$on(projectService.productsDeletedAfterLoadingEvent, function(event,productsRemoved){
            removedProductsService.openModal(productsRemoved);
        });
    });