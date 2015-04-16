'use strict';
angular.module('bomModel.group',[]).factory('BomGroup', function () {
 
  /**
   * Constructor
   */
  function Group(tag,displayTotal,displayColumnHeaders,accordion) {
 	this.tag = '';
	if (tag) {
		this.tag = tag;
	}
	this.displayColumnHeaders = displayColumnHeaders ? displayColumnHeaders === true : false;
	this.accordion = accordion ? accordion === true : false;
	this.displayTotal = displayTotal !== false;
  }
  
  
  /**
   * jsonify the group object
   * 
   * @return the jsonified group
   */
  Group.prototype.jsonify = function () {
	  return this;
  };
  
  
  /**
   * Return the constructor function
   */
  return Group;
});