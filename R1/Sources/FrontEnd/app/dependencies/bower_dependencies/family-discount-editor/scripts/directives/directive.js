angular.module('familyDiscountEditorDirective', [
	'serviceModule',
	'familyDiscountEditorModel',
	'ui.bootstrap',
	'angularSpinner',
	'familyDiscountEditorTemplates',
	'infinite-scroll',
	'gettext'
])
.directive('percent', function() {
  return {
    require: 'ngModel',
    link: function(scope, elm, attrs, ngModel) {
    	function fromUser(text) {
    		if (text !== '' && isNaN(text.replace(",", "."))) {
    			ngModel.$setValidity('percent', false);
    			return text;
    		} else {
    			if (Number(text) > 100 || Number(text) < 0) {
    				ngModel.$setValidity('percent', false);
    			} else {
    				ngModel.$setValidity('percent', true);
    			}
    			var value = new Big(Number(text.replace(",", "."))).div(Big(100));
    			return value;
    		}
    		
    	}

    	function toUser(text) {
    		var time = new Big(100);
    		var value = new Big(Number(text));
    		var valueToDisplay = value.times(time);
    	    return (valueToDisplay == 0 ? text : valueToDisplay);
    	}
    	ngModel.$parsers.push(fromUser);
    	ngModel.$formatters.push(toUser);
    }
  };
})
.directive('familyDiscountEditor', ['pricingServiceFactory', 'usSpinnerService', function(pricingServiceFactory, usSpinnerService) {
  return {
	restrict: 'E',
	scope: {
		cancelCallback: '&',
		submitSuccessCallback: '&',
		submitFailCallback: '&',
		displayStartDate: '=?',
        tableHeightInPixels: '@?'
	},
    templateUrl: 'views/family-discount-editor.view.html',
	link: function link(scope, element, attrs) {
		
		scope.columnsSize = {
				code : 'col-xs-3',
				description : 'col-xs-6',
				dateStart : 'col-xs-0',
				discount : 'col-xs-2',
				percent : 'col-xs-1'
		};
		
		scope.tableHeightInPixels = scope.tableHeightInPixels || '360px';
		angular.element('#pricingForm').css('height',scope.tableHeightInPixels);
		
		scope.displayStartDate = scope.displayStartDate || false;
		
		if (scope.displayStartDate) {
			scope.columnsSize.code = 'col-xs-2';
			scope.columnsSize.description = 'col-xs-4';
			scope.columnsSize.dateStart = 'col-xs-3';
			scope.columnsSize.discount = 'col-xs-2';
			scope.columnsSize.percent = 'col-xs-1';
		}
		
		
		scope.loading = true;
		
		scope.title = pricingServiceFactory.getTitle();
		
		scope.startSpinner = function(){
			scope.loading = true;
			usSpinnerService.spin('spinner-pricing');
		}
		
		scope.stopSpinner = function(){
			usSpinnerService.stop('spinner-pricing');
			scope.loading = false;
		}
	
		scope.emptyResults = false;
		scope.errors = false;
		scope.requestSaveMade = false;
		scope.failed = false;
		scope.datePickers = [];
		scope.minDate = new Date();

		scope.displayList = [];
		scope.lastFamilyIndex = 0;
		scope.range = 10;
		scope.families = [];
	
		pricingServiceFactory.getFamiliesWithDiscount(function(families) {
				scope.stopSpinner();
				scope.loading = false;
				scope.families = families;
				var height = parseInt($('#pricingForm').css('height'));
				var minFamiliesToDisplay = parseInt((height / 50));
				scope.emptyResults = (scope.families.length == 0);
				scope.datePickersManage();

				scope.lastIndexDisplayed = 0;
				scope.displayList = [];
				scope.addToDisplayList(minFamiliesToDisplay);
			}, 
			function() {
				scope.stopSpinner();
				scope.loading = false;
				scope.errors = true;
			});

		scope.addToDisplayList = function(minFamiliesToDisplay) {
			
			
			var nbFamiliesToLoad = scope.range;
			
			if (minFamiliesToDisplay) {
				nbFamiliesToLoad = Math.max(nbFamiliesToLoad, minFamiliesToDisplay);
			}
			
			var nbFamiliesNotDisplayed = scope.families.length - scope.lastIndexDisplayed;
			
			if (nbFamiliesNotDisplayed < scope.range) {
				nbFamiliesToLoad = nbFamiliesNotDisplayed;
			}
			
			var start; 
			if (scope.lastIndexDisplayed == 0) {
				if (scope.displayList.length > 0) {
					start = 1; 
				} else {
					start = 0;
				}
			} else {
				start = scope.lastIndexDisplayed +1;
			}
			var end = nbFamiliesToLoad + scope.lastIndexDisplayed;
			
			for(var i = start; i < end; i++){
				scope.displayList.push(scope.families[i]);
				scope.lastIndexDisplayed = i;
			}
		}
		
		scope.datePickersManage = function() {
			var datePickers = [];
			for (var i=0; i<scope.families.length; i++) {
				datePickers.push({opened:false});
			}
			scope.datePickers = datePickers;
		};
		
		scope.cancelClicked = function() {
			scope.cancelCallback();
		};


		scope.open = function($event, $index) {
			$event.preventDefault();
			$event.stopPropagation();
			scope.datePickers[$index].opened = true;
		};
		
		scope.dateOptions = {
			formatYear: 'yy',
			startingDay: 1
		};
		
		scope.submitClicked = function() {
			var familiesToSave = [];
			angular.forEach(scope.families, function(value, key) {
			  this.push(value.jsonForWS());
			}, familiesToSave);
			
			angular.element('#pricingForm').scrollTop(0);
			
			scope.requestSaveMade = true;
			scope.failed = false;
			scope.startSpinner();
			
			pricingServiceFactory.saveFamilies(familiesToSave, function() {
				scope.stopSpinner();
				scope.submitSuccessCallback();
			}, function() {
				scope.stopSpinner();
				scope.failed = true;
				scope.submitFailCallback();
			});
		};
	}
  };
}]);