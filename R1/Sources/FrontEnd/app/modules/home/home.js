'use strict';

/**
 * home controller
 */
angular.module('home', ['ngRoute', 'shared'])
    .config(function ($routeProvider) {
        $routeProvider.when('/',
            {
                controller: 'home',
                templateUrl: 'modules/home/home.view.html',
                resolve: {
                    'partInfoServiceRangeOrders': ['partInfoService', function (partInfoService) {
                        return partInfoService.loadRangePromise;
                    }]
                }
            });

        $routeProvider.otherwise({redirectTo: '/'});
    })
    .controller('home', function ($scope, $rootScope, gettextCatalog, $modal, $location, $sce, $routeParams, defaultValuesHistoricService, logger, projectEditionService, blmBrowserService, projectService, productPriceService, partInfoService, adminService, loginService, blmService, spimService, googleAnalyticsService, dialogService, Project) {

        $scope.marketingInformationHtml = $sce.trustAsHtml('home-marketing-information-text');
        $scope.homeActionsTooltip = '<div class="info-icon-tooltip" ><div class="info-icon-tooltip-label"><span>' + gettextCatalog.getString('home-actions-tooltip-1') + '</span><br><span>' + gettextCatalog.getString('home-actions-tooltip-2') + '</span><br><span>' + gettextCatalog.getString('home-actions-tooltip-3') + '</span><br><span>' + gettextCatalog.getString('home-actions-tooltip-4') + '</span></div></div>';

        //if authentication token has been set in url http://qq/#/?userAuth=6883185e-2...
        //make authentication check

        var userId = loginService.getUserIdFromParameter($location.$$absUrl);
        if (userId !== '') {
            loginService.disableRefreshToken();
            loginService.setCredentials({userId: userId, state: '00000'}, true).then(function (sessionInfo) {
                googleAnalyticsService.init(sessionInfo.uniqueUserId);
                // init Blm Services
                blmService.initBlmApiKey().then(function (apiKey) {
                    spimService.setApiKey(apiKey);

                    blmService.initBlmUrl().then(function () {
                        blmService.projects(sessionInfo.userId).then(function (projects) {
                            console.log(projects);
                        }, function (err) {
                            console.log(err);
                        });
                    }, function (err) {
                        console.log(err);
                    });
                });
            });
        }
        //reset local storage version
        defaultValuesHistoricService.resetLocalStorageIfNeeded();

        //Updating pace price Urls
        productPriceService.initPacePriceUrl();
        productPriceService.initApplicationPriceDate();
        productPriceService.initPaceBomUrl();

        if (Project.current) {
            // TODO : remove this once deployed and then refactor so that this page can work without project
            Project.current.isProjectDirty = false;
        }

        $scope.createNewProject = function () {
            if (Project.current && Project.current.isProjectDirty && !$scope.isLandingPage()) {
                dialogService.showYesNoDialog(gettextCatalog.getString('warning-save-project-message')).result.then(function (result) {
                    if (result) {
                        $scope.saveToBlm();
                    }
                });
            } else {
                projectEditionService.editProjectInfos(true);
            }
        };

        $scope.blMAvailable = function () {
            return blmService.blmAccessOk;
        };

        $scope.userAuthenticated = function () {
            return loginService.getUser().authenticated;
        };

        $scope.openBlmProjects = function () {
            if (blmService.blmAccessOk) {
                blmBrowserService.openBrowser('select-mode', blmService.blmSiteUrl, $scope.projectName(), function (projectInfo, onSucces, onError) {
                    blmService.loadProject(loginService.getUser().userId, projectInfo.spimObjectId).then(
                        function (loadedSpimDocument) {
                            projectService.loadProjectFromJson(loadedSpimDocument).then(function () {
                                if (onSucces !== undefined) {
                                    onSucces();
                                }
                                Project.current.rawDataSpimId = projectInfo.spimObjectId;
                                Project.current.parentWorkspaceId = projectInfo.parentWorkspaceId;

                                googleAnalyticsService.sendEvent('Application', 'BLM project loaded', 'BLM project loaded', Math.round(Project.current.selectedSwitchboard.getTotalPrice()));

                                logger.success(gettextCatalog.getString('LOADING_PROJECT_SUCCESS'), '', 'onFileLoad', true, null, {showUser: true});
                                $location.path('project-context');
                                if (!$rootScope.$$phase) {
                                    $rootScope.$apply();
                                }
                            }, function (err) {
                                if (onError !== undefined) {
                                    onError(err);
                                }
                                logger.error(gettextCatalog.getString('ERROR_LOADING_PROJECT'), err, 'onFileLoad', true, null, {showUser: true});
                            });
                        });
                });
            }
        };


        $scope.beforeLoading = function (callback, checkDevice) {

            // not supported by mobile devices
            if (checkDevice && adminService.isMobile.any()) {
                logger.error(gettextCatalog.getString('ERROR_NOT_YET_SUPPORTED_ON_MOBILE_DEVICE'), 'Function not yet supported', 'bom', true, null, {showUser: true});
                return;
            }
            if (callback) {
                callback();
            }
        };


        /**
         * Load a project
         */
        $scope.onFileLoad = function ($files) {

            if ($files && $files.length === 1) {
                //$files is an array of files selected, each file has name, size, and type.
                var file = $files[0];

                projectService.loadFile(file).then(function () {
                    $location.path('project-context');
                    logger.success(gettextCatalog.getString('LOADING_PROJECT_SUCCESS'), '', 'onFileLoad', true, null, {showUser: true});
                }, function (err) {
                    logger.error(gettextCatalog.getString('ERROR_LOADING_PROJECT'), err, 'onFileLoad', true, null, {showUser: true});
                });
            }
        };

    });
