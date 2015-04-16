'use strict';

angular
    .module('drawing')
    .config(function($routeProvider) {
        $routeProvider.when('/compose',
            {
                controller: 'drawing-compose',
                templateUrl: 'modules/drawing/drawing.compose/drawing.compose.view.html'
            });
    })
    .controller('drawing-compose', function($scope, $timeout, $http, _, dialogService, logger, apiHelper, apiConstants) {
        var timeoutPromise = null;

        $scope.compositionStatus = '';
        $scope.isLoading = true;
        $scope.showReferencePoints = false;
        $scope.withTexture = false;

        $scope.compositionScript =
            '<switchboard>\n' +
            '   <enclosure reference="08202">\n' +
            '       <door reference="08232"/>\n' +
            '       <functionalUnit offset="0.0" reference="03030_03801_03232" orientation="HORIZONTAL">\n' +
            '           <device reference="LV431395" offset="0.0"/>\n' +
            '       </functionalUnit>\n' +
                '       <functionalUnit offset="250.0" reference="03001_03204" orientation="VERTICAL">\n' +
        '               <distribution reference="04000"/>\n' +
        '               <device reference="A9F73170" offset="0.0"/>\n' +
        '               <device reference="A9F73170" offset="2.0"/>\n' +
        '           </functionalUnit>\n' +
        '           <frontPlate reference="03808" offset="450.0"/>\n' +
        '           <frontPlate reference="03806" offset="1050.0"/>\n' +
            '   </enclosure>\n' +
            '   <enclosure reference="08272">\n' +
                '   <door reference="08282"/>\n' +
                '   <busbar reference="04161" length="1000.0" offset="350.0"/>\n' +
                '   <frontPlate reference="03817" offset="0.0"/>\n' +
                '   <frontPlate reference="03817" offset="450.0"/>\n' +
                '   <frontPlate reference="03817" offset="900.0"/>\n' +
            '   </enclosure>\n'+
            '    <enclosure reference="PRA10201">\n' +
                '       <door reference="PRA15113"/>\n' +
                '       <rail index="0">\n' +
                '           <device reference="A9F74170" offset="0"/>\n' +
                '           <device reference="A9F74170" offset="2"/>\n' +
                '       </rail>\n' +
                '   </enclosure>\n'+
            '   <canopy reference="08832"/>\n'+
            '</switchboard>\n';

        $scope.$watch('compositionScript', function(){
            // handler will be called for each key press, we wait 1s before loading the enclosure
            if ($scope.compositionScript) {
                if (timeoutPromise) {
                    $timeout.cancel(timeoutPromise);
                }
                timeoutPromise = $timeout(load, 1000);
            }
        });

        function logMessage(message, object) {
            var currentdate = new Date();
            var time = currentdate.getHours() + ':' + currentdate.getMinutes() + ':' + currentdate.getSeconds();
            var text = message;

            if (object) {
                if (object.message) {
                    text += ' (' + object.message.toLowerCase() + ')';
                }
                else {
                    text += ' (' + JSON.stringify(object) + ')';
                }
            }

            $scope.compositionStatus += '[' + time +  '] ' + text + '\n';
        }

        function load(){
            $scope.isLoading = true;
            logMessage('sending composition script');
            var api = 'compositionScript';
            if($scope.withTexture){
                api += 'V1.1';
            }
            $http.post(apiConstants[api], $scope.compositionScript).success(function(data){
                $scope.viewer3d.openCollada(data, 'http://10.195.163.217/');
                $scope.isLoading = false;
                logMessage('composition script loaded');
            }).error(function(err){
                $scope.isLoading = false;
                logMessage('composition failed', err);
                logger.warning('Composition script error', {}, 'Compose', true, 'Compose', { showUser: true });
            });
        }

        $scope.toggleCamera = function(){
            $scope.viewer3d.toggleCamera();
        };

        $scope.toggleBackgroundColor = function(){

            if($scope.viewer3d.renderer.getClearColor().getHex() === 0xffffff) {
                $scope.viewer3d.renderer.setClearColor(0x000000, 1);
            }
            else {
                $scope.viewer3d.renderer.setClearColor(0xffffff, 1);
            }
        };

        $scope.reload = function() {
            load();
        };
    });