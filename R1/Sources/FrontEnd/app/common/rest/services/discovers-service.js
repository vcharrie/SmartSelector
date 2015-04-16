'use strict';

/**
 * @class angular_module.business.partInfoService
 */
angular.module('rest').service('discoversRestService', function ($q, $cookies, _, appConstants, apiHelper, apiConstants) {

    var service = {};


    service.getDiscovers = function (language) {
        var parametrizedUrl = apiConstants.discoversList;
        parametrizedUrl = parametrizedUrl.replace('{language}', language);

        return apiHelper.get(parametrizedUrl);
    };

    service.getDetailedDiscover = function (language, discoverId) {

        var parametrizedUrl = apiConstants.discoversDetail;
        parametrizedUrl = parametrizedUrl.replace('{language}', language).replace(new RegExp('{discoverId}', 'g'), discoverId);


        return apiHelper.get(parametrizedUrl);

    };

    service.discoverMustBeDisplayed = function (language) {
        var deferred = $q.defer();

        service.getDiscovers(language).then(function (data) {
            var lastDiscover = -1;
            if (Object.prototype.toString.call(data) === '[object Array]') {
                data.forEach(function (discover) {
                    if (lastDiscover < discover.order) {
                        lastDiscover = discover.order;
                    }
                });
            }
            var lastDiscoverCookie = $cookies.SSO_QUICKQUOTATION_LAST_DISCOVER;
            var discover = true;
            if (lastDiscoverCookie !== undefined && lastDiscoverCookie >= lastDiscover) {
                discover = false;
            }

            $cookies.SSO_QUICKQUOTATION_LAST_DISCOVER = lastDiscover;

            deferred.resolve({'discoverMustBeDisplayed': discover, 'lastDiscover': lastDiscover});
        }, function () {
            deferred.resolve({'discoverMustBeDisplayed': false, 'lastDiscover': -1});
        });


        return deferred.promise;
    };


    return service;
});