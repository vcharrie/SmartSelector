angular.module('profileService', [])
    .factory('profileService', ['$http', 'baseUrl', 'token', function($http, baseUrl, token) {
        /*
         * Service public interface
         */
        var service = {
            baseUrl: baseUrl,
            token: token
        };

        service.init = function(baseUrl, token) {
            this.baseUrl = baseUrl;
            this.token = token;
        };

        /**
         * Load the connected user profile.
         */
        service.load = function() {
            return $http.get(this.baseUrl, {headers: {'Authorization': this.token, 'Accept': 'application/json'}});
        };

        /**
         * Load the connected user profile.
         */
        service.save = function(profile) {
            return $http.put(this.baseUrl, profile, {headers: {'Authorization': this.token}});
        };

        service.hasProvider = function (providerName, profile) {
            if (profile === undefined) {
                return false;
            }
            var socialIdentities = profile.socialIdentities;
            if (!angular.isArray(socialIdentities) || socialIdentities.length < 1) {
                return false;
            }
            var result = false;
            socialIdentities.forEach(function (socialId) {
                if (socialId.providerName === providerName) {
                    result = true;
                }
            });
            return result;
        };

        return service;
    }]);