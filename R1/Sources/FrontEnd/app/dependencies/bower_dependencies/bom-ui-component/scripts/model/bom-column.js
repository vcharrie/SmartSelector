'use strict';
angular.module('bomModel.column',[]).factory('BomColumn', function () {
 
  /**
   * Constructor
   */
  function Column(colId, label,type,hasTotal) {
    this.id = colId;
    this.label = label;
    this.type = type;
    this.hasTotal = hasTotal ? hasTotal === true : false;
  }
  
  /**
   * jsonify the column object
   * 
   * @return the jsonified column
   */
  Column.prototype.jsonify = function () {
	  return this;
  };
  
 
  /**
   * Return the constructor function
   */
  return Column;
});