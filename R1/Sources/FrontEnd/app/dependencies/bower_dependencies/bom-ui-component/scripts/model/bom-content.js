'use strict';
angular.module('bomModel.content',[]).factory('BomContent', function () {
 
  /**
   * Constructor
   */
  function Content(bomProduct,bomTag) {
	this.bomTag = {};
	if (bomTag) {
		this.bomTag = bomTag;
	}
	
	this.bomProduct = null;
	if (bomProduct) {
		this.bomProduct = bomProduct;
	}
  }
  
  /**
   * Adds a tag
   * 
   */
  Content.prototype.addTag = function (key,value) {
	  if (key && value) {
		  this.bomTag[key] = value;
	  }
  };
  
  /**
   * jsonify the content object
   * 
   * @return the jsonified content
   */
  Content.prototype.jsonify = function () {
	  var contentToJson = {};
	  
	  if (this.bomProduct !== null) {
		  contentToJson.product = this.bomProduct.jsonify();
	  }
	  
	  contentToJson.tags = this.bomTag;
	  
	  return contentToJson;
  };
  
  
  /**
   * Return the constructor function
   */
  return Content;
});