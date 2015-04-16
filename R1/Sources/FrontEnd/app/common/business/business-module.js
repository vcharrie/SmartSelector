'use strict';

/**
 * @class angular_module.business
 */
angular.module('business',['helpers', 'gettext', 'rest', 'LocalStorageModule', 'config', 'tracking', 'model'])
    .run(function(translationService,projectService,partInfoService,$rootScope, Project){
        $rootScope.$on(translationService.languageChangingEventName, function(event, language){
            projectService.locale = language;
            partInfoService.locale = language;
            if (Project.current){
                partInfoService.updatePartsInfo(Project.current.priceList.id).then(function() {
                    $rootScope.$broadcast('languageChanged',language);
                });
            }
        });
    });
