'use strict';

angular.module('shared').service('projectEditionService', function($modal){
    /*
     * Service public interface
     */
    var service = {
    };

    service.editProjectInfos = function(isProjectCreation, editProjectCallback) {
        var temp = isProjectCreation;

        $modal.open({
            templateUrl: 'modules/shared/project-edition/project-edition.view.html',
            controller: 'projectEdition',
            backdrop : 'static',
            keyboard: false,
            resolve: {
                isProjectCreation : function() {
                    return temp;
                },
                reloadApplication: function() {
                    return false;
                },
                editProjectCallback: function() {
                    return editProjectCallback;
                }
            }
        });
    };

    return service ;
});