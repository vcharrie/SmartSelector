'use strict';

/**
 * @class angular_module.business.translationService
 */
angular.module('business').service('translationService', function ($q, gettextCatalog, Part, $rootScope) {


    /*
     * Service public interface
     */
    var service = {
        /**
         * @type {String}
         */
        locale: null,
        /**
         * @type {String}
         */
        lang: null,
        /**
         * @type {String}
         */
        languageChangingEventName : 'Language changing'
    };

    // Define all public methods

    service.getLocale = function () {
        return service.locale;
    };

    service.setLocale = function (lang) {

        service.lang = lang;
        service.locale = lang.locale;


        console.log(service.lang.authenticationLangKey);
        gettextCatalog.setCurrentLanguage(service.lang.authenticationLangKey);
        // update info

        $rootScope.$emit(service.languageChangingEventName,service.locale);
    };

    return service;
});
