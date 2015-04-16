'use strict';

/**
 * @class angular_module.rest.applicationConfigurationService
 */
angular.module('rest').service('applicationConfigurationService', function (_, $q, apiHelper, apiConstants) {
    var service = {
    };

    /**
     * @description Call the backend to get the application parameter with given id
     *
     * @param {string} parameterId the parameter id
     * @return : {String parameterId, Object parameterObject}
     */
    service.getApplicationParameter = function (parameterId, noFailOnMissing) {
        var deferred = $q.defer();
        apiHelper.get(apiConstants.applicationConfiguration, { parameterId: parameterId }).then(function (result) {
            deferred.resolve(result);
        }, function (err) {
            if (noFailOnMissing) {
                deferred.resolve({Warning: 'Not found'});
            }
            else {
                deferred.reject(err);
            }
        });

        return deferred.promise;
    };

    /**
     * @description Call the backend to get the application parameter with given id
     *
     * @param {string} parameterId the parameter id
     * @param {object} parameterObject the parameter object
     * @return : {string parameterId, {object} parameterObject}
     */
    service.setApplicationParameter = function (parameterId, parameterObject) {
        return apiHelper.put(apiConstants.updateApplicationConfiguration, { parameterId: parameterId, parameterObject: parameterObject});
    };

    return service;
});