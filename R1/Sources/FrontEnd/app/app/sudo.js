'use strict';

angular.module('sudo', ['app',
    // other Angular modules
    'ngAnimate',
    'ngRoute',
    'ngSanitize',
    'ngResource',
    // 3rd Party Modules
    'ui.bootstrap',
    'gettext',
    'base64',
    'angularFileUpload',
    // App modules
    'templates-main',
    'app.sudo',
    'shell',
    'admin',
    'shared',
    'theme',
    'home',
    'enclosure',
    'projectContext',
    'switchboardContent',
    'switchboardOrganisation',
    'productConfiguration',
    'bom',
    'basket',
    'tracking',
    'familyDiscountEditorDirective',
    'smartPanelWizzard',
    'priceListManager'
]);

angular
    .module('app.sudo', [])
    .constant('SUDO_MODE_ENABLED', true);