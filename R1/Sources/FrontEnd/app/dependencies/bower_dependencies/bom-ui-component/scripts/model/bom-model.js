'use strict';
angular.module('bomModel.bomModel',[]).factory('BomModel',['BomContentContainer', function (BomContentContainer) {
 
  /**
   * Constructor
   */
  function Model(currencyCode) {
	this.currencyCode = '';
	if (currencyCode) {
		this.currencyCode = currencyCode;
	}
	this.content = new BomContentContainer();
  }
  
  /**
   * jsonify the model object
   * 
   * @return the jsonified model
   */
  Model.prototype.jsonify = function () {
	  var modelToJson = {};
	  
	  modelToJson.currencyCode = this.currencyCode;
	  modelToJson.content = this.content.jsonify();
	  
	  return modelToJson;
  };
  
  /**
   * Sets currencyCode
   * 
   * @param currencyCode The currency code to set
   */
  Model.prototype.setCurrencyCode = function (cur) {
	  this.currencyCode = cur;
  };
  
  
  /**
   * Gets currencyCode
   * 
   * @return the current currencyCode
   */
  Model.prototype.getCurrencyCode = function () {
	  return this.currencyCode;
  };
  
  
  /**
   * Adds a content.
   *
   * @param content : {Content} content information.
   * @return boolean : true if success
   */
  Model.prototype.addContent = function (content) {
	  return this.content.addContent(content);
  };
  
  
  /**
   * Return the constructor function
   */
  return Model;
}]);