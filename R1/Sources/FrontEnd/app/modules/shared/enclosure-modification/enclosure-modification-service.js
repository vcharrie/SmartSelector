'use strict';

angular.module('shared').service('enclosureModificationService', function($modal){
    /*
     * Service public interface
     */
    var service = {
    };

    service.noSolutionFoundWithFiltersRequestKey = 'noSolutionWithFilters';
    service.noSolutionFoundWithoutFiltersRequestKey = 'noSolutionWithoutFilters';
    service.modifySolutionRequestKey = 'modify';

    service.modifyEnclosure = function(request, currentSolution, searchSolutionFunction, error) {
        var requestKey = request;
        var solution = currentSolution;
        var searchSolution = searchSolutionFunction;
        var errorMessage = error;

        return $modal.open({
            templateUrl: 'modules/shared/enclosure-modification/enclosure-modification.view.html',
            windowClass: 'extended-elastic-modal-dialog',
            controller: 'enclosureModification',
            backdrop : 'static',
            keyboard: false,
            resolve: {
                requestKey : function() {
                    return requestKey;
                },
                solution : function() {
                    return solution;
                },
                searchSolution : function() {
                    return searchSolution;
                },
                errorMessage : function() {
                    return errorMessage;
                }
            }
        });
    };

    return service ;
});