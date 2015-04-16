'use strict';

angular
    .module('app', [
        'ngRoute',
        'gettext',
        'directives',
        'templates-main',
        'business',
        'dialog',
        'viewer3d',
        'drawing.service',
        'drawing'
    ]);

angular
    .module('app.sudo', [])
    .constant('SUDO_MODE_ENABLED', false);