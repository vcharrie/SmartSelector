'use strict';

angular
    .module('shared')
    .controller('blmBrowser', function ($scope, $rootScope, $timeout, $modalInstance, $window, $location, gettextCatalog, blmService, browserMode, blmWebSiteUrl,projectName, browsingCallback, Project, loginService, logger) {


        $scope.projectsLoaded = false;
        $scope.projects = null;
        $scope.browserMode = browserMode;
        $scope.browsingCallback = browsingCallback;
        $scope.showBrowserInput = false;
        $scope.browserFormFields = {};
        $scope.blmWebSiteUrl = blmWebSiteUrl;
        $scope.projectName = projectName;


        var userId = loginService.getUser().userId;
        var uniqueUserId = loginService.getUser().uniqueUserId;

        // Recursively populate workspace childs
        var populateChilds = function (spimParentObject) {
            blmService.subItems(userId, spimParentObject.objectId).then(function (subitems) {
                    spimParentObject.childLoading = false;
                    if (subitems !== undefined && subitems.spimObject !== undefined) {
                        spimParentObject.subitems = subitems.spimObject;
                        spimParentObject.subitems.forEach(function (subitem) {
                                if (subitem.objectType === 'Document' && subitem.name === 'projectJsonData') {
                                    spimParentObject.rawDataSpimId = subitem.objectId;
                                }
                                if (subitem.objectType === 'Workspace'|| subitem.objectType === 'Project') {
                                    subitem.childLoading = true;
                                    populateChilds(subitem);
                                }
                            }
                        );
                    }
                }, function () {
                    spimParentObject.childLoading = false;
                }
            );
        };

        $scope.token = function () {
            return userId;
        };
        $scope.userId = function () {
            return uniqueUserId;
        };

        //Getting user blm projects
        blmService.projects(userId).then(function (projects) {

            if (projects !== undefined) {
                $scope.projectsLoaded = true;
            }
        }, function () {
            $scope.projects = null;
            $scope.projectsLoaded = false;
            logger.error(gettextCatalog.getString('ERROR_READING_BLM_PROJECT'), '', 'blmProject', true, null, { showUser: true });

        });

        $scope.onSpimObjectSelected = function (spimObject, name, type) {
            if ($scope.browserMode === 'select-mode') {
                $scope.openProjectAsDocument(spimObject.objectId);
            }
            if ($scope.browserMode === 'delete-element') {
                $scope.deleteSpimObject(spimObject.objectId);
            }
            if ($scope.browserMode === 'save-mode') {

                if (type === 'workspace') {
                    $scope.createWorkspace(spimObject.objectId, name);
                }
                else {
                    $scope.saveProjectAsDocument(spimObject.objectId, $scope.projectName);
                }

            }
        };

        $scope.deleteSpimObject = function (spimObjectId) {
            console.log('deleteSpimObject =' + spimObjectId);
        };

        $scope.saveProjectAsDocument = function (spimObjectId, name) {

            var nameToUse = Project.current.name;
            if (name !== undefined && name !== '') {
                nameToUse = name;
            }

            if (nameToUse !== undefined && browsingCallback !== undefined) {
                browsingCallback({parentWorkspaceId: spimObjectId, name: nameToUse},
                    function () {
                        $modalInstance.close();
                    }, function (err) {
                        console.log(err);
                    });
            }
        };

        $scope.openProjectAsDocument = function (spimObjectId) {

            if (browsingCallback !== undefined) {
                browsingCallback({spimObjectId: spimObjectId},
                    function () {
                        $modalInstance.close();
                    }, function (err) {
                        console.log(err);
                        $modalInstance.close();
                    });
            }
        };


        $scope.close = function () {
            $modalInstance.close();
            if ($scope.reloadApplication) {
                $window.location.href = $window.location.pathname;
            }
        };


        $scope.validate = function () {
            $modalInstance.close();
        };

        var init = function () {
            if (browserMode === 'save-eqq-project') {
                $scope.showBrowserInput = true;
            }
        };

        init();

    });
