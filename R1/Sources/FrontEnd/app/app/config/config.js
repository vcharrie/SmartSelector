'use strict';

// Configure toastr
angular.module('app').config(function () {
  toastr.options.timeOut = 3000;
  toastr.options.positionClass = 'toast-bottom-right';
});

// Configure logging
angular.module('app').config(function ($logProvider) {
  // turn debugging off/on (no info or warn)
  if ($logProvider.debugEnabled) {
    $logProvider.debugEnabled(true);
  }
});


angular.module('app').config(function($provide) {
    $provide.decorator('$exceptionHandler', ['$delegate', '$injector', function($delegate, $injector) {
        return function(exception, cause) {
            var adminService = $injector.get('adminService');
            var dialogService = $injector.get('dialogService');

            if ( window.console && window.console.log ) {
                console.error(exception);
            }

            $delegate(exception, cause);

            if (adminService.developerMode()) {
                console.error(exception);
            } else {
                dialogService.showErrorDialog('fatal-error-application-need-reload');
            }
        };
    }]);
});

// When refresh pages, route to the start page of the application (DO NOT REMOVE the unused $route dependency or it will not work!)
angular.module('app').run(function($location, $route) {

});

// Set blob image in the sanitizer white list (used to display 3d viewer generated pictures)
angular.module('app').config( ['$compileProvider', function($compileProvider) {
    $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|file|blob):|data:image\//);
}]);
