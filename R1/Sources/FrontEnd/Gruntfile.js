'use strict';

module.exports = function (grunt) {



    // Load grunt tasks automatically
    require('load-grunt-tasks')(grunt);

    // Time how long tasks take. Can help when optimizing build times
    require('time-grunt')(grunt);

    // Get the build info to replace it in the concerned file.
    var DEFAULT_BUILD_INFO = 'DEV';
    var buildInfo = grunt.option('buildInfo') || DEFAULT_BUILD_INFO;

    grunt.loadNpmTasks('grunt-string-replace');
    grunt.loadNpmTasks('grunt-contrib-compress');
    //grunt.loadNpmTasks('grunt-karma-sonar');
    grunt.loadNpmTasks('grunt-http');
    grunt.loadNpmTasks('grunt-shell-spawn');
    grunt.loadNpmTasks('grunt-html2js');
    grunt.loadNpmTasks('grunt-angular-gettext');


    // Project settings
    var projectSettings = {
        // Project paths
        app: 'app',
        deps: 'app/dependencies',
        bower_deps: 'app/dependencies/bower_dependencies',
        dist: 'dist',
        tmp: '.tmp',
        tests: 'test',

        // Dist folders
        images: 'images',
        fonts: 'fonts',
        js: 'js',
        css: 'css',

        // JS files
        jsFiles: [
            '<%= project.app %>/app/**/*!(.test).js',
            '<%= project.app %>/common/**/*!(.test).js',
            '<%= project.app %>/modules/**/*!(.test).js'
        ],

        // Less files
        lessFiles: [
            '<%= project.app %>/app/*.less',
            '<%= project.app %>/modules/**/*.less',
            '<%= project.app %>/common/**/*.less',
            '<%= project.app %>/common/**/**/*.less'
        ],

        // Images files
        imagesFiles: [
            '<%= project.app %>/images/**/*.{png,jpg,jpeg,gif,webp,svg}'
        ],
        // Images files
        imagesFilesWithoutSvg: [
            'images/**/*.{png,jpg,jpeg,gif,webp}'
        ],
        // Fonts
        fontFiles: [
            '<%= project.bower_deps %>/font-awesome/fonts/*',
            '<%= project.bower_deps %>/bootstrap/dist/fonts/*',
            '<%= project.app %>/fonts/*'
        ],

        // Localizations
        localizationFiles: [
            'app/resources/localizations/*'
        ],

        // Config
        configFiles: [
            'common/**/config.json',
            'app/resources/**/*.json'
        ],

        // Unit+E2E tests
        testFiles: [
            '<%= project.app %>/app/**/*.test.js',
            '<%= project.app %>/common/**/*.test.js',
            '<%= project.app %>/modules/**/*.test.js',
            '<%= project.tests %>/**/*.test.js'
        ],

        // Dependencies exclusion (for index.html inject)
        excludeDeps: [
            'bootstrap.css'
        ]
    };

    // Define the configuration for all the tasks
    grunt.initConfig({
        // Expose project settings
        project: projectSettings,

        //Close started node sever
        http: {
            stopServerForTest: {
                options: {
                    url: 'http://127.0.0.1:9999/stopServer'
                }
            }
        },

        //call node server on 9999 port to serve json files for tests...
        shell: {
            startServerForTest: {
                options: {
                    async: true,
                    stdout: false,
                    failOnError: false
                },
                command: [
                    'set PORT=9999',
                    'node server'
                ].join('&&')
            }
        },

        // Watches files for changes and runs tasks based on the changed files
        watch: {
            js: {
                files: projectSettings.jsFiles,
                tasks: ['newer:jshint:all'],
                options: {
                    livereload: true
                }
            },
            jsTest: {
                files: projectSettings.testFiles
                //tasks: ['newer:jshint:test', 'karma']
            },
            less: {
                files: projectSettings.lessFiles,
                tasks: ['less', 'usemin']
            },
            gruntfile: {
                files: ['Gruntfile.js']
            },
            livereload: {
                options: {
                    livereload: '<%= connect.options.livereload %>'
                },
                files: [
                    '<%= project.app %>/**/*.html',
                    '<%= project.tmp %>/<%= project.css %>/*.css',
                    '<%= project.app %>/<%= project.images %>/**/*.{png,jpg,jpeg,gif,webp,svg}'
                ]
            }
        },

        // The actual grunt server settings

        open: {
            server: {
                url: 'http://localhost:8080/#'
            }
        },

        connect: {
            options: {
                port: 8000,
                hostname: 'localhost',
                livereload: 35729
            },

            proxies: [
                {
                    context: '/quickquotation/rest',
                    host: 'localhost',
                    port: 8080,
                    https: false,
                    changeOrigin: true,
                    xforward: false
                }
            ],
            livereload: {
                options: {
                    open: false,
                    base: [
                        '<%= project.tmp %>',
                        '<%= project.app %>'
                    ],
                    middleware: function (connect, options) {
                        if (!Array.isArray(options.base)) {
                            options.base = [options.base];
                        }

                        // Setup the proxy
                        var middlewares = [require('grunt-connect-proxy/lib/utils').proxyRequest];

                        // Serve static files.
                        options.base.forEach(function (base) {
                            middlewares.push(connect.static(base));
                        });

                        // Make directory browse-able.
                        var directory = options.directory || options.base[options.base.length - 1];
                        middlewares.push(connect.directory(directory));

                        return middlewares;
                    }
                }
            },
            test: {
                options: {
                    port: 9001,
                    base: [
                        '<%= project.tmp %>',
                        '<%= project.tests %>',
                        '<%= project.app %>'
                    ]
                }
            },
            dist: {
                options: {
                    base: '<%= project.dist %>'
                }
            }
        },

        // Make sure code styles are up to par and there are no obvious mistakes
        jshint: {
            options: {
                jshintrc: '.jshintrc',
                reporter: require('jshint-stylish'),
                ignores: ['app/app/config/config.js', '**/*.test.js', 'test/**/*.js', 'app/common/tracking/**/*.js', 'app/modules/home/coverage/**/*.js',
                    'app/modules/shared/edit-profile/edit-profile.js',
                    'app/modules/shared/edit-profile/profileService.js',
                    'app/modules/shared/edit-profile/web-ui-commons/src/*.js',
                    'app/modules/shared/edit-profile/web-ui-commons/locales/*.js',
                    'app/modules/shared/edit-profile/angular-gettext/angular-gettext.js']
            },
            all: [
                //'Gruntfile.js',
                //'<%= project.app %>/scripts/{,*/}*.js',
                //'test/**/*.js',
                'app/modules/**/*.js',
                'app/common/**/*.js'
            ],
            test: {
                options: {
                    jshintrc: 'test/.jshintrc'
                },
                src: ['test/spec/{,*/}*.js', 'test/**/*.js']
            }
        },

        // Empties folders to start fresh
        clean: {
            dist: {
                files: [
                    {
                        dot: true,
                        src: [
                            '.tmp',
                            '<%= project.dist %>/*',
                            '!<%= project.dist %>/.git*'
                        ]
                    }
                ]
            },
            server: '.tmp'
        },

        // Automatically inject Bower components into the app
        'bower-install': {
            app: {
                html: '<%= project.app %>/index.html',
                ignorePath: '<%= project.app %>/',
                exclude: projectSettings.excludeDeps
            }
        },

        // Renames files for browser caching purposes
        rev: {
            dist: {
                files: {
                    src: [
                        '<%= project.dist %>/<%= project.js %>/*.js',
                        '<%= project.dist %>/<%= project.css %>/*.css',
                        //pictures renaming is desactivated for browser caching purposes,
                        //because it would not be compatible with images declared in json files (rangeItems.json in app/resources/business/services)
                        //'<%= project.dist %>/<%= project.images %>/**/*.{png,jpg,jpeg,gif,webp,svg}',
                        '<%= project.dist %>/<%= project.fonts %>/*'
                    ]
                }
            }
        },

        less: {
            dist: {
                options: {
                    strictImports: true,
                    relativeUrls: false,
                    sourceMap: true,
                    sourceMapFilename: '<%= project.tmp %>/<%= project.css %>/app.css.map',
                    sourceMapURL: 'app.css.map'
                },
                files: {
                    '<%= project.tmp %>/<%= project.css %>/app.css': '<%= project.app %>/app/app.less'
                }
            }
        },

        compress: {
            dist: {
                options: {
                    archive: './FrontEnd.zip',
                    mode: 'zip'
                },
                files: [
                    {src: './dist/**', dest: './deploy/'},
                    // adding express dep
                    {src: './node_modules/express/**', dest: './deploy/'},
                    {src: './Server.js', dest: './deploy/'},
                    {src: './deploy/exec.bat', dest: '.'},
                    {src: './deploy/package.json', dest: '.'}
                ]
            },
            distLinux: {
                options: {
                    archive: './FrontEndLinux.zip',
                    mode: 'zip'
                },
                files: [
                    {src: './dist/**', dest: './'},
                    {src: './deploy.sh', dest: './'}
                ]
            }
        },
        // Reads HTML for usemin blocks to enable smart builds that automatically
        // concat, minify and revision files. Creates configurations in memory so
        // additional tasks can operate on them
        useminPrepare: {
            html: ['<%= project.app %>/drawings.html','<%= project.app %>/index.html'],//*.html',
            options: {
                dest: '<%= project.dist %>'
            }
        },


        // Performs rewrites based on rev and the useminPrepare configuration
        usemin: {
            html: ['<%= project.dist %>/**/*.html'],
            css: ['<%= project.dist %>/<%= project.css %>/*.css', '<%= project.tmp %>/<%= project.css %>/*.css'],
            cssfonts: ['<%= project.dist %>/<%= project.css %>/*.css', '<%= project.tmp %>/<%= project.css %>/*.css'],
            options: {
                assetsDirs: ['<%= project.dist %>', '<%= project.dist %>/<%= project.fonts %>', '<%= project.dist %>/<%= project.images %>'],
                patterns: {
                    cssfonts: [
                        [/url\(['"]?(.*?fonts\/.*?)['"]?[\?#\)]/gm, 'update the CSS to reference revved fonts']
                    ]
                }
            }
        },

        // The following *-min tasks produce minified files in the dist folder
        imagemin: {
            dist: {
                files: [
                    {
                        expand: true,
                        cwd: '<%= project.app %>/<%= project.images %>',
                        src: '**/*.{png,jpg,jpeg,gif}',
                        dest: '<%= project.dist %>/<%= project.images %>'
                    }
                ]
            }
        },
        svgmin: {
            dist: {
                files: [
                    {
                        expand: true,
                        cwd: '<%= project.app %>/<%= project.images %>',
                        src: '**/*.svg',
                        dest: '<%= project.dist %>/<%= project.images %>'
                    }
                ]
            }
        },
        htmlmin: {
            dist: {
                options: {
                    collapseWhitespace: true,
                    collapseBooleanAttributes: true,
                    removeCommentsFromCDATA: true,
                    removeOptionalTags: false
                },
                files: [
                    {
                        expand: true,
                        cwd: '<%= project.dist %>',
                        src: ['drawings.html','index.html', 'modules/**/*.view.html'],
                        dest: '<%= project.dist %>'
                    }
                ]
            }
        },
        html2js: {
            options: {
                // custom options, see below
                htmlmin: {
                    collapseBooleanAttributes: true,
                    collapseWhitespace: true,
                    removeAttributeQuotes: true,
                    removeComments: true,
                    removeEmptyAttributes: true,
                    removeRedundantAttributes: true,
                    removeScriptTypeAttributes: true,
                    removeStyleLinkTypeAttributes: true
                }, base: '../FrontEnd/app/'
            },
            main: {
                src: ['<%= project.app %>/modules/**/*.view.html', '<%= project.app %>/common/**/*.view.html', '<%= project.app %>/modules/shared/edit-profile/template/*.html', '<%= project.app %>/dependencies/viewer3d/template/*.html', '<%= project.app %>/dependencies/BLMWebSDK/template/*.html'],
                dest: '<%= project.app %>/app/templates/templates.js'
            }
        },

        // Allow the use of non-minsafe AngularJS files. Automatically makes it
        // minsafe compatible so Uglify does not destroy the ng references
        ngmin: {
            dist: {
                files: [
                    {
                        expand: true,
                        cwd: '<%= project.tmp %>/concat/<%= project.js %>',
                        src: '*.js',
                        dest: '<%= project.tmp %>/concat/<%= project.js %>'
                    }
                ]
            }
        },

        // Copies remaining files to places other tasks can use
        copy: {
            dist: {
                files: [
                    {
                        expand: true,
                        dot: true,
                        cwd: '<%= project.app %>',
                        dest: '<%= project.dist %>',
                        src: [
                            '*.{ico,png,txt}',
                            '.htaccess',
                            'drawings.html','index.html',//'*.html',
                            //'modules/**/*.view.html',
                            //'common/**/*.view.html',
                            '<%= project.deps %>/**/*',
                            '<%= project.images %>/**/*.{webp}',
                            '<%= project.fonts %>/*',
                            'images/**/*.{png,jpg,jpeg,gif,webp}'
                        ]
                    },
                    {
                        expand: true,
                        cwd: '<%= project.tmp %>/<%= project.images %>',
                        dest: '<%= project.dist %>/<%= project.images %>',
                        src: ['generated/*']
                    },
                    {
                        expand: true,
                        dot: true,
                        flatten: true,
                        src: projectSettings.fontFiles,
                        dest: '<%= project.dist %>/<%= project.fonts %>'
                    },
                    {
                        expand: true,
                        cwd: '<%= project.app %>',
                        src: projectSettings.localizationFiles,
                        dest: '<%= project.dist %>'
                    },
                    {
                        expand: true,
                        cwd: '<%= project.app %>',
                        src: projectSettings.configFiles,
                        dest: '<%= project.dist %>'
                    }
                ]
            },
            serve: {
                files: [
                    {
                        expand: true,
                        dot: true,
                        cwd: '<%= project.dist %>',
                        dest: '<%= project.tmp %>',
                        src: [
                            '<%= project.images %>/**/*',
                            '<%= project.fonts %>/*'
                        ]
                    },
                    {
                        expand: true,
                        dot: true,
                        flatten: true,
                        src: projectSettings.fontFiles,
                        dest: '<%= project.tmp %>/<%= project.fonts %>'
                    }
                ]
            },
            saveTemplate: {
                files: [
                    {
                        expand: true,
                        dot: true,
                        dest: '<%= project.tmp %>',
                        src: ['<%= project.app %>/app/templates/templates.js']
                    }
                ]
            },
            restoreTemplate: {
                files: [
                    {
                        expand: false,
                        dot: true,
                        dest: '<%= project.app %>/app/templates/templates.js',
                        src: ['<%= project.tmp %>/app/app/templates/templates.js']
                    }
                ]
            }
        },

        // Run some tasks in parallel to speed up the build process
        concurrent: {
            serve: [
                'less'
            ],
            test: [
                'less'
            ],
            dist: [
                'less',
                //'imagemin',
                'svgmin'
            ],
            options: {
                limit: 2, //For ci serveur that has no more 2 concurrent thread avaiable
                logConcurrentOutput: true
            }
        },

        // By default, your `index.html`'s <!-- Usemin block --> will take care of
        // minification. These next options are pre-configured if you do not wish
        // to use the Usemin blocks.
        // cssmin: {
        //   dist: {
        //     files: {
        //       '<%= project.dist %>/styles/main.css': [
        //         '.tmp/styles/{,*/}*.css',
        //         '<%= project.app %>/styles/{,*/}*.css'
        //       ]
        //     }
        //   }
        // },
        // uglify: {
        //   dist: {
        //     files: {
        //       '<%= project.dist %>/scripts/scripts.js': [
        //         '<%= project.dist %>/scripts/scripts.js'
        //       ]
        //     }
        //   }
        // },
        // concat: {
        //   dist: {}
        // },

        // Test settings
        karma: {
            unit: {
                configFile: 'karma.conf.js',
                singleRun: true,
                autoWatch: false
            },
            server: {
                configFile: 'karma.conf.js',
                singleRun: false,
                autoWatch: true
            },
            unitAsText: {
                configFile: 'karma.text.conf.js',
                singleRun: true,
                autoWatch: false
            }
        },

        //karma_sonar: {
        //    default_options: {
        //        project: {
        //            key: 'grunt-sonar',
        //            name: 'Grunt sonar plugin',
        //            version: '0.1.1'
        //        },
        //        sources: [
        //        {
        //            path: 'app/modules/**/*.test.js',
        //            prefix: 'app/modules',
        //            coverageReport: 'test/target/surefire-reports/karma_sonar/lcov.info',
        //            testReport: 'test/target/surefire-reports/karma_sonar/junit.xml'
        //        }],
        //        exclusions: []
        //    }
        //},
        nggettext_extract: {
            pot: {
                files: {
                    'po/template.pot': ['**/*.html']
                }
            }
        },
        nggettext_compile: {
            all: {
                files: {
                    'app/translate/translations.js': ['../../Documents/Data/Global/Translates/*.po']
                }
            }
        },

        'optionT': {},


        'string-replace': {
            dist: {
                files: {
                    '<%= project.tmp %>/concat/js/app.js': '<%= project.tmp %>/concat/js/app.js'
                    //'<%= project.tmp %>/concat/js/sudo.js': '<%= project.tmp %>/concat/js/sudo.js'
                },
                options: {
                    replacements: [
                        {
                            pattern: '{grunt.buildInfo}',
                            replacement: function () {
                                if (buildInfo === DEFAULT_BUILD_INFO) {
                                    var now = new Date();
                                    var yyyy = now.getFullYear();
                                    var mm = now.getMonth() + 1;
                                    var dd = now.getDate();
                                    var hh = now.getHours();
                                    var ii = now.getMinutes();
                                    return yyyy + '.' + mm + '.' + dd + '-' + hh + '' + ii;
                                } else {
                                    return buildInfo;
                                }
                            }
                        },
                        {
                            pattern: '\'baseUri\': \'\',',
                            replacement: function () {
                                console.log(grunt.option('baseUrl'));
                                if (grunt.option('baseUrl') !== undefined && grunt.option('baseUrl') !== 0) {
                                    console.log('update baseUrl with ' + grunt.option('baseUrl'));
                                    return '\'baseUri\': \'' + grunt.option('baseUrl') + '\',';
                                }
                                else {
                                    console.log('No update of baseUrl');
                                    return '\'baseUri\': \'\',';
                                }
                            }
                        }

                    ]
                }
            }
        }
    });


    grunt.registerTask('serve', function (target) {
        if (target === 'dist') {
            return grunt.task.run(['build', 'connect:dist:keepalive']);
        }

        grunt.task.run([
            //'shell:tempClean',
            'nggettext_compile',
            'clean:server',
            'copy:serve',
            'concurrent:serve',
            'usemin',
            'configureProxies:server',
            'connect:livereload',
            'open',
            'watch'
        ]);
    });

    grunt.registerTask('server', function () {
        grunt.log.warn('The `server` task has been deprecated. Use `grunt serve` to start a server.');
        grunt.task.run(['serve']);
    });

    grunt.registerTask('test', [
        //'shell',
        'clean:server',
        'concurrent:test',
        'connect:test',
        'shell:startServerForTest',
        'karma:unit',
        'http:stopServerForTest'
    ]);

    grunt.registerTask('test-continuous', [
        //'shell',
        'clean:server',
        'concurrent:test',
        'connect:test',
        'shell:startServerForTest',
        'karma:server',
        'http:stopServerForTest'
    ]);
    grunt.registerTask('test-integration', [
        //'shell',
        'clean:server',
        'concurrent:test',
        'connect:test',
        'shell:startServerForTest',
        'karma:unitAsText',
        'http:stopServerForTest'
    ]);


    grunt.registerTask('build', [

        'clean:dist',
        'copy:saveTemplate',
        'nggettext_compile',
        //'htmlmin',
        'html2js',
        'useminPrepare',
        'concurrent:dist',
        'concat',
        'ngmin',
        'copy:dist',
        'cssmin',
        'string-replace:dist',
        'uglify',
        'rev',
        'usemin',
        'copy:restoreTemplate'

    ]);

    grunt.registerTask('optionTest', [
        'clean:dist',
        'copy:saveTemplate',
        //'htmlmin',
        'html2js',
        'copy:restoreTemplate'

    ]);

    grunt.registerTask('compDist', [
        'compress:dist'
    ]);

    grunt.registerTask('compDistLinux', [
        'compress:distLinux'
    ]);

    grunt.registerTask('bower', [
        'bower-install'
    ]);

    grunt.registerTask('default', [
        'newer:jshint',
        'test',
        'build'
    ]);
    grunt.registerTask('startServerForTest', [
        'shell:startServerForTest'
    ]);

};
