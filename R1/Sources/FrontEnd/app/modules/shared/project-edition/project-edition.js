'use strict';

angular
    .module('shared')
    .controller('projectEdition', function ($scope, $rootScope, $timeout, $modalInstance, $window, $location, gettextCatalog, reloadApplication, isProjectCreation, editProjectCallback, projectService, Project, loginService, logger, googleAnalyticsService, keyboardShortcutsService) {

        $scope.reloadApplication = reloadApplication;
        $scope.isProjectCreation = isProjectCreation;
        $scope.editProjectCallback = editProjectCallback;

        $scope.closing = false;

        $scope.project = {};
        if (isProjectCreation) {
            projectService.createNewProject('', '', '', '');

            $timeout(function () {
                // workaround for bug EQ-50, if focus is set to an input element while an animation moves this element
                // IE11 has trouble displaying the caret at the correct location
                // this delay the focus until the animation is completed as a fix
                $('#projectEditionProjectName').focus();
            }, 400);
        }
        else {
            $scope.project.projectName = Project.current.name;
            $scope.project.projectReference = Project.current.projectReference;
            $scope.project.clientReference = Project.current.clientReference;
            $scope.project.projectNote = Project.current.projectNote;
        }

        $scope.close = function () {

            if ($scope.closing) {
                return;
            }

            $scope.closing = true;

            $modalInstance.close();
            if ($scope.reloadApplication) {
                $window.location.href = $window.location.pathname;
            }
        };

        $scope.validate = function () {

            if ($scope.closing) {
                return;
            }

            if (!$scope.project.projectName || !$scope.project.projectName.length || $scope.project.projectName.length < 1) {
                return;
            }

            $scope.closing = true;

            $modalInstance.close();

            Project.current.name = $scope.project.projectName;
            Project.current.projectReference = $scope.project.projectReference;
            Project.current.clientReference = $scope.project.clientReference;
            Project.current.projectNote = $scope.project.projectNote;


            if ($scope.isProjectCreation) {
                {
                    logger.success(gettextCatalog.getString('SUCCESS_CREATING_NEW_PROJECT'), '', 'newProject', true, null, {showUser: true});
                    googleAnalyticsService.sendEvent('Application', 'Project created', 'Project created');
                }


            } else {
                logger.success(gettextCatalog.getString('SUCCESS_EDITING_PROJECT_INFOS'), '', 'newProject', true, null, {showUser: true});

            }

            if(editProjectCallback!== undefined)
            {
                editProjectCallback(Project.current);
            }

        };

        //Navigation to first tab when a new project is created
        //Using href on a conditonal route, because $location.path('project-context') with a $rootScope.$apply wouldn't work (error $apply already in progress)
        $scope.navigate = function () {
            if (!$scope.project.projectName || !$scope.project.projectName.length || $scope.project.projectName.length < 1) {
                return;
            }
            if ($scope.isProjectCreation) {
                return '#/project-context';
            } else {
                return '';
            }
        };

        $scope.onKeydown = function ($event) {
            keyboardShortcutsService.onKeydown($event);
        };
    });
