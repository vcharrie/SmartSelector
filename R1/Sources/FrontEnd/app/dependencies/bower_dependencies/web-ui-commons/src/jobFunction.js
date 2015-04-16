angular.module('jobFunctionSelect', [])
    .controller('jobFunctionController', ['$scope', 'gettext', "gettextCatalog", function($scope, gettext, gettextCatalog) {
        function initJobFunctions() {
            $scope.jobFunctions = [
                {code: 'Z001', name: gettextCatalog.getString('Purchasing - Procurement')},
                {code: 'Z002', name: gettextCatalog.getString('Sales')},
                {code: 'Z003', name: gettextCatalog.getString('IT')},
                {code: 'Z004', name: gettextCatalog.getString('Human Resources /Training')},
                {code: 'Z005', name: gettextCatalog.getString('Executive')},
                {code: 'Z006', name: gettextCatalog.getString('Finance')},
                {code: 'Z007', name: gettextCatalog.getString('Facilities/Installation/Maintenance/Repair')},
                {code: 'Z008', name: gettextCatalog.getString('Engineering')},
                {code: 'Z009', name: gettextCatalog.getString('Manufacturing / Production / Operations')},
                {code: 'Z010', name: gettextCatalog.getString('Marketing')},
                {code: 'Z011', name: gettextCatalog.getString('Installation/Maintenance/Repair')},
                {code: 'Z012', name: gettextCatalog.getString('Quality Assurance / Quality Control')},
                {code: 'Z013', name: gettextCatalog.getString('Education')},
                {code: 'Z014', name: gettextCatalog.getString('Research & Development / Science')},
                {code: 'Z015', name: gettextCatalog.getString('Distribution/Supply Chain/Logistics')},
                {code: 'Z016', name: gettextCatalog.getString('Accounting')},
                {code: 'Z017', name: gettextCatalog.getString('Administrative/Clerical')},
                {code: 'Z018', name: gettextCatalog.getString('Business Development/Acquisitions')},
                {code: 'Z019', name: gettextCatalog.getString('Construction')},
                {code: 'Z020', name: gettextCatalog.getString('Consultant')},
                {code: 'Z021', name: gettextCatalog.getString('Customer Service / Client Care')},
                {code: 'Z022', name: gettextCatalog.getString('Electrician')},
                {code: 'Z023', name: gettextCatalog.getString('Energy Management')},
                {code: 'Z024', name: gettextCatalog.getString('Investor Relations')},
                {code: 'Z025', name: gettextCatalog.getString('Legal')},
                {code: 'Z026', name: gettextCatalog.getString('Medical')},
                {code: 'Z027', name: gettextCatalog.getString('Other')},
                {code: 'Z028', name: gettextCatalog.getString('Project Management')},
                {code: 'Z029', name: gettextCatalog.getString('Reseller/VAR')},
                {code: 'Z030', name: gettextCatalog.getString('Safety')},
                {code: 'Z031', name: gettextCatalog.getString('Security / Protective Services')},
                {code: 'Z032', name: gettextCatalog.getString('Strategy - Planning')},
                {code: 'Z033', name: gettextCatalog.getString('System Integrator')},
                {code: 'Z034', name: gettextCatalog.getString('Telecommunications')}
            ];
        }
        initJobFunctions();
        $scope.$on('gettextLanguageChanged', initJobFunctions);
    }])
    .directive('jobFunctionSelect', ['$parse', function ($parse) {
        return {
            restrict: 'E',
            template: '<select><option ng-repeat="job in jobFunctions" value="{{job.code}}">{{job.name}}</option></select>',
            replace: true,
            controller: 'jobFunctionController'
        };
    }]);