'use strict';
angular.module('bomModel.content.container',[]).factory('BomContentContainer', function () {
 
  /**
   * Constructor
   */
  function ContentContainer() {
	  this.contents = [];
  }
  
  /**
   * Get list of products matching a tag
   * 
   * @param tag : {String} the tag to match.
   * @return list of products matching the tag
   */
  ContentContainer.prototype.getProductsForTag = function (property,value) {
	  var list = [];
	  
	  for (var i = 0; i < this.contents.length; i++) 
	  { 
	     var content = this.contents[i];
	     var tag = content.bomTag;
	     if (tag !== null && tag.hasOwnProperty(property) && tag[property] === value) {
	    	 var product = content.bomProduct;
	    	 list.push(product);
	     }
	  } 
	  return list;
  };
  
  /**
   * Get list of products matching a tag
   * 
   * @param tag : {String} the tag to match.
   * @return list of products matching the tag
   */
  ContentContainer.prototype.getSortedList = function () {
	  var list = [];
	  var tmpList = [];
	  
	  for (var i = 0; i < this.contents.length; i++) 
	  { 
	     var content = this.contents[i];
	     var tag = content.bomTag;
	     if (tag !== null) {
	    	 var tagValue;
	    	 var tagName;
	    	 for(var property in tag) {
	    		 tagValue = tag[property];
	    		 tagName = property;
	    		 break;
  			 }
	    	 if (!tmpList.hasOwnProperty(tagName)) {
	    		 tmpList[tagName] = [];
	    	 }
	    	 if (!tmpList[tagName].hasOwnProperty(tagValue)) {
	    		 tmpList[tagName][tagValue] = [];
	    	 }
	    	 var product = content.bomProduct;
	    	 tmpList[tagName][tagValue].push(product);
	     }
	  } 
	  
	  for(var propertyName in tmpList) {
		  for(var title in tmpList[propertyName]) {
			  var newResult = {
					  tag: propertyName,
					  title : title,
					  list : tmpList[propertyName][title]
			  };
			  list.push(newResult);
		  }
	  }

	  return list;
  };
  
  /**
   * Adds a content.
   *
   * @param content : {Content} content information.
   * @return boolean : true if success
   */
  ContentContainer.prototype.addContent = function (content) {
	  this.contents.push(content);
	  return true;
  };
  
  /**
   * Gets a content by its index in the collection.
   *
   * @param contentIndex : {int} index corresponding to the content to get.
   * @return {Content} the content.
   */
  ContentContainer.prototype.getContent = function (contentIndex) {
	  if (contentIndex < this.contents.length && contentIndex >= 0) {
          var content = this.contents[contentIndex];

          if (content !== undefined) {
              return content;
          } else {
          console.log('getContent : Content to get should not be undefined.');
              return null;
          }
      }
      console.log('getContent : index should be in the list bounds (>= 0, < contents.length = ' + this.contents.length + ').');
      return null;
  };
  
  /**
   * Removes a content from the collection.
   *
   * @param content : {Content} the content to remove.
   * @return boolean : true if success, false if index is outside the collection bounds
   */
  ContentContainer.prototype.removeContent = function (content) {
	  var contentIndex = this.contents.indexOf(content);

      if (contentIndex < this.contents.length && contentIndex >= 0) {
              //splice rather than delete : delete would let an "undefined" element at its place
          this.contents.splice(contentIndex, 1);
          
          return true;
      }
      console.log('removeContent : index should be in the list bounds (>= 0, < contents.length = ' + this.contents.length + ').');
      return false;
  };
  
  /**
   * Removes a content from the collection by its index.
   *
   * @param contentIndex : {int} the index of the content to remove.
   * @return boolean : true if success, false if index is outside the collection bounds
   */
  ContentContainer.prototype.removeContentByIndex = function (contentIndex) {

      if (contentIndex < this.contents.length && contentIndex >= 0) {
              //splice rather than delete : delete would let an "undefined" element at its place
          this.contents.splice(contentIndex, 1);
          
          return true;
      }
      console.log('removeContentByIndex : index should be in the list bounds (>= 0, < contents.length = ' + this.contents.length + ').');
      return false;
  };
  
  /**
   * Calculates the total price of the products in the content.
   *
   * @return number : the total price
   */
  ContentContainer.prototype.getTotal = function () {
	  var total = 0;
	  
	  for (var i = 0; i < this.contents.length; i++) 
	  { 
	     var content = this.contents[i];
	     var product = content.bomProduct;
	     total += product.getNetPrice();
	  } 
	  
	  return total;
  };
  
  /**
   * Calculates the total price of the products in the content for a specific tag.
   *
   * @return number : the total price for this tag
   */
  ContentContainer.prototype.getTotalForTag = function (property,value) {
	  var total = 0;

	  var list = this.getProductsForTag(property,value);

	  for (var i = 0; i < list.length; i++) 
	  { 
	     var product = list[i];
	     total += product.getNetPrice();
	  } 
	  
	  return total;
  };
  
  
  /**
   * jsonify the contentContainer object
   * 
   * @return the jsonified contentContainer
   */
  ContentContainer.prototype.jsonify = function () {
	  var contentContainerToJson = [];
	  
	  for (var i = 0; i < this.contents.length; i++) 
	  { 
	     var content = this.contents[i];
	     contentContainerToJson.push(content.jsonify());
	  } 
	  
	  return contentContainerToJson;
  };

  
  /**
   * Clear the bom content.
   *
   * @return number : the total price for this tag
   */
  ContentContainer.prototype.clear = function () {
	  while(this.contents.length > 0) {
		  this.contents.pop();
	  }
  };
  
  
  /**
   * Return the constructor function
   */
  return ContentContainer;
});