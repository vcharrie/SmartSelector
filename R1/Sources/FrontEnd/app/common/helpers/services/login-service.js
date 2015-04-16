'use strict';

/**
 * @class angular_module.business.loginService
 */
angular.module('helpers').service('loginService', function (_, $rootScope, $q, $cookieStore, $window, $location, applicationConfigurationService, adminService, logger, apiHelper, apiConstants) {

    /**
     *
     * @typedef {{userId: string, state: string, authenticated: boolean, preferredLanguage: string, name: string, mail: string, companyName: string, country: string, socialIdentities: Array.<{String userPictureUrl}>, userImage: string}} sessionInfo
     */
    var _sessionInfo = {
        'uniqueUserId': '0123456789',
        'userId': '0123456789',
        'state': '9876543210',
        'authenticated': false,
        'preferredLanguage': 'en',
        'name': 'Guest',
        'mail': 'Guest@mail.com',
        'companyName': 'Big company',
        'country': 'nowhere',
        'socialIdentities': [],
        'userImage': 'images/user-phantom.jpg'
    };

    var disabledRefreshToken = false;

    /**
     * @description Service public interface
     * @type {{authenticationUrl: string}}
     */
    var service = {
        authenticationUrl: '',
        sessionExpireDate: new Date(),
        sessionExpireTime: 120
    };

    // Define all public methods
    /**
     * @description Get user info
     *@return sessionInfo;
     */
    service.getUser = function () {
        return _sessionInfo;
    };

    /**
     * @description Get userId from url
     *  @return userId;
     */
    service.getUserIdFromParameter = function (absUrl) {
        var name = 'userId';
        var regex = new RegExp('[\\?&]' + name + '=([^&#]*)'),
            results = regex.exec(absUrl);
        return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
    };

    /**
     * @description Set credential
     * @param {Object} sessionInfo
     * @param {String} sessionInfo.userId
     * @param {String} sessionInfo.state
     * @param {noRedirect} sessionInfo
     * @return {Promise} the promise that will contain the user information
     */
    service.setCredentials = function (sessionInfo, noDisconnect) {
        var deferred = $q.defer();
        if (sessionInfo !== null && sessionInfo !== undefined) {
            _sessionInfo.userId = sessionInfo.userId;
            _sessionInfo.state = sessionInfo.state;

            //Call to initialize token timing
            this.refreshToken();

            this.getUserInfo().then(function (data) {
                console.log(data);
                _sessionInfo.name = data.firstName;
                _sessionInfo.mail = data.email;
                _sessionInfo.companyName = data.companyName;
                _sessionInfo.country = data.country;
                _sessionInfo.preferredLanguage = data.preferredLanguage;
                _sessionInfo.authenticated = true;
                _sessionInfo.socialIdentities = data.socialIdentities;
                _sessionInfo.uniqueUserId = data.id;
                if (_sessionInfo.socialIdentities !== undefined &&
                    _sessionInfo.socialIdentities[0] !== undefined &&
                    _sessionInfo.socialIdentities[0].userPictureUrl !== undefined) {
                    _sessionInfo.userImage = _sessionInfo.socialIdentities[0].userPictureUrl;
                }

                deferred.resolve(_sessionInfo);


            }, function (err) {

                _sessionInfo.authenticated = false;
                deferred.reject(err);
                if (!noDisconnect) {
                    service.logout();
                }
            });
        }
        return deferred.promise;
    };

    /**
     * @description Get user info of authenticated users using sessionInfo
     * @return {Promise.<{String firstName}>} the promise that will contain the user information
     */
    service.getUserInfo = function () {
        var deferred = $q.defer();

        if (_sessionInfo !== undefined && _sessionInfo.userId !== undefined) {
            apiHelper.get(apiConstants.serviceUrl, {'urlId': 'loginApiUrl'}).then(
                function (url) {

                    service.authenticationUrl = url + apiConstants.loginApiUserInfo;

                    apiHelper.get(service.authenticationUrl, {}, [
                        {'name': 'Authorization', 'value': _sessionInfo.userId}
                    ]).then(
                        function (userInfo) {
                            deferred.resolve(userInfo);
                        },
                        function (errUserInfo) {
                            deferred.reject(errUserInfo);
                        });
                },
                function (errServiceUrl) {
                    deferred.reject(errServiceUrl);
                });
        }
        else {
            deferred.reject('User not logged');
        }

        return deferred.promise;
    };


    service.disableRefreshToken = function () {
        disabledRefreshToken = true;
    };

    var refreshing = false;
    service.refreshToken = function () {

        var that = this;

        return;
        if (disabledRefreshToken) {
            return;
        }

        if (!refreshing) {
            refreshing = true;

            apiHelper.get(apiConstants.refreshToken, {}).then(
                function (refreshData) {
                    console.log('call to ' + apiConstants.refreshToken + ' gives');
                    console.log(refreshData);
                    _sessionInfo.userId = refreshData.accessToken;
                    //TODO AJUST EXPRESSION ONCE PACE RELEASED THE GOOD expiresIn seconds
                    that.sessionExpireDate = new Date((new Date().getTime() + refreshData.expiresIn * 1000));

                    var timeoutSession = refreshData.expiresIn;
                    if (timeoutSession > 10 * 60) {
                        timeoutSession -= 5 * 60;
                    }

                    that.sessionExpireTime = timeoutSession;
                    $rootScope.$broadcast('loginService.sessionExpireTimeChanged');
                    refreshing = false;
                },
                function (errUserInfo) {
                    console.log(errUserInfo);
                    refreshing = false;
                });
        }
    };

    service.sessionExpirationDate = function () {
        return this.sessionExpireDate;
    };


    /**
     * @description Logout current user
     */
    service.logout = function () {
        if (adminService.developerMode()) {

            expireActiveCookies('SSO_QUICKQUOTATION');
        }
        else {
            expireActiveCookies('SSO_QUICKQUOTATION');
            $window.location.href = $location.protocol() + '://' + $location.host() + apiConstants.baseUri + apiConstants.logoutApiUser;
        }

    };

    /**
     * @description Cookie remover
     * @param {String} name
     * @param {String[]} paths
     */
    function expireAllCookies(name, paths) {
        var expires = new Date(0).toUTCString();

        // expire null-path cookies as well
        document.cookie = name + '=; expires=' + expires;

        for (var i = 0, l = paths.length; i < l; i++) {
            document.cookie = name + '=; path=' + paths[i] + '; expires=' + expires;
        }
    }

    /**
     *
     * @param {String} name
     */
    function expireActiveCookies(name) {
        var pathname = location.pathname.replace(/\/$/, ''),
            segments = pathname.split('/'),
            paths = [];

        for (var i = 0, l = segments.length, path; i < l; i++) {
            path = segments.slice(0, i + 1).join('/');

            // as file
            paths.push(path);

            // as directory
            paths.push(path + '/');
        }

        expireAllCookies(name, paths);
    }

    return service;
})
;