/**
 * Created by Danyang LI on 29/11/14.
 */
'use strict';

angular.module('blmWebSDKDirective', []).directive('blmWebSdk', [function () {
    return {
        restrict: 'E',
        templateUrl: 'dependencies/BLMWebSDK/template/blm-websdk.html',
        replace: true,
        scope: {
            blmWebSdkMode: '@',
            blmWebSiteUrl: '@',
            selectFileCallback: '&',
            selectFolderCallback: '&',
            token: '&',
            uniqueUserId: '&'
        },
        link: function (scope) {
            scope.init = function () {
                scope.historyEntities = [];
                scope.currentEntity = null;
                scope.selectFile = null;
                scope.showSelectBtn = false;
                scope.showActivityIndicator = false;
                scope.userToken = scope.token();
                scope.userId = scope.uniqueUserId();
                scope.setUserToken();
            };
            scope.init();
        },
        controller: function ($scope, $timeout, spimService, userServices) {

            $scope.errorMessage = '';
            $scope.folderName = '';

            $scope.setUserToken = function () {
                $scope.showActivityIndicator = true;
                userServices.setToken($scope.userToken);
                spimService.getAllProjects(function (data) {
                    $scope.showActivityIndicator = false;
                    showOnlyEqqFiles(data);
                    $scope.spimEntities = data;
                    $scope.$apply();
                });
            };

            var refreshView = function () {
                if ($scope.historyEntities !== undefined && $scope.historyEntities.length > 0) {

                    $scope.showActivityIndicator = true;

                    var entity = $scope.historyEntities[$scope.historyEntities.length - 1];

                    spimService.getWorkspaceById(entity.objectId, function (data) {
                        $scope.showActivityIndicator = false;
                        showOnlyEqqFiles(data);
                        $scope.spimEntities = data;
                        $scope.$apply();
                    });
                }
                else {
                    $scope.backToHome();
                }
            };

            $scope.folderCreationMode = false;
            $scope.toggleFolderCreationMode = function () {
                $scope.folderCreationMode = !$scope.folderCreationMode;
                if ($scope.folderCreationMode) {
                    $timeout(function () {
                        // workaround for bug EQ-50, if focus is set to an input element while an animation moves this element
                        // IE11 has trouble displaying the caret at the correct location
                        // this delay the focus until the animation is completed as a fix
                        $('#addFolderText').focus();
                    }, 400);

                }

            };
            $scope.isEnterDown = function () {
                if (event.which === 27 /*escape*/) {
                    $scope.folderCreationMode = false;
                    $scope.folderName = '';
                }
                else if ($scope.folderName !== undefined && $scope.folderName !== '' && event.which === 13 /*enter*/) {
                    $scope.addFolder();
                }
            };
            $scope.addFolderTextLostFocus = function () {
                if ($scope.folderName !== undefined && $scope.folderName !== '') {
                    $scope.addFolder();
                }
            };

            $scope.addFolder = function () {
                if (!$scope.showActivityIndicator && $scope.folderName !== undefined) {
                    $scope.showActivityIndicator = true;
                    var blmProjectInfo =
                    {
                        'name': $scope.folderName,
                        'title': $scope.folderName,
                        'description': '',
                        'client': 'default',
                        'startDate': new Date(),
                        'status': 'status.new'
                    };


                    if ($scope.historyEntities !== undefined && $scope.historyEntities.length > 0) {
                        var entity = $scope.historyEntities[$scope.historyEntities.length - 1];
                        //create Workspace
                        blmProjectInfo.objectType = 'Workspace';
                        spimService.createWorkspace(blmProjectInfo, entity.objectId, function (data) {
                            console.log('Workspace created : ');
                            console.log(data);
                            $scope.folderName = '';
                            $scope.folderCreationMode = false;
                            $scope.showActivityIndicator = false;
                            refreshView();
                        }, function (error) {
                            console.log('unable to create workspace : ');
                            console.log(error);

                            if (error[0].responseJSON.errMsg.indexOf('* " < >  / ? :') > 0) {
                                $scope.errorMessage = 'BLM_ERROR_CHARACTER_FORBIDDEN';
                            }
                            else if (error[2] === 'Forbidden') {
                                $scope.errorMessage = 'BLM_ERROR_CREATING_FOLDER_NO_PERMISSION';
                            }
                            else {
                                $scope.errorMessage = 'BLM_ERROR_CREATING_FOLDER';
                            }
                            $timeout(function () {
                                $scope.errorMessage = '';
                            }, 10000);

                            $scope.showActivityIndicator = false;
                            $scope.$apply();
                        });

                    }
                    else {
                        //create Project
                        blmProjectInfo.objectType = 'Project';
                        spimService.createProject(blmProjectInfo, function (data) {
                            console.log('Project created : ');
                            console.log(data);
                            $scope.folderName = '';
                            $scope.folderCreationMode = false;
                            $scope.showActivityIndicator = false;
                            refreshView();
                        }, function (error) {
                            console.log('unable to create project : ');
                            console.log(error);

                            if (error[0].responseJSON.errMsg.indexOf('* " < >  / ? :') > 0) {
                                $scope.errorMessage = 'BLM_ERROR_CHARACTER_FORBIDDEN';
                            }
                            else if (error[2] === 'Forbidden') {
                                $scope.errorMessage = 'BLM_ERROR_CREATING_FOLDER_NO_PERMISSION';
                            }
                            else {
                                $scope.errorMessage = 'BLM_ERROR_CREATING_FOLDER';
                            }
                            $timeout(function () {
                                $scope.errorMessage = '';
                            }, 10000);

                            $scope.showActivityIndicator = false;
                            $scope.$apply();
                        });

                    }


                }
            };


            $scope.delete = function (spimObject) {
                if (!$scope.showActivityIndicator) {
                    $scope.showActivityIndicator = true;
                    spimService.deleteObjectById(spimObject.objectId, function (data) {
                        $scope.showActivityIndicator = false;
                        console.log('object deleted : ');
                        console.log(data);

                        refreshView();

                    }, function (error) {
                        console.log('unable to delete object : ');
                        console.log(error);

                        $scope.errorMessage = 'BLM_ERROR_DELETING_FOLDER';
                        $timeout(function () {
                            $scope.errorMessage = '';
                        }, 10000);

                        $scope.showActivityIndicator = false;
                        $scope.$apply();
                    });
                }
            };

            $scope.update = function (spimObject) {
                if (!$scope.showActivityIndicator) {
                    $scope.showActivityIndicator = true;
                    spimService.updateObjectMetadata(spimObject, function (data) {
                        $scope.showActivityIndicator = false;

                        console.log('object updated : ');
                        console.log(data);
                        refreshView();

                    }, function (error) {
                        console.log('unable to update object : ');
                        console.log(error);

                        if (error[0].responseJSON.errMsg.indexOf('* " < >  / ? :') > 0) {
                            $scope.errorMessage = 'BLM_ERROR_CHARACTER_FORBIDDEN';
                        }
                        else {
                            $scope.errorMessage = 'BLM_ERROR_UPDATING_OBJECT';
                        }

                        $timeout(function () {
                            $scope.errorMessage = '';
                        }, 10000);

                        $scope.showActivityIndicator = false;
                        $scope.$apply();
                    });
                }
            };
            var showOnlyEqqFiles = function (data) {
                data.forEach(function (spimObject) {
                    if (spimObject.title.indexOf('.eqq') > -1) {
                        spimObject.visible = true;
                    }
                    else {
                        spimObject.visible = false;
                    }

                });
            };

            $scope.select = function (spimObject) {
                if (!$scope.showActivityIndicator && (spimObject.objectType === 'Workspace' || spimObject.objectType === 'Project')) {
                    var refresh = false;
                    $scope.showActivityIndicator = true;
                    if ($scope.currentEntity === spimObject) {
                        refresh = true;
                    }
                    $scope.currentEntity = spimObject;
                    var idToUse = spimObject.objectId;
                    if (refresh && (spimObject.objectType === 'Workspace' || spimObject.objectType === 'Project')) {
                        idToUse = spimObject.owner;
                    }
                    else

                        spimService.getWorkspaceById(idToUse, function (data) {
                            $scope.showActivityIndicator = false;
                            if ($scope.blmWebSdkMode === 'save-mode') {
                                $scope.showSelectBtn = true;
                            }
                            if (refresh) {
                                $scope.spimEntities = [];
                            }
                            else {
                                $scope.historyEntities.push(spimObject);
                            }
                            data.forEach(function (spimObject) {
                                if (spimObject.title.indexOf('.eqq') > -1) {
                                    spimObject.visible = true;
                                }
                                else {
                                    spimObject.visible = false;
                                }

                            });
                            showOnlyEqqFiles(data);
                            $scope.spimEntities = data;


                            $scope.$apply();
                        });
                } else if (spimObject.objectType === 'Document') {
                    if ($scope.blmWebSdkMode === 'select-mode') {

                        if (spimObject !== undefined) {
                            $scope.selectFile = spimObject;
                            $scope.showSelectBtn = true;
                        }
                        else {
                            $scope.selectFile = null;
                            $scope.showSelectBtn = false;
                        }
                    }
                }
            };

            $scope.breadCrumbClicked = function (entity, index) {
                if (!$scope.showActivityIndicator) {
                    $scope.showActivityIndicator = true;
                    var historyEntities = [];
                    for (var i = 0; i <= index; i++) {
                        historyEntities.push($scope.historyEntities[i]);
                    }
                    $scope.currentEntity = entity;
                    $scope.historyEntities = historyEntities;
                    spimService.getWorkspaceById(entity.objectId, function (data) {
                        $scope.showActivityIndicator = false;
                        showOnlyEqqFiles(data);
                        $scope.spimEntities = data;
                        $scope.$apply();
                    });
                }
            };

            $scope.backToHome = function () {
                if (!$scope.showActivityIndicator) {
                    $scope.showActivityIndicator = true;
                    $scope.showSelectBtn = false;
                    spimService.getAllProjects(function (data) {
                        console.log(data);
                        $scope.showActivityIndicator = false;
                        showOnlyEqqFiles(data);
                        $scope.spimEntities = data;
                        $scope.$apply();
                    });
                    $scope.historyEntities = [];
                }
            };

            $scope.entitySelected = function () {
                if ($scope.blmWebSdkMode === 'save-mode') {
                    $scope.showSelectBtn = false;
                    $scope.showActivityIndicator = true;
                    console.log('selected folder:');
                    console.log($scope.currentEntity);
                    $scope.selectFolderCallback({folder: $scope.currentEntity});

                } else if ($scope.blmWebSdkMode === 'select-mode') {
                    $scope.showSelectBtn = false;
                    $scope.showActivityIndicator = true;
                    console.log('selected file:');
                    console.log($scope.selectFile);
                    $scope.selectFileCallback({file: $scope.selectFile});
                }
            };
        }
    };
}])
;