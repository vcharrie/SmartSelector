'use strict';

angular
    .module('shared')
    .controller('solutionWishesEdition', function ($scope, $modalInstance, Project, searchSolution) {

        $scope.characteristics = [];

        var switchboard = Project.current.selectedSwitchboard;
        for(var wish in switchboard.enclosureSolutionWishes) {
            if (switchboard.enclosureSolutionWishes.hasOwnProperty(wish)) {
                $scope.characteristics.push(switchboard.enclosureSolutionWishes[wish]);
            }
        }

        $scope.cancel = function () {
            $modalInstance.close();
        };

        $scope.ok = function () {
            $modalInstance.close();

            switchboard.clearEnclosureSolutionWishes();
            searchSolution();
        };
    });
