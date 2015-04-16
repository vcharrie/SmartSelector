'use strict';

angular
    .module('shared')
    .controller('discovers', function ($scope, $modalInstance, discoversRestService, language, discoverId, apiConstants) {

        //Right side scope var
        $scope.mainDiscover = {};
        $scope.whatsNewDiscover = {};

        //Left side scope var
        $scope.selectedDiscover = {};

        $scope.discoversList = [];

        $scope.selectedDiapositive = {};
        $scope.selectedDocumentLink = null;
        $scope.selectedDiscoverLink = {};

        $scope.close = function () {
            $modalInstance.close();
        };

        $scope.selectDiscover = function (discover) {
            discoversRestService.getDetailedDiscover(language, discover.id).then(function (data) {

                $scope.selectedDocumentLink = null;
                var diapositive = [];
                //add path to png diapositive
                data.forEach(function (diap) {
                    if (diap.capture) {
                        diap.fullPath = apiConstants.baseUri + '/discovers/' + language + '/' + discover.id + '/' + diap.capture;
                        diapositive.push(diap);
                    }
                    if (diap.documentSource) {
                        $scope.selectedDocumentLink = apiConstants.baseUri + '/discovers/' + language + '/' + discover.id + '/' + diap.documentSource;
                    }
                });
                $scope.selectedDiscover = diapositive;

                $scope.selectedDiapositive = $scope.selectedDiscover[0];
                $scope.selectedDiscoverLink = discover;
            });
        };

        $scope.isSelectedDiscover = function (discover) {
            return $scope.selectedDiscoverLink === discover;
        };

        var init = function () {
            discoversRestService.getDiscovers(language).then(function (data) {

                if (Object.prototype.toString.call(data) === '[object Array]') {
                    var localDiscoverId = -1;
                    if (discoverId !== undefined) {
                        localDiscoverId = discoverId;
                    }
                    $scope.mainDiscover = {};
                    $scope.discoversList = [];
                    data.forEach(function (discover) {

                        discover.mainPictureFullPath = apiConstants.baseUri + '/discovers/' + language + '/' + discover.id + '/' + discover.mainPicture;
                        if (discover.order === -1) {
                            $scope.mainDiscover = discover;
                        }
                        else if (discover.order === -2) {
                            $scope.whatsNewDiscover = discover;
                        }
                        else {
                            $scope.discoversList.push(discover);
                        }
                        if (localDiscoverId === discover.order) {
                            $scope.selectDiscover(discover);
                        }
                    });
                }

                $('#carouselDiscover').on('slid.bs.carousel', function () {
                    var currentIndex = $('div.active').index();
                    $scope.selectedDiapositive = $scope.selectedDiscover[currentIndex];
                    $scope.$apply();
                });
            });


        };


        init();
    });
// Code here will be linted with JSHint.
/* jshint ignore:start */

// PFR to remove bug on caroussel
angular.module('ui.bootstrap.carousel', ['ui.bootstrap.transition'])
    .controller('CarouselController', ['$scope', '$timeout', '$transition', '$q', function ($scope, $timeout, $transition, $q) {
    }]).directive('carousel', [function () {
        return {};
    }]);

// Code here will be ignored by JSHint.
/* jshint ignore:end */