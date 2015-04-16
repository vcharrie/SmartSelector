'use strict';

angular
    .module('blmWebSDKDirective')
    .directive(
    'spimEntityBrowser',
    [

        '$compile',
        function ($compile) {
            var modifyObjectNameTemplate = '<span data-ng-show="editActivated"><input id="{{buildReduceId()}}"  type="text" ng-model="editedName.value" data-ng-click="$event.stopPropagation()" data-ng-keydown="isEnterDown()" data-ng-blur="changeNameTextLostFocus()" /></span>';

            var editableIconHtmlBlock = '<span data-ng-if="canBeEdited()"><i ng-click="objectEdit($event)" class="fa fa-pencil"></i></span>';
            var notEditableIconHtmlBlock = '<span data-ng-if="!canBeEdited()"><i class="not-editable-icon fa fa-pencil"></i></span>';

            var deletableIconHtmlBlock = '<span data-ng-if="canBeDeleted()"><i ng-click="objectDelete($event)" class="fa fa-trash-o fa-lg"></i></span>';
            var notDeletableIconHtmlBlock = '<span data-ng-if="!canBeDeleted()"><i class="not-editable-icon fa fa-trash-o fa-lg"></i></span>';

            var browsableFolderHtml = '<span data-ng-if="canBeBrowsed()"><a class="blm-spim-object-clickable" data-ng-show="!editActivated" ng-click="select()"> {{spimObject.title}}</a></span>';
            var unBrowsableFolderHtml = '<span data-ng-if="!canBeBrowsed()" class="not-browsable-folder"> {{spimObject.title}}</span>';

            var workspaceTemplate = '<div class="blm-spim-object blm-spim-workspace" ><span style="padding-left:10%;"><i class="fa fa-folder-o blm-browser-modal-folder-file-icon"></i></span>' + browsableFolderHtml + unBrowsableFolderHtml + modifyObjectNameTemplate + editableIconHtmlBlock + notEditableIconHtmlBlock + deletableIconHtmlBlock + notDeletableIconHtmlBlock + '</div >';
            var fileTemplate = '<div data-ng-if="spimObject.visible" class="blm-spim-object blm-spim-workspace"  ><span style="padding-left:10%;"><i class="fa fa-file-text-o blm-browser-modal-folder-file-icon"></i><span ng-class="(spimObject===$parent.$parent.selectFile) ? \'fileSelected\' : \'\'"  ng-click="fileClicked();select()"> <span class="blm-spim-object-clickable" > [{{spimObject.createdDate | date:"yyyy-MM-dd"}}]</span><span class="blm-spim-object-clickable" data-ng-show="!editActivated">{{spimObject.title}}</span></span>' + modifyObjectNameTemplate + editableIconHtmlBlock + notEditableIconHtmlBlock + deletableIconHtmlBlock + notDeletableIconHtmlBlock + '</div>';

            var getTemplate = function (spimObject) {
                if (spimObject.objectType === 'Project' || spimObject.objectType === 'Workspace') {
                    return workspaceTemplate;
                } else if (spimObject.objectType === 'Document') {
                    return fileTemplate;
                }
            };

            return {
                restrict: 'E',
                replace: true,
                scope: {
                    spimObject: '=',
                    spimObjectSelectCallback: '&',
                    spimObjectDeleteCallback: '&',
                    spimObjectUpdateCallback: '&',
                    spimObjectSelectionMode: '&',
                    blmWebSdkMode: '@',
                    userId: '@'
                },
                link: function (scope, element) {
                    scope.fileSelected = false;
                    scope.editActivated = false;
                    scope.editedName = {};
                    scope.editedName.value = '';


                    getTemplate(scope.spimObject);
                    var htmlToAdd;
                    htmlToAdd = angular
                        .element(getTemplate(scope.spimObject));
                    element.append(htmlToAdd);
                    $compile(htmlToAdd)(scope);
                },
                controller: function ($scope, $timeout) {


                    var hasRight = function (right) {
                        for (var i = 0; i < $scope.spimObject.shareObjectAcl.length; ++i) {
                            var shareObjectAcl = $scope.spimObject.shareObjectAcl[i];
                            if (shareObjectAcl.userName === $scope.userId && (shareObjectAcl.permission.indexOf(right) > -1)) {
                                return true;
                            }
                        }
                        return false;
                    };

                    $scope.canBeEdited = function () {
                        return hasRight('write') || hasRight('all');
                    };

                    $scope.canBeDeleted = function () {
                        return hasRight('all');
                    };

                    $scope.canBeBrowsed = function () {
                        return ($scope.blmWebSdkMode === 'select-mode') || hasRight('write');
                    };


                    $scope.fileClicked = function () {
                        if ($scope.blmWebSdkMode === 'select-mode') {
                            $scope.fileSelected = !$scope.fileSelected;

                        }
                    };

                    $scope.buildReduceId = function () {
                        return 'editedNameText' + $scope.spimObject.objectId.substring(0, 20);
                    };

                    $scope.objectEdit = function (e) {
                        $scope.editActivated = !$scope.editActivated;
                        if ($scope.editActivated) {

                            $scope.editedName.value = $scope.spimObject.title;
                            if ($scope.spimObject.objectType === 'Document') {
                                $scope.editedName.value = $scope.spimObject.title.replace('.eqq', '');
                            }


                            $timeout(function () {
                                // workaround for bug EQ-50, if focus is set to an input element while an animation moves this element
                                // IE11 has trouble displaying the caret at the correct location
                                // this delay the focus until the animation is completed as a fix
                                $('#' + $scope.buildReduceId()).focus();
                            }, 400);


                        } else {
                            $scope.editedName.value = '';
                        }

                        if (e !== null) {
                            e.stopPropagation();
                        }
                    };
                    $scope.objectEditCommit = function (e) {

                        if ($scope.spimObjectUpdateCallback !== undefined) {
                            $scope.spimObject.title = $scope.editedName.value;

                            if ($scope.spimObject.objectType === 'Document') {
                                $scope.spimObject.title = $scope.spimObject.title + '.eqq';
                            }

                            $scope.spimObjectUpdateCallback($scope.spimObject);
                        }
                        if (e !== null) {
                            e.stopPropagation();
                        }
                    };
                    $scope.objectDelete = function (e) {

                        if ($scope.spimObjectDeleteCallback !== undefined) {
                            $scope.spimObjectDeleteCallback($scope.spimObject);
                        }

                        if (e !== null) {
                            e.stopPropagation();
                        }
                    };

                    $scope.select = function () {

                        if ($scope.spimObjectSelectCallback !== undefined) {
                            $scope.spimObjectSelectCallback($scope.spimObject);
                        }

                    };

                    $scope.isEnterDown = function () {

                        if (event.which === 27 /*escape*/) {
                            $scope.editActivated = false;
                        }
                        else if ($scope.spimObject.title !== undefined && $scope.spimObject.title !== '' && event.which === 13 /*enter*/) {
                            $scope.objectEditCommit(null);
                            $scope.editActivated = false;
                        }
                    };
                    $scope.changeNameTextLostFocus = function () {
                        if ($scope.spimObject.title !== undefined && $scope.spimObject.title !== '') {
                            $scope.objectEditCommit(null);
                            $scope.editActivated = false;
                        }
                    };


                }
            };
        }]);
