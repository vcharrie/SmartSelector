// Karma configuration
// http://karma-runner.github.io/0.10/config/configuration-file.html
'use strict';

module.exports = function(config) {
    config.set({
        // base path, that will be used to resolve files and exclude
        basePath: '',

        plugins: [
            'karma-junit-reporter',
            'karma-jasmine',
            'karma-chrome-launcher',
            'karma-phantomjs-launcher',
            'karma-coverage',
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
            'app/dependencies/angular/angular.js',
            'app/dependencies/angular-mocks/angular-mocks.js',
            'app/dependencies/angular-resource/angular-resource.js',
            'app/dependencies/angular-cookies/angular-cookies.js',
            'app/dependencies/angular-sanitize/angular-sanitize.js',
            'app/dependencies/angular-route/angular-route.js',
            'app/dependencies/jquery/jquery.js',
            'app/dependencies/bootstrap/dist/js/bootstrap.js',
            'app/dependencies/angular-translate/angular-translate.js',
            'app/dependencies/angular-translate-loader-static-files/angular-translate-loader-static-files.js',
            'app/dependencies/toastr/toastr.js',
            'app/dependencies/angular-bootstrap/ui-bootstrap.js',
            'app/dependencies/underscore/underscore.js',
            
            'app/common/**/*-module.js',
            'app/common/**/!(*.test).js',          
            
            'app/modules/**/!(*.test).js',
            'app/common/**/*.test.js',
            'app/modules/**/*.test.js'       
        ],

        preprocessors: {
            'app/app/**/!(*.test).js': 'coverage',
            'app/common/**/!(*.test).js': 'coverage',
            'app/modules/**/!(*.test).js': 'coverage'
        },

        // list of files / patterns to exclude
        exclude: [
        'app/modules/shell/**',
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
        browsers: ['PhantomJS'],

        reporters: ['progress', 'html', 'junit', 'coverage'],

        coverageReporter: {
            type: 'text-summary',
            dir: 'test/coverage_text',
            file: '../../coverage.txt'
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
        singleRun: false
    });
};
