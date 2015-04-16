'use strict';

angular.module('helpers').service('phaseToPhaseNeutralHelper', function () {
    /*
     * Service public interface
     */
    var service = {};

    var PhaseToPhaseNeutral = {
        'voltageMin': {
            '1': 1,
            '12': 12,
            '100': 100,
            '220': 100,
            '380': 220,
            '440': 380,
            '500': 380
        },
        'voltageMax': {
            '60': 60,
            '133': 133,
            '240': 133,
            '415': 240,
            '440': 415,
            '500': 415
        }
    };

    service.convertMin = function(value) {
        return PhaseToPhaseNeutral.voltageMin[value];
    };

    service.convertMax = function(value) {
        return PhaseToPhaseNeutral.voltageMax[value];
    };

    return service;
});