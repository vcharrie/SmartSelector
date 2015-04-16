// Karma configuration
// http://karma-runner.github.io/0.10/config/configuration-file.html
'use strict';

module.exports = function (config) {
  config.set({
    // base path, that will be used to resolve files and exclude
    basePath: '',

    plugins: [
      'karma-jasmine',
      'karma-chrome-launcher',
      'karma-html-reporter'
    ],

    // testing framework to use (jasmine/mocha/qunit/...)
    frameworks: ['jasmine'],

    //Proxies json
    proxies: {
            '/common/tracking/config/config.json': 'http://localhost:9999/common/tracking/config/config.json',
            '/app/resources/business/rangeItems.json': 'http://localhost:9999/app/resources/business/rangeItems.json',
            '/app/resources/business/context-characteristics.json': 'http://localhost:9999/app/resources/business/context-characteristics.json'
        },

    // list of files / patterns to load in the browser
    files: [
        'app/dependencies/bower_dependencies/angular/angular.js',
        'app/dependencies/bower_dependencies/angular-gettext/dist/angular-gettext.js',
        'app/dependencies/bower_dependencies/angular-mocks/angular-mocks.js',
        'app/dependencies/bower_dependencies/angular-resource/angular-resource.js',
        'app/dependencies/bower_dependencies/angular-cookies/angular-cookies.js',
        'app/dependencies/bower_dependencies/angular-sanitize/angular-sanitize.js',
        'app/dependencies/bower_dependencies/angular-animate/angular-animate.js',
        'app/dependencies/bower_dependencies/angular-route/angular-route.js',
        'app/dependencies/bower_dependencies/jquery/jquery.js',
        'app/dependencies/bower_dependencies/bootstrap/dist/js/bootstrap.js',
        'app/dependencies/bower_dependencies/angular-translate/angular-translate.js',
        'app/dependencies/bower_dependencies/angular-translate-loader-static-files/angular-translate-loader-static-files.js',
        'app/dependencies/bower_dependencies/toastr/toastr.js',
        'app/dependencies/bower_dependencies/angular-bootstrap/ui-bootstrap.js',
        'app/dependencies/bower_dependencies/underscore/underscore.js',
        'app/dependencies/bower_dependencies/angular-local-storage/angular-local-storage.min.js',
        'app/dependencies/bower_dependencies/three.js/three.min.js',
        'app/dependencies/bower_dependencies/ng-file-upload/angular-file-upload.min.js',

        'app/app/app.js',

        'app/common/**/*-module.js',
        'app/common/dialog/services/dialog-service.js',
        'app/common/**/!(*.test).js',

        'app/modules/**/*-module.js',
        'app/modules/**/!(*.test).js',

        'app/common/**/*.test.js',
        'app/modules/**/*.test.js'
    ],

    // list of files / patterns to exclude
    exclude: [
        'app/modules/db-creator-api/**'],

    // web server port
    port: 9200,

    // level of logging
    // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,


    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera
    // - Safari (only Mac)
    // - PhantomJS
    // - IE (only Windows)
    browsers: ['Chrome'],

    reporters: ['progress', 'html'],

    htmlReporter: {
      outputFile: 'units.html'
    },

    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: false
  });
};
