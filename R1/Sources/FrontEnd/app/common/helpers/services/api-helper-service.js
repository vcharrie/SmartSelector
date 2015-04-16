'use strict';

/**
 * apiHelper: provides helper methods to perform REST requests.
 */
angular.module('helpers').service('apiHelper', function ($rootScope, $window,$cookies, $http, $q, gettextCatalog, logger, apiConstants, adminService) {
    /*
     * Service public interface
     */
    var service = {};

    service.onlineEventName = 'online';
    service.offlineEventName = 'offline';

    var lastRequestFailed = 0;
    var pendingRequestCount = 0 ;
    var isOnline = true ;

    /**
     * Send a generic message to warn user that a request failed.
     * A timestamp is used to avoid spamming user with several toaster.
     */
    var warnUserRequestFailed = function () {
        // Warn user that the post request failed
        var timestamp = new Date().getTime();
        if (timestamp - lastRequestFailed > 10000) {
            lastRequestFailed = timestamp;
            logger.error(gettextCatalog.getString('REQUEST_FAILED'), '', '', true, null, {showUser: true});
        }
    };


    /**
     *
     * @param {boolean} newState
     */
    var switchOnlineState = function(newState){
        if (newState && !isOnline && pendingRequestCount===0){
            $rootScope.$emit(service.onlineEventName);
            isOnline = true ;
        } else if(!newState && isOnline){
            $rootScope.$emit(service.offlineEventName);
            isOnline = false ;
        }
    };

    /**
     *
     * @param {function} httpRequest : function that returns http request promise
     * @param {number} timeout after which http request will be send (default : 0)
     * @returns {*}
     */
    var sendHttpRequest = function(httpRequest,timeout){
        var deferred = $q.defer();

        timeout = typeof timeout !== 'undefined' ? timeout : 0 ;

        setTimeout(function(){
            pendingRequestCount++ ;
            httpRequest().success(function (result) {
                pendingRequestCount-- ;
                switchOnlineState(true);
                deferred.resolve(result);
            }).error(function (data, status) {
                pendingRequestCount-- ;
                if ((status===504 ||status===502 || status===404) && !adminService.developerMode()){
                    switchOnlineState(false);
                    sendHttpRequest(httpRequest,5000).then(function(result){
                        deferred.resolve(result);
                    },function(err){
                        deferred.reject(err);
                    });
                } else {
                    switchOnlineState(true);
                    warnUserRequestFailed();
                    deferred.reject(data);
                }
            });
        },timeout);

        return deferred.promise;
    };

    // Add listeners to be notified when connection is lost
    $window.addEventListener('offline', function () {
        if (!adminService.developerMode()){
            switchOnlineState(false);
        }
    }, false);
    $window.addEventListener('online', function () {
        if (!adminService.developerMode()){
            switchOnlineState(true);
        }
    }, false);


    var buildUrl = function (url) {
        var urlToReach = url + '';

        if (urlToReach.slice(0, 'http'.length) !== 'http') {
            urlToReach = apiConstants.baseUri + urlToReach;
        }
        return urlToReach;
    };

    /**
     * Executes GET request.
     *
     * @param url {string} url of the REST service call.
     * @param params {Object} Map of strings or objects which will be turned to ?key1=value1&key2=value2 after the url. If the value is not a string, it will be
     *                        JSONified.
     * @param headers {Object}header to add to request
     * @return the $http promise.
     */
    service.get = function (url, params, headers, responseType) {
        var headerPropeties = {
            'Content-type': 'application/json'
        };
        if (responseType === undefined) {
            responseType = {};
        }
        if (headers !== undefined && headers !== null) {
            headers.forEach(function (header) {
                headerPropeties[header.name] = header.value;
            });
        }

        return sendHttpRequest(function(){
            return $http.get(buildUrl(url), {
                headers: headerPropeties,
                params: params,
                responseType: responseType
            });
        });
    };

    /**
     * Executes POST request.
     *
     * @param url {string} - Url of the REST service call.
     * @param data {string|Object} – Data to be sent as the request message data.
     * @param httpParam {Object} - Optional http param (see Angular's documentation)
     * @return the $http promise.
     */
    service.post = function (url, data, httpParam) {
        return sendHttpRequest(function(){
            return $http.post(buildUrl(url), JSON.stringify(data), httpParam);
        },0);
    };

    /**
     * Executes POST request.
     *
     * @param url {string} - Url of the REST service call.
     * @param file {file} – File to be sent as the post message data.
     * @param headers {Object} - Optional http param (see Angular's documentation)
     * @return the $http promise.
     */
    service.postFile = function (url, file, headers) {
        var fd = new FormData();
        fd.append('file', file);

        return $http.post(url, fd, {
            transformRequest: angular.identity,
            headers: headers
        });
    };


    /**
     * Executes POST request.
     *
     * @param url {string} url of the REST service call.
     * @param data {string|Object} – Data to be sent as the request message data.
     *
     * @return the $http promise.
     */
    service.put = function (url, data, httpParam) {

        var strData = JSON.stringify(data);
        if (strData === '{}') {
            strData = data;
        }

        return sendHttpRequest(function(){
            return $http.put(buildUrl(url), strData, httpParam);
        },0);
    };
    /**
     * Executes POST request.
     *
     * @param url {string} url of the REST service call.
     * @param data {string|Object} – Data to be sent as the request message data.
     *
     * @return the $http promise.
     */
    service.putObject = function (url, data, httpParam) {
        return sendHttpRequest(function(){
            return $http.put(buildUrl(url), data, httpParam);
        },0);
    };

    return service;
});
