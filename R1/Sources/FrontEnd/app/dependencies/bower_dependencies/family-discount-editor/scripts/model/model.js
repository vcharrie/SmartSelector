'use strict';

// declare the module
var modelModule = angular.module('familyDiscountEditorModel', []);

modelModule.factory('familyDiscountFactory', function () {
 
  /**
   * Constructor
   */
  function FamilyDiscount(name, discount, description, validityStart, countryCode) {
	  this.familyCode = name;
	  this.value = discount;
	  this.description = description;
	  this.validityStart = validityStart;
	  this.countryCode = countryCode;
  }  
  
  /**
   * create an object for WS
   * 
   * @return the created object
   * @return the created object
   */
  FamilyDiscount.prototype.jsonForWS = function () {
	  var date = this.validityStart == null ? null : this.validityStart.getTime();
	  return new FamilyDiscount(this.familyCode, this.value, this.description, date, this.countryCode);
  };
  
  /**
   * Return the constructor function
   */
  return FamilyDiscount;
});