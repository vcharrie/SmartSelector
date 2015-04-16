'use strict';

angular.module('app', [
    'templates-main',
    'htmlTemplates',
    'shell',
    'home',
    'enclosure',
    'projectContext',
    'switchboardContent',
    'switchboardOrganisation',
    'productConfiguration',
    'bom',
    'basket',
    'tracking',
    'removedProducts',
    'familyDiscountEditorDirective',
    'smartPanelWizzard',
    'blmWebSDKDirective',
    'priceListManager',
    'bomUi'
]);

angular.module('app').value('baseUrl','');
angular.module('app').value('token','');

angular
    .module('app.sudo', [])
    .constant('SUDO_MODE_ENABLED', false);