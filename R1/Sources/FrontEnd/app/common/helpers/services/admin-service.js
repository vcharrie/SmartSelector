'use strict';


/**
 * @class angular_module.business.adminService
 */
angular.module('helpers').service('adminService', ['$rootScope', 'SUDO_MODE_ENABLED', 'logger', function($rootScope, SUDO_MODE_ENABLED, logger) {
    var service = {
        /**
         * @type {boolean}
         */
        isAdmin: false,
        /**
         * @type {boolean}
         */
        isDeveloper: false,
        /**
         * @type {boolean}
         */
        isSudo: false,
        /**
         * @type {String}
         */
        locale: 'en-US',
        /**
         *
         * @param {boolean} isAdmin
         */
        setAdminMode: function(isAdmin) {
            service.isAdmin = isAdmin;
            $rootScope.$broadcast('service.adminMode.changed', service.isAdmin);
        },
        /**
         *
         * @returns {boolean}
         */
        adminMode: function() {
            return service.isAdmin;
        },
        /**
         *
         * @param {boolean} isDeveloper
         */
        setDeveloperMode: function(isDeveloper) {
            service.isDeveloper = isDeveloper;
            logger.developerMode = service.isDeveloper;
            $rootScope.$broadcast('service.developerMode.changed', service.isDeveloper);
        },
        /**
         *
         * @returns {boolean}
         */
        developerMode: function() {
            return service.isDeveloper;
        },
        /**
         *
         * @param {String} locale
         */
        setLocale: function(locale) {
            service.locale = locale;
            $rootScope.$broadcast('languageChanged');
        },
        /**
         *
         * @returns {String}
         */
        getLocale: function() {
            return service.locale;
        },

        isMobile: {
            /**
             * @returns {boolean}
             */
            Android: function() {
                return navigator.userAgent.match(/Android/i);
            },
            /**
             * @returns {boolean}
             */
            BlackBerry: function() {
                return navigator.userAgent.match(/BlackBerry/i);
            },
            /**
             * @returns {boolean}
             */
            iOS: function() {
                return navigator.userAgent.match(/iPhone|iPad|iPod/i);
            },
            /**
             * @returns {boolean}
             */
            Opera: function() {
                return navigator.userAgent.match(/Opera Mini/i);
            },
            /**
             * @returns {boolean}
             */
            Windows: function() {
                return navigator.userAgent.match(/IEMobile/i);
            },
            /**
             * @returns {boolean}
             */
            any: function() {
                return (service.isMobile.Android() || service.isMobile.BlackBerry() || service.isMobile.iOS() || service.isMobile.Opera() || service.isMobile.Windows());
            }
        }
    };

    service.setDeveloperMode((document.URL.indexOf('localhost') > -1) || (SUDO_MODE_ENABLED || (document.URL.indexOf('127.0.0.1') > -1)));
    service.isSudo = SUDO_MODE_ENABLED;

    return service;
}]);