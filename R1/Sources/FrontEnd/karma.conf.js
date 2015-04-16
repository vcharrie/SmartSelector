// Karma configuration
// http://karma-runner.github.io/0.10/config/configuration-file.html
'use strict';

module.exports = function (config) {
    config.set({
        // base path, that will be used to resolve files and exclude
        basePath: '',

        plugins: [
            'karma-junit-reporter',
            'karma-jasmine',
            'karma-chrome-launcher',
            'karma-phantomjs-launcher',
            'karma-coverage',
            'karma-html-reporter',
            'karma-ng-html2js-preprocessor'
        ],

        // testing framework to use (jasmine/mocha/qunit/...)
        frameworks: ['jasmine'],

        //Proxies json
        proxies: {
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
            'app/dependencies/bower_dependencies/toastr/toastr.js',
            'app/dependencies/bower_dependencies/angular-bootstrap/ui-bootstrap.js',
            'app/dependencies/bower_dependencies/underscore/underscore.js',
            'app/dependencies/bower_dependencies/angular-local-storage/angular-local-storage.min.js',
            'app/dependencies/bower_dependencies/three.js/three.min.js',
            'app/dependencies/bower_dependencies/ng-file-upload/angular-file-upload.min.js',
            'app/dependencies/bower_dependencies/viewer3d/src/viewer3d-module.js',
            'app/dependencies/BLMWebSDK/blm-websdk.js',
            'app/dependencies/bower_dependencies/price-list-manager/dist/price-list-manager-all.js',
            'app/dependencies/bower_dependencies/angular-spinner/angular-spinner.min.js',
            'app/dependencies/bower_dependencies/family-discount-editor/dist/family-discount-editor-all.js',
            'app/dependencies/bower_dependencies/angular-base64/angular-base64.min.js',
            'app/dependencies/bower_dependencies/ngInfiniteScroll/build/ng-infinite-scroll.js',
            'app/dependencies/bower_dependencies/edit-profile/scripts/edit-profile.js',
            'app/dependencies/bower_dependencies/web-ui-commons/src/jobFunction.js',
            'app/dependencies/bower_dependencies/web-ui-commons/src/language-select.js',
            'app/dependencies/bower_dependencies/web-ui-commons/src/language.js',
            'app/dependencies/bower_dependencies/web-ui-commons/src/country-select.js',
            'app/dependencies/bower_dependencies/web-ui-commons/src/country.js',
            'app/dependencies/bower_dependencies/price-list-manager/dist/price-list-manager-all-min.js',
            'app/dependencies/bower_dependencies/family-discount-editor/dist/family-discount-editor-all-min.js',
            'app/dependencies/bower_dependencies/ngInfiniteScroll/build/ng-infinite-scroll.min.js',
            'app/dependencies/bower_dependencies/viewer3d/dist/viewer-3d_all_min.js',

            'app/app/app.js',

            'app/app/templates/*.js',

            'app/common/**/*-module.js',
			'app/common/dialog/services/dialog-service.js',
            'app/common/**/!(*.test).js',

            'app/modules/smart-panel-wizzard/smart-panel-wizzard.js',

            'app/modules/**/*-module.js',
            'app/modules/**/!(*.test).js',

            'app/common/**/*.test.js',
            'app/modules/**/*.test.js',

            'app/**/*.view.html'
        ],

        preprocessors: {
            'app/app/**/!(*.test).js': 'coverage',
            'app/common/**/!(*.test).js': 'coverage',
            'app/modules/**/!(*.test).js': 'coverage',
            // load template and put them in $templateCache so that they can be used from unit tests
            // see https://github.com/karma-runner/karma-ng-html2js-preprocessor
            'app/**/*.view.html': ['ng-html2js']
        },

        // list of files / patterns to exclude
        exclude: [
            'app/modules/db-creator-api/**'
        ],

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
        browsers: ['PhantomJS'],

        reporters: ['progress', 'html', 'junit', 'coverage'],

        coverageReporter: {
            type: 'html',
            dir: 'test/karma_html'
        },

        // the default configuration
        junitReporter: {
            outputFile: 'test/target/surefire-reports/test-results.xml',
            suite: ''
        },

        htmlReporter: {
            outputDir: 'karma_html',
            templatePath: 'karma_html/jasmine_template.html'
        },

        // Continuous Integration mode
        // if true, it capture browsers, run tests and exit
        singleRun: false,

        ngHtml2JsPreprocessor: {
            // If your build process changes the path to your templates,
            // use stripPrefix and prependPrefix to adjust it.
            stripPrefix: 'app/',
            //prependPrefix: "",

            // the name of the Angular module to create
            moduleName: 'app.templates'
        }
    });
};