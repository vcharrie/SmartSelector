'use strict';
angular.module('bomModel.header',['gettext']).factory('BomHeader', ['gettextCatalog', function (gettextCatalog) {
 
  /**
   * Constructor
   */
  function Header(currency, isExpanded, displayTotal, displayColumnHeaders, messages, enableSorting) {
    this.columns = [];
    this.groups = [];
    this.currency = '';
	if (currency) {
		this.currency = currency;
	}
	this.isExpanded = isExpanded !== false;
    this.displayTotal = displayTotal !== false;
    this.displayColumnHeaders = displayColumnHeaders !== false;
    this.messages = {};
    if (messages) {
    	this.messages = messages;
	}
    this.language = '';
    this.enableSorting = enableSorting !== false;
  }
  
  /**
   * Get the currency symbol.
   *
   * @paramu cur : the currency symbol
   */
  Header.prototype.setCurrency = function (cur) {
	  this.currency = cur;
  };
  
  /**
   * Set the currency symbol.
   *
   * @return currency : the currency symbol
   */
  Header.prototype.getCurrency = function () {
	  return this.currency;
  };
 
  /**
   * Adds a group.
   *
   * @param group : {Group} group information.
   * @return boolean : true if success
   */
  Header.prototype.addGroup = function (group) {
	  this.groups.push(group);
	  return true;
  };
  
  /**
   * Gets a group by its index in the collection.
   *
   * @param groupIndex : {int} index corresponding to the group to get.
   * @return {Group} the group.
   */
  Header.prototype.getGroup = function (groupIndex) {
	  if (groupIndex < this.groups.length && groupIndex >= 0) {
          var group = this.groups[groupIndex];

          if (group !== undefined) {
              return group;
          } else {
          console.log('getGroup : Group to get should not be undefined.');
              return null;
          }
      }
      console.log('getGroup : index should be in the list bounds (>= 0, < groups.length = ' + this.groups.length + ').');
      return null;
  };
  
  /**
   * Removes a group from the collection.
   *
   * @param group : {Group} the group to remove.
   * @return boolean : true if success, false if index is outside the collection bounds
   */
  Header.prototype.removeGroup = function (group) {
	  var groupIndex = this.groups.indexOf(group);

      if (groupIndex < this.groups.length && groupIndex >= 0) {
              //splice rather than delete : delete would let an "undefined" element at its place
          this.groups.splice(groupIndex, 1);
          
          return true;
      }
      console.log('removegroup : index should be in the list bounds (>= 0, < groups.length = ' + this.groups.length + ').');
      return false;
  };
  
  /**
   * Removes a group from the collection by its index.
   *
   * @param groupIndex : {int} the index of the group to remove.
   * @return boolean : true if success, false if index is outside the collection bounds
   */
  Header.prototype.removeGroupByIndex = function (groupIndex) {

      if (groupIndex < this.groups.length && groupIndex >= 0) {
              //splice rather than delete : delete would let an "undefined" element at its place
          this.groups.splice(groupIndex, 1);
          
          return true;
      }
      console.log('removegroup : index should be in the list bounds (>= 0, < groups.length = ' + this.groups.length + ').');
      return false;
  };
 
  /**
   * Adds a column.
   *
   * @param column : {Column} column information.
   * @return boolean : true if success
   */
  Header.prototype.addColumn = function (column) {
	  this.columns.push(column);
	  return true;
  };
  
  /**
   * Gets a column by its index in the collection.
   *
   * @param groupIndex : {int} index corresponding to the column to get.
   * @return {Column} the column.
   */
  Header.prototype.getColumn = function (columnIndex) {
	  if (columnIndex < this.columns.length && columnIndex >= 0) {
          var column = this.columns[columnIndex];

          if (column !== undefined) {
              return column;
          } else {
          console.log('getColumn : Column to get should not be undefined.');
              return null;
          }
      }
      console.log('getColumn : index should be in the list bounds (>= 0, < columns.length = ' + this.columns.length + ').');
      return null;
  };
  
  /**
   * Removes a column from the collection.
   *
   * @param column : {Column} the column to remove.
   * @return boolean : true if success, false if index is outside the collection bounds
   */
  Header.prototype.removeColumn = function (column) {
	  var columnIndex = this.columns.indexOf(column);

      if (columnIndex < this.columns.length && columnIndex >= 0) {
              //splice rather than delete : delete would let an "undefined" element at its place
          this.columns.splice(columnIndex, 1);
          
          return true;
      }
      console.log('removecolumn : index should be in the list bounds (>= 0, < columns.length = ' + this.columns.length + ').');
      return false;
  };
  
  /**
   * Removes a column from the collection by its index.
   *
   * @param columnIndex : {int} the index of the column to remove.
   * @return boolean : true if success, false if index is outside the collection bounds
   */
  Header.prototype.removeColumnByIndex = function (columnIndex) {

      if (columnIndex < this.columns.length && columnIndex >= 0) {
              //splice rather than delete : delete would let an "undefined" element at its place
          this.columns.splice(columnIndex, 1);
          
          return true;
      }
      console.log('removecolumn : index should be in the list bounds (>= 0, < columns.length = ' + this.columns.length + ').');
      return false;
  };

  /**
    * Set messages used for custom translations.
    * @param messages message map.
    */
  Header.prototype.setMessages = function(messages) {
      this.messages = messages;
  };
  
  /**
    * Add a new message to the message map.
    * @param key the message key.
    * @param value the message value.
    */
  Header.prototype.addMessage = function(key, value) {
      this.messages[key] = value;
  };

  /**
   * jsonify the header object
   * 
   * @return the jsonified header
   */
  Header.prototype.jsonify = function () {
	  var headerToJson = {};
	  
	  headerToJson.columns = [];
	  
	  for (var i = 0; i < this.columns.length; i++) 
	  { 
	     var column = this.columns[i];
	     headerToJson.columns.push(column.jsonify());
	  } 
	  
	  headerToJson.groups = [];
	  
	  for (var j = 0; j < this.groups.length; j++) 
	  { 
	     var group = this.groups[j];
	     headerToJson.groups.push(group.jsonify());
	  } 
	  
	  headerToJson.currency = this.currency;
	  
	  headerToJson.displayTotal = this.displayTotal;
	  
	  headerToJson.displayColumnHeaders = this.displayColumnHeaders;
	  
	  headerToJson.messages = this.messages;
	  
	  this.language = gettextCatalog.currentLanguage;
	  headerToJson.language = this.language;
	  
	  return headerToJson;
  };
 
 
  /**
   * Return the constructor function
   */
  return Header;
}]);
