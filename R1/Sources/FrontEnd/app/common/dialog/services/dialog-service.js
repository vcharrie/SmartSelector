'use strict';

/**
  * dialogService : Provides APIs to show modal dialog
  */
angular
    .module('dialog', ['ui.bootstrap', 'gettext'])
    .service('dialogService', function ($modal, gettextCatalog) {
        /*
         * Service public interface
         */
        var service = {
        };

        /*
         * @param {String} message
         */
        service.showWarning = function (messages) {
            return $modal.open({
                templateUrl: 'common/dialog/services/warningDialog.view.html',
                controller: 'warningDialogController',
                backdrop : 'static',
                keyboard: false,
                resolve: {
                    messages: function () { return messages; }
                }
            });
        };

        /*
         * @param {String} title
         * @param {String} message
         * @param {String} labelChoice1
         * @param {String} labelChoice2
         * @param {Boolean} disableChoice1 : disable labelChoice1 button
         * @param {Boolean} disableChoice2 : disable labelChoice2 button
         * @returns {String} depends on user choice : if choice1, returns labelChoice1, if choice 2, returns labelChoice2, if cancel, returns ''
         */
        service.showChoicesDialog= function (title, message, labelChoice1, labelChoice2, disableChoice1, disableChoice2) {
            return $modal.open({
                templateUrl: 'common/dialog/services/choicesDialog.view.html',
                controller: 'choicesDialogController',
                backdrop : 'static',
                keyboard: false,
                resolve: {
                    title: function () { return title; },
                    message: function () { return message; },
                    labelChoice1: function () { return labelChoice1; },
                    labelChoice2: function () { return labelChoice2; },
                    disableChoice1: function () { return disableChoice1; },
                    disableChoice2: function () { return disableChoice2; }
                }
            });
        };

        /*
         * @param {String} title
         * @param {String} message
         * @returns {String} depends on user choice : if ok, returns 'ok', if cancel, returns ''
         */
        service.showActionDialog= function (message) {
            return $modal.open({
                templateUrl: 'common/dialog/services/actionDialog.view.html',
                controller: 'actionDialogController',
                backdrop : 'static',
                keyboard: false,
                resolve: {
                    message: function () { return message; }
                }
            });
        };

        /*
         * @param {String} message
         */
        service.showYesNoDialog= function (message) {
            return $modal.open({
                templateUrl: 'common/dialog/services/yesNoDialog.view.html',
                controller: 'yesNoDialogController',
                backdrop : 'static',
                keyboard: false,
                resolve: {
                    message: function () { return message; }
                }
            });
        };

        /*
         * @param {String} message
         */
        service.showErrorDialog = function (message) {
            return $modal.open({
                templateUrl: 'common/dialog/services/errorDialog.view.html',
                controller: 'errorDialogController',
                backdrop : 'static',
                keyboard: false,
                resolve: {
                    message: function() { return message; },
                    reloadApplication: function() { return true; }
                }
            });
        };

        /*
         * @param {String} titleKey
         * @param {String} htmlKey
         */
        service.showHtmlContentDialog = function(titleKey, htmlKey) {
            return $modal.open({
                templateUrl: 'common/dialog/services/htmlDialog.view.html',
                controller: 'htmlDialogController',
                backdrop: 'static',
                keyboard: false,
                resolve: {
                    title: function () {
                        return titleKey;
                    },
                    html: function () {
                        return gettextCatalog.getString(htmlKey);
                    },
                    bottomExternalLink: function () {
                        return null;
                    },
                    reloadApplication: function () {
                        return false;
                    }
                }
            });
        };

        return service;
    });
