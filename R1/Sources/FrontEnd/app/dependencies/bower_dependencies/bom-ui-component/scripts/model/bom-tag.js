'use strict';
angular.module('bomModel.tag',[]).factory('BomTag', function () {
 
  /**
   * Constructor
   */
  function Tag(property,value) {
	  if (property && value) {
		  this[property] = value;
	  } else {
		  this['default-tag-value'] = 'Others';
	  }
  }
  
  /**
   * jsonify the tag object
   * 
   * @return the jsonified tag
   */
  Tag.prototype.jsonify = function () {
	  return this;
  };
  
  
  /**
   * Return the constructor function
   */
  return Tag;
});