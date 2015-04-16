'use strict';

angular
    .module('directives')
    .directive('threejsInspector', function() {
        return {
            restrict: 'E',
            scope: {
                viewer: '=viewer',
                simplifyTree: '=simplifyTree',
                showReferencePoints: '=showReferencePoints'
            },
            templateUrl: 'common/directives/threejsInspector.directive.view.html',
            controller: function ($scope, threejs) {
                $scope.children = [];

                $scope.$watch('viewer', function(){
                    if ($scope.viewer && $scope.viewer.scene) {
                        $scope.viewer.scene.addEventListener('loaded', function() {
                            walk();
                        });

                        walk();
                    }
                });

                $scope.$watch('showReferencePoints', function(){
                   if ($scope.viewer && $scope.viewer.scene) {
                       walk();
                   }
                });

                $scope.selectChild = function(child) {
                    $scope.viewer.zoomExtents(child.node);
                };

                $scope.changeVisibility = function(child) {
                    if (child.children.length >= 1 && child.children[0].type === 'Mesh') {
                        child.children[0].node.visible = !child.children[0].node.visible;
                    } else {
                        child.node.visible = !child.node.visible;
                    }
                };

                function walk()
                {
                    var root = {
                        node: $scope.viewer.scene,
                        children: [],
                        visible: true,
                        show: true
                    };

                    var counter = { value: 1};
                    inspect($scope.viewer.scene, root.children, counter, 0);

                    $scope.children = [];
                    for (var i = 0; i < root.children.length; i++) {
                        $scope.children.push(root.children[i]);
                    }
                }

                function inspect(node, data, counter, level){
                    if (node.children && node.children.length > 0) {
                        for (var i = 0; i < node.children.length; i++) {
                            var child = node.children[i];
                            var sceneChild = {
                                node: child,
                                type: null,
                                children: [],
                                visible: child.visible,
                                parent: node,
                                show: true
                            };
                            cleanName(sceneChild, child);

                            for (var t in threejs) {
                                if (child.constructor === threejs[t]) {
                                    sceneChild.type = t;
                                }
                                if (typeof(threejs[t]) === 'function' && child instanceof threejs[t]) {
                                    sceneChild.type = t;
                                }
                            }

                            // cleanup tree...
                            if ($scope.simplifyTree) {
                                // hide mesh
                                if (sceneChild.type === 'Mesh') {
                                    sceneChild.show = false;
                                }
                                // hide object3d without children
                                if (sceneChild.type === 'Object3D' && sceneChild.node.children.length === 0) {
                                    sceneChild.show = false;
                                }
                                // hide lights
                                if (sceneChild.type.indexOf('Light') > -1) {
                                    sceneChild.show = false;
                                }
                                // hide nodes with empty names
                                if (sceneChild.name === '') {
                                    sceneChild.show = false;
                                }

                                sceneChild.show = sceneChild.show && (!sceneChild.isReferencePoint || $scope.showReferencePoints);
                            }

                            data.push(sceneChild);

                            counter.value++;

                            if (level < 7) {
                                // the template using recursive ng-include directives
                                // this cause an Angular exception to be thrown when the databound tree is too deep
                                // this is a simple workaround for this situation for now (JAS 11/05/14)
                                inspect(child, sceneChild.children, counter, level + 1);
                            } else {
                                console.log('warning: 3D scene has too many levels');
                            }
                        }
                    }
                }

                function cleanName(sceneChild, child)
                {
                    var name = child.colladaId;

                    // Remove _NC_node + 8 following characters
                    // Remove GUID
                    if(name && typeof(name) === 'string' && name.indexOf('_NC_node') === 0) {
                        sceneChild.name = name.substring(16).replace(/[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}/i, '');
                    }

                    if(!sceneChild.name) {
                        sceneChild.name = String(child.id);
                    }

                    if (child.children.length === 1 && child.children[0].geometry) {
                        child.children[0].geometry.computeBoundingSphere();
                    }

                    sceneChild.isReferencePoint = child.children.length === 1 &&
                        child.children[0].geometry &&
                        child.children[0].geometry.boundingSphere &&
                        child.children[0].geometry.boundingSphere.radius < 5.0;
                }
            }
        };
    });