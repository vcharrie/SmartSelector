'use strict';

/**
 * Shell controller
 */
angular.module('shell', ['helpers', 'gettext', 'config', 'business', 'angularFileUpload', 'shared', 'ngCookies'])
    .controller('shell', function (logger, $scope, $rootScope, $location, $q, gettextCatalog, $modal, $cookies, $routeParams, $timeout, discoversService, discoversRestService, localStorageService, adminService, dialogService, projectService, appConstants, applicationConfigurationService, projectEditionService, loginService, blmService, blmBrowserService, googleAnalyticsService, profileService, translationService, spimService, userSessionTimeoutService, $route, apiHelper, $window, Project) {

        /*
         * Wizard configuration
         */

        var wizardBackwards = {};
        var wizardGoForwards = {
            '/project-context': {
                go: function () {
                    $location.path('/switchboard-content');
                },
                label: 'shell-goto-switchboard-content',
                disabled: function () {
                    return false;
                }
            },
            '/switchboard-content': {
                go: function () {
                    $location.path('/enclosure');
                },
                label: 'shell-goto-enclosure',
                disabled: function () {
                    return !projectService.hasElectricalDevices();
                }
            },
            '/bom': null
        };


        var blmProjectId = $routeParams.projectId;

        /*
         * View Model
         */
        // Define all view model properties
        $scope.isLandingPage = function () {
            return ($location.path() === '/');
        };

        $scope.isProjectContextPage = function () {
            return ($location.path() === '/project-context');
        };

        $scope.isOpenningBlmProject = function () {
            return (blmProjectId !== undefined);
        };

        $scope.isLoading = false;
        $scope.buildInfo = appConstants.buildInfo;
        $scope.isAdmin = false;
        $scope.isSudo = adminService.isSudo;
        $scope.isDeveloperMode = false;
        $scope.isSavingToBlm = false;
        var loggingOut = false;

        $scope.isProjectDirty = function () {
            return Project.current && Project.current.isProjectDirty;
        };
        $scope.isSolutionDirty = function () {
            return Project.current && Project.current.selectedSwitchboard && Project.current.selectedSwitchboard.isSolutionDirty;
        };

        $scope.projectName = function () {
            return ((!Project.current || !Project.current.name || !Project.current.name.length) ? gettextCatalog.getString('Project') : Project.current.name);
        };
        $scope.switchboardName = function () {
            return ((!Project.current || !Project.current.selectedSwitchboard || !Project.current.selectedSwitchboard.name) ? '' : Project.current.selectedSwitchboard.name);
        };
        $scope.switchboardSmartStatus = function () {
            if (!Project.current || !Project.current.selectedSwitchboard || !Project.current.selectedSwitchboard.getSmartStatus()) {
                return '';
            } else {
                if (Project.current.selectedSwitchboard.getSmartStatus() === 'SMART') {
                    return gettextCatalog.getString('smart-panel-status-indicator');
                } else {
                    return '';
                }
            }
        };

        $scope.availableLanguages = [];
        $scope.headerCccLink = function () {
            return appConstants.headerCccLink;
        };
        $scope.schneiderWebsiteLink = function () {
            return appConstants.schneiderWebsiteLink;
        };
        $scope.rapsodyLink = function () {
            return appConstants.rapsodyLink;
        };
        $scope.ecodialLink = function () {
            return appConstants.ecodialLink;
        };
        $scope.blmLink = function () {
            return blmService.blmSiteUrl;
        };

        $scope.smartPanelLink = function () {
            return appConstants.smartPanelLink;
        };

        $scope.feedbackLink = function () {
            return appConstants.feedbackLink;
        };
        $scope.privacyPolicyLink = function () {
            return appConstants.privacyPolicyLink;
        };

        $scope.goForward = null;

        $scope.goBackward = null;

        applicationConfigurationService.getApplicationParameter('languages').then(function (languages) {
            console.log('languages received' + languages);
            var languageToSelect = null;

            languages.parameterObject.forEach(function (language) {

                //try to read SSO_QUICKQUOTATION_PREFERRED_LANGUAGE cookie and update user info if possible
                var SSO_QUICKQUOTATION_PREFERRED_LANGUAGE = $cookies.SSO_QUICKQUOTATION_PREFERRED_LANGUAGE;

                if (SSO_QUICKQUOTATION_PREFERRED_LANGUAGE !== undefined && language.authenticationLangKey !== undefined && language.authenticationLangKey === SSO_QUICKQUOTATION_PREFERRED_LANGUAGE) {
                    languageToSelect = language;
                }

                if (adminService.developerMode()) {
                    $scope.availableLanguages.push(language);
                    if (language.defaultDev && languageToSelect === null) {
                        languageToSelect = language;
                    }
                } else if (!language.devOnly) {
                    $scope.availableLanguages.push(language);
                    if (language.defaultProd && languageToSelect === null) {
                        languageToSelect = language;
                    }
                }

            });

            if (languageToSelect !== null) {
                $scope.selectLanguage(languageToSelect);
            }


        });

        $scope.selectLanguage = function (lang) {

            adminService.setLocale(lang.locale);
            translationService.setLocale(lang);

            $scope.language = lang;
            $rootScope.$broadcast('languageChanged', lang.authenticationLangKey);

        };
        $scope.availableCountries = [{'name': 'Spain', 'code': 'ES'}, {'name': 'Russia', 'code': 'RU'}];
        $scope.selectedCountry = {'name': 'Change country', 'code': 'na'};

        $scope.selectCountry = function (country) {

            $cookies.SSO_COUNTRY_CODE = country.code;
            $cookies.SSO_COUNTRY_CODE_FORCE = country.code;
            $scope.selectedCountry = country;
            $window.location.href = $window.location.pathname;

        };

        $scope.isProjectEditInfosHighlighted = false;

        /*
         * Controller
         */
        $scope.isActive = function (route) {
            return route === $location.path();
        };

        $scope.oneIsActive = function (route1, route2, route3) {
            var route = $location.path();
            return (route1 === route) || (route2 === route) || (route3 === route);
        };


        $rootScope.$on('$routeChangeStart', function () {
            $scope.goForward = wizardGoForwards[$location.path()];
            $scope.goBackward = wizardBackwards[$location.path()];

        });

        $rootScope.$on('service.adminMode.changed', function () {
            $scope.isAdmin = adminService.adminMode();
        });

        $rootScope.$on('service.developerMode.changed', function () {
            $scope.isDeveloperMode = adminService.developerMode();
        });

        /**
         * Edit project's information
         */
        $scope.editProjectInfos = function () {
            projectEditionService.editProjectInfos(false, function (updateProject) {
                if (updateProject !== undefined && updateProject.rawDataSpimId !== undefined) {
                    updateProject.updateName = true;

                }
            });
        };

        /*
         * If project is dirty, warn the user and propose him to save
         */
        $scope.checkProjectDirtyState = function (callback, checkDevice, userAction) {
            if (userAction === 'logout' && $scope.isLandingPage()) {
                return;
            }

            // not supported by mobile devices
            if (checkDevice && adminService.isMobile.any()) {
                logger.error(gettextCatalog.getString('ERROR_NOT_YET_SUPPORTED_ON_MOBILE_DEVICE'), 'Function not yet supported', 'bom', true, null, {showUser: true});
                return;
            }

            if (Project.current && Project.current.isProjectDirty) {
                dialogService.showYesNoDialog(gettextCatalog.getString('warning-save-project-message')).result.then(function (result) {
                    if (result && callback) {
                        if (userAction === 'loadProject') {
                            $scope.save();
                            $timeout(function () {
                                callback();
                            });
                        } else {
                            $scope.saveToBlm().then(function () {
                                $timeout(function () {
                                    callback();
                                });
                            });
                        }
                    } else if (!result && callback) {
                        callback();
                    }
                });
            } else {
                if (callback) {
                    callback();
                }
            }
        };

        /**
         * Create a new project
         */
        $scope.createNewProject = function () {
            $scope.checkProjectDirtyState(function () {
                projectEditionService.editProjectInfos(true);
                $location.path('#');
            });
        };

        $scope.goToHomePage = function () {
            $scope.checkProjectDirtyState(function () {
                $location.path('#');
            });
        };
        /**
         * Is blm Available
         */
        $scope.blMAvailable = function () {
            return blmService.blmAccessOk;
        };

        var openBlm = function (spimObjectId, onSucces, onError, parentWorkspaceId) {
            blmService.loadProject(loginService.getUser().userId, spimObjectId).then(
                function (loadedSpimDocument) {
                    projectService.loadProjectFromJson(loadedSpimDocument).then(function () {
                        if (onSucces !== undefined) {
                            onSucces();
                        }
                        Project.current.rawDataSpimId = spimObjectId;
                        Project.current.parentWorkspaceId = parentWorkspaceId;

                        googleAnalyticsService.sendEvent('Application', 'BLM project loaded', 'BLM project loaded', Math.round(Project.current.selectedSwitchboard.getTotalPrice()));

                        logger.success(gettextCatalog.getString('LOADING_PROJECT_SUCCESS'), '', 'onFileLoad', true, null, {showUser: true});
                        if ($location.path() !== '/project-context') {
                            $location.path('project-context');
                        } else {
                            $route.reload();
                        }
                        if (!$rootScope.$$phase) {
                            $rootScope.$apply();
                        }
                    }, function (err) {
                        if (onError !== undefined) {
                            onError(err);
                        }
                        logger.error(gettextCatalog.getString('ERROR_LOADING_PROJECT') + ' ' + err.errMsg, err, 'onFileLoad', true, null, {showUser: true});
                    });
                });
        };

        /**
         * Open a project from blm
         */
        $scope.openFromBlm = function () {
            $scope.checkProjectDirtyState(function () {
                blmBrowserService.openBrowser('select-mode', blmService.blmSiteUrl, $scope.projectName(), function (projectInfo, onSucces, onError) {
                    openBlm(projectInfo.spimObjectId, onSucces, onError, projectInfo.parentWorkspaceId);
                });
            });
        };

        /**
         * Save a project to blm
         */

        var postToBlm = function (json, projectInfo, onSucces, onError) {
            var deferred = $q.defer();
            blmService.saveJsonData(loginService.getUser().userId, projectInfo.parentWorkspaceId, projectInfo.name, json).then(function (createdFileInfo) {
                $scope.isSavingToBlm = false;

                if (createdFileInfo.status) {
                    logger.success(gettextCatalog.getString('SAVING_BLM_PROJECT_SUCCESS'), '', 'saveToBlm', true, null, {showUser: true});
                    Project.current.parentWorkspaceId = projectInfo.parentWorkspaceId;
                    Project.current.rawDataSpimId = createdFileInfo.objectId;
                    Project.current.isProjectDirty = false;
                    if (onSucces !== undefined) {
                        onSucces();
                        deferred.resolve();
                    }
                }
                else {
                    if (onError !== undefined) {
                        onError(createdFileInfo.errMsg);
                        deferred.reject();
                    }
                }
            }, function (err) {
                if (onError !== undefined) {
                    onError(err);
                }
                logger.error(gettextCatalog.getString('SAVING_BLM_PROJECT_ERROR') + ' ' + err.errMsg, err.errMsg, 'saveToBlm', true, null, {showUser: true});
                $scope.isSavingToBlm = false;
                deferred.reject();
            });
            return deferred.promise;
        };

        $scope.saveToBlm = function () {
            var deferred = $q.defer();

            if (blmService.blmAccessOk) {
                var json = projectService.saveProject();

                if (Project.current !== undefined && Project.current.rawDataSpimId !== undefined) {
                    $scope.isSavingToBlm = true;


                    blmService.updateJsonData(loginService.getUser().userId, Project.current.rawDataSpimId, json).then(function (createdFileInfo) {
                        $scope.isSavingToBlm = false;

                        if (createdFileInfo.status) {
                            logger.success(gettextCatalog.getString('SAVING_BLM_PROJECT_SUCCESS'), '', 'saveToBlm', true, null, {showUser: true});
                            Project.current.rawDataSpimId = createdFileInfo.objectId;
                            googleAnalyticsService.sendEvent('Application', 'BLM project saved', 'BLM project saved', Math.round(Project.current.selectedSwitchboard.getTotalPrice()));
                            Project.current.isProjectDirty = false;
                            if (Project.current.updateName) {
                                blmService.updateMetaData(loginService.getUser().userId, Project.current.rawDataSpimId, {
                                    'name': Project.current.name + '.eqq',
                                    'title': Project.current.name + '.eqq'
                                });
                                Project.current.updateName=false;
                            }
                            deferred.resolve();
                        }
                        else {
                            logger.error(gettextCatalog.getString('SAVING_BLM_PROJECT_ERROR') + ' ' + createdFileInfo.errMsg, createdFileInfo.errMsg, 'saveToBlm', true, null, {showUser: true});
                            deferred.reject();
                        }
                    }, function (err) {
                        logger.error(gettextCatalog.getString('SAVING_BLM_PROJECT_ERROR') + ' ' + err.errMsg, err.errMsg, 'saveToBlm', true, null, {showUser: true});
                        $scope.isSavingToBlm = false;
                        deferred.reject();
                    });
                }
                else {
                    if (Project.current !== undefined && Project.current.parentWorkspaceId !== undefined) {
                        var projectInfo = {
                            'parentWorkspaceId': Project.current.parentWorkspaceId,
                            'name': $scope.projectName
                        };
                        postToBlm(json, projectInfo).then(function () {
                            deferred.resolve();
                        });
                    } else {
                        blmBrowserService.openBrowser('save-mode', blmService.blmSiteUrl, $scope.projectName(), function (projectInfo, onSucces, onError) {
                            postToBlm(json, projectInfo, onSucces, onError).then(function () {
                                deferred.resolve();
                            });
                        });
                    }
                }
            }
            return deferred.promise;
        };

        $scope.saveBackup = function () {
            /*
             same name was kept for historical reasons
             but with the new multi-switchborad functionality, it's better to simply duplicate the current SW to create a backup.
             */
            var oldSwitchboardPack = Project.current.selectedSwitchboardPack;
            var oldName = oldSwitchboardPack.switchboard.name;
            var newSwitchboardPack = Project.current.duplicateSwitchboard(oldSwitchboardPack, oldName);
            var newName = (oldName + ' ' + gettextCatalog.getString('smart-revision-suffix')).trim();
            var newIndex = Project.current.getLastSwitchboardNumberNamed(newName) + 1;
            var newIndexedName = newIndex === 0 ? newName : (newName + ' ' + newIndex).trim();
            newSwitchboardPack.isSelectedForBom = false;
            oldSwitchboardPack.switchboard.name = newIndexedName;
            Project.current.selectSwitchboard(oldSwitchboardPack);
        };

        /**
         * Save a project
         */
        $scope.save = function (suffix) {
            var fileName = $scope.projectName() + (!!suffix ? ('-' + suffix) : '');

            projectService.downloadProject(fileName);

            googleAnalyticsService.sendEvent('Application', 'Project saved', 'Project saved', Math.round(Project.current.selectedSwitchboard.getTotalPrice()));
        };

        /**
         * Load a project
         */
        $scope.onFileLoad = function ($files) {
            if ($files && $files.length === 1) {
                //$files is an array of files selected, each file has name, size, and type.
                var file = $files[0];

                projectService.loadFile(file).then(function () {
                    logger.success(gettextCatalog.getString('LOADING_PROJECT_SUCCESS'), '', 'onFileLoad', true, null, {showUser: true});
                    if ($location.path() !== '/project-context') {
                        $location.path('project-context');
                    } else {
                        $route.reload();
                    }
                    if (!$rootScope.$$phase) {
                        $rootScope.$apply();
                    }
                }, function (err) {
                    logger.error(gettextCatalog.getString('ERROR_LOADING_PROJECT'), err, 'onFileLoad', true, null, {showUser: true});
                });
            }
        };

        /**
         * openCGU
         */
        $scope.openCGU = function () {
            dialogService.showHtmlContentDialog(gettextCatalog.getString('dialog-cgu-title'), 'dialog-cgu-text');
        };

        /*
         * Init
         */

        function init() {
            logger.log('Activated shell');

            projectService.loadGlobalConfiguration().then(function () {
                $scope.showCGU = !appConstants.skipTermsAndConditions;
                $scope.showSmartPanelLink = !appConstants.skipSmartPanelLink;
                $scope.showCloudStorageLink = !appConstants.skipCloudStorageLink;
            });

            //try to read SSO_QUICKQUOTATION cookie and update user info if possible
            var SSO_QUICKQUOTATION = $cookies.SSO_QUICKQUOTATION;

            //if open blm project cookie is present open it
            blmProjectId = $cookies.OPEN_BLM_PROJECT;

            //backup openning need to be proposed if exist in local storage
            var timeoutSessionProjectBackup = localStorageService.get('TIMEOUT_SESSION_PROJECT_BACKUP');
            if (timeoutSessionProjectBackup !== undefined && timeoutSessionProjectBackup !== null) {
                userSessionTimeoutService.openDialog('OpenBackup', function () {
                    projectService.loadProjectFromJson(timeoutSessionProjectBackup).then(function () {
                        $location.path('project-context');
                    });
                });
                localStorageService.remove('TIMEOUT_SESSION_PROJECT_BACKUP');
            }


            if (SSO_QUICKQUOTATION !== undefined) {
                loginService.setCredentials({'userId': SSO_QUICKQUOTATION}).then(function (sessionInfo) {
                    googleAnalyticsService.init(sessionInfo.uniqueUserId);
                    $scope.availableLanguages.forEach(function (language) {
                        if (language.authenticationLangKey !== undefined && language.authenticationLangKey === sessionInfo.preferredLanguage) {
                            $scope.selectLanguage(language);
                        }

                        discoversRestService.discoverMustBeDisplayed(language.authenticationLangKey).then(function (result) {
                            if (result.discoverMustBeDisplayed) {
                                // use result.lastDiscover instead of -1 (main discover) to select the last discover
                                discoversService.openDialog(language.authenticationLangKey, -1);
                            }
                        });
                    });

                    //init blmService once authenticated
                    blmService.initBlmApiKey().then(function (apiKey) {
                        spimService.setApiKey(apiKey);
                        blmService.initBlmUrl().then(function () {
                            blmService.projects(sessionInfo.userId).then(function () {
                                if ($scope.isOpenningBlmProject()) {
                                    openBlm(blmProjectId);
                                }
                            });
                        });
                    });
                });
            }

            $scope.isAdmin = adminService.adminMode();
            $scope.isDeveloperMode = adminService.developerMode();
        }

        $scope.userInfo = function (info) {
            if (loginService.getUser()[info] !== undefined) {
                return loginService.getUser()[info];
            }

            else {
                return 'user-info-not-found';
            }
        };


        var globalSessionEndingTimeout = null;

        var resetGlobalSessionEndingTimeout = function (seconds) {

            if (globalSessionEndingTimeout !== null) {
                console.log('resetting session timeout');
                $timeout.cancel(globalSessionEndingTimeout);
            }

            console.log('timeout will occur in ' + seconds + 's');

            //set time out for user session
            globalSessionEndingTimeout = $timeout(function () {

                if (Project.current !== undefined) {
                    localStorageService.add('TIMEOUT_SESSION_PROJECT_BACKUP', projectService.saveProject());
                }

                userSessionTimeoutService.openDialog('Reload', function () {
                });
                //75 * 3600 * 100); // (7h30 delay)
            }, seconds * 1000);

        };

        $rootScope.$on('loginService.sessionExpireTimeChanged', function () {
            console.log(loginService.sessionExpireTime);
            resetGlobalSessionEndingTimeout(loginService.sessionExpireTime);
        });

        $scope.$on('$routeChangeStart', function () {
            loginService.refreshToken();
        });


        $scope.refreshToken = function () {
            loginService.refreshToken();
        };

        $scope.sessionExpirationDate = function () {
            return loginService.sessionExpirationDate();
        };


        $scope.editUserProfileInfo = function () {
            console.log($scope.userInfo('authenticated'));
            if ($scope.userInfo('authenticated')) {
                profileService.init(loginService.authenticationUrl, loginService.getUser().userId);
                $modal.open({
                    templateUrl: 'modules/shared/edit-profile/editProfileDialog.view.html',
                    controller: 'editProfileDialog',
                    backdrop: 'static',
                    keyboard: false,
                    resolve: {
                        successCallback: function () {
                            return function () {
                                loginService.setCredentials({'userId': loginService.getUser().userId});
                            };
                        }, errorCallback: function () {
                            return function () {

                            };
                        }, cancelCallback: function () {
                            return function () {

                            };
                        }
                    }
                });
            }
            else {

                return 'user-not-authenticated';
            }
        };

        $scope.logout = function () {
            $scope.checkProjectDirtyState(function () {
                loggingOut = true;
                loginService.logout();
            }, false, 'logout');
        };

        $scope.openDiscovers = function () {
            discoversService.openDialog($scope.language.authenticationLangKey);
        };


        $scope.selectSwitchboard = function (switchboardPack) {
            Project.current.selectSwitchboard(switchboardPack);

            // Force controller refresh
            $route.reload();
        };

        $scope.switchboardPacks = function () {
            return !Project.current ? [] : Project.current.switchboardPacks;
        };

//connection lost controls
        $scope.connectionLost = false;
        $scope.showSaveButton = false;

        $scope.saveProjectWhileConnectionLost = function () {
            projectService.downloadProject(Project.current.name);
            googleAnalyticsService.sendEvent('Application', 'Project saved', 'Project saved', Math.round(Project.current.selectedSwitchboard.getTotalPrice()));
            $location.path('/');
            $window.location.reload();
        };

        $scope.additionalItemSwitchboardPackFilter = function (switchboardPack) {
            return switchboardPack.type !== 'other';
        };

        $rootScope.$on(apiHelper.offlineEventName, function () {
            $scope.connectionLost = true;
            //showSaveButton is true only if we can download the project without crashing
            $scope.showSaveButton = typeof Project.current !== 'undefined' && Project.current !== null;
            if (!$rootScope.$$phase) {
                $rootScope.$apply();
            }
        });
        $rootScope.$on(apiHelper.onlineEventName, function () {
            $scope.connectionLost = false;
            $scope.showSaveButton = false;
            if (!$rootScope.$$phase) {
                $rootScope.$apply();
            }
        });

        window.addEventListener('beforeunload', function (e) {
            if ($scope.isProjectDirty() && !loggingOut && !$scope.isDeveloperMode) {
                var confirmationMessage = gettextCatalog.getString('leave-page-confirmation-message');

                (e || window.event).returnValue = confirmationMessage;
                return confirmationMessage;
            }
        });

        init();

    }).config(function () {
    });
