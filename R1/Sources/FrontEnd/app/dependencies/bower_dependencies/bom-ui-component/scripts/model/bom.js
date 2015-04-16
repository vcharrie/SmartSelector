'use strict';
angular.module('bomModel.bom',['underscore','bomModel.header','bomModel.bomModel','bomModel.content','bomModel.product','bomModel.tag']).factory('Bom', ['BomHeader','BomModel','BomContent','BomProduct','BomTag', 'BomColumn','BomGroup','_',
                                                                                      function (BomHeader,BomModel,BomContent,BomProduct,BomTag,BomColumn,BomGroup,_) {
 
  /**
   * Constructor
   */
  function Bom(header,model) {
	this.header = new BomHeader();
	if (header) {
		this.header = header;
	}
	this.model = new BomModel();
	if (model) {
		this.model = model;
	}
  }
  
  /**
   * jsonify the bom object
   * 
   * @return jsonified bom
   */
  Bom.prototype.jsonify = function () {
	  var bomJson ={};
	  
	  // Header part
	  bomJson.header = this.header.jsonify();
	  
	  // Content part
	  bomJson.bom = this.model.jsonify();
	  
	  //console.log(JSON.stringify(bomJson));
	  
	  return bomJson;
  };
  
  /**
   * Adds a column to the header.
   *
   * @param column : {Column} column information.
   * @return boolean : true if success
   */
  Bom.prototype.addColumn = function (column) {
	  return this.header.addColumn(column);
  };
  
  /**
   * Adds a group to the header.
   *
   * @param group : {Group} group information.
   * @return boolean : true if success
   */
  Bom.prototype.addGroup = function (group) {
	  return this.header.addGroup(group);
  };
  
  /**
   * Adds a Product.
   *
   * @param product : {Product} product to add.
   * @return boolean : true if success
   */
  Bom.prototype.addProduct = function (bomProduct, tag) {
	  if (!tag) {
		  tag = {};
	  }
	  return this.model.addContent(new BomContent(bomProduct,tag));
  };
  
  /**
   * Gets list of products for a specific tag.
   *
   * @param tag : the tag to search.
   * @return list : list of products matching this tag
   */
  Bom.prototype.getProductsForTag = function (property,value) {
	  return this.model.content.getProductsForTag(property,value);
  };
  
  /**
   * Calculates the total price of the products in the content for a specific tag.
   *
   * @return number : the total price for this tag
   */
  Bom.prototype.getTotalForTag = function (tagName, tagValue) {
	  return this.model.content.getTotalForTag(tagName, tagValue);
  };
  
  /**
   * Sets currencyCode
   * 
   * @param currencyCode The currency code to set
   */
  Bom.prototype.setCurrencyCode = function (cur) {
	  this.model.setCurrencyCode(cur);
  };
  
  /**
   * Gets currencyCode
   * 
   * @return the current currencyCode
   */
  Bom.prototype.getCurrencyCode = function () {
	  return this.model.getCurrencyCode();
  };
  
  /**
   * Gets currency
   * 
   * @return the current currencyCode
   */
  Bom.prototype.getCurrency = function () {
	  return this.header.getCurrency();
  };
  
  /**
  * Sets currency
  * 
  * @param the new currency
  */
 Bom.prototype.setCurrency = function (currency) {
	  return this.header.setCurrency(currency);
 };
  
  /**
   * Calculates the total price of the products in the content.
   *
   * @return number : the total price for this tag
   */
  Bom.prototype.getTotalPrice = function () {
	  return this.model.content.getTotal();
  };
  
  /**
   * Clear the bom content.
   *
   * @return number : the total price for this tag
   */
  Bom.prototype.clearContent = function () {
	  this.model.content.clear();
  };
  
  
  /**
   * read a json to set the bom
   *
   * @return result of setting
   */
  Bom.prototype.readJsonOrString = function (input) {
	  
	  // json is valid
	  if (checkJson(input)) {
		  var jsonObject = JSON.parse(input);
		  
		  //Sets the header
		  this.setHeader(jsonObject.header);
		  
		  this.setCurrencyCode(jsonObject.bom.currencyCode);
		  
		  //clear content first
		  this.clearContent();
		  
		  angular.forEach(jsonObject.bom.content, function(cnt) {
			  var product = cnt.product;
			  var bomProductToAdd = createBomProduct(product);
			  if (product.hasOwnProperty('products')) {
				  var products = product.products;
				  angular.forEach(products, function(subProduct) {
					  this.addProduct(createBomProduct(subProduct));
				  }, bomProductToAdd);
			  }	
			  var tag ={};
			  if (cnt.hasOwnProperty('tags')) {
				  for(var key in cnt.tags){
				      tag[key] = cnt.tags[key];
				   }
			  }	
			  this.addProduct(bomProductToAdd,tag);
		  },this);
		  
		  return true;
	  }
	  // json is not valid
	  else {
		  return false;
	  }
  };
  
  /**
  * Set the header.
  *
  * @param header : header to set
  */
  Bom.prototype.setHeader = function(header) {
	  // Create new header with currency and displayTotal
	  this.header = new BomHeader(header.currency, header.isExpanded, header.displayTotal,header.displayColumnHeaders,header.messages,header.enableSorting);
	  
	  // Add columns
	  angular.forEach(header.columns, function(col) {
		  var column = new BomColumn(col.id,col.label,col.type,col.hasTotal);
		  this.addColumn(column);
	  }, this.header);
	  
	// Add groups
	  angular.forEach(header.groups, function(grp) {
		  var group = new BomGroup(grp.tag,grp.displayTotal,grp.displayColumnHeaders,grp.accordion);
		  this.addGroup(group);
	  }, this.header);
	  
  };
  
  /**
   * Create a bom Product.
   *
   * @param jsonProduct json object
   * @return bomProoduct : the json converted into bomProduct object
   */
  function createBomProduct(jsonProduct) {
	  var reference = '';
	  var description = '';
	  var quantity = '';
	  var discount = '';
	  var unitPrice = '';
	  var dataSheetUrl = '';
	  var picture = '';
	  var optionalColumns = [];
	  for (var key in jsonProduct) {
		  if (key == 'reference') {
			  reference = jsonProduct.reference;
		  }
		  if (key == 'description') {
			  description = jsonProduct.description;
		  }
		  if (key == 'quantity') {
			  quantity = jsonProduct.quantity;
		  }
		  if (key == 'discount') {
			  discount = jsonProduct.discount;
		  }
		  if (key == 'unitPrice') {
			  unitPrice = jsonProduct.unitPrice;
		  }
		  if (key == 'dataSheetUrl') {
			  dataSheetUrl = jsonProduct.dataSheetUrl;
		  }
		  if (key == 'pictureUrl') {
			  picture = jsonProduct.pictureUrl;
		  }
		  if (key != 'reference' && key != 'description' && key != 'quantity' && key != 'discount' && key != 'unitPrice'
			  && key != 'dataSheetUrl' && key != 'pictureUrl' && key != 'products') {
			  optionalColumns.push(key);
		  }
	  }
	  
	  var bomProductToAdd = new BomProduct(reference,description,quantity,discount,unitPrice,dataSheetUrl,picture);
	  
	  angular.forEach(optionalColumns, function(key, idx) {
		  bomProductToAdd[key] = jsonProduct[key];
		  
	  });
	  
	  return bomProductToAdd;
  }
  
  function checkJson(input) {
	// if the input is a string we try to convert it in json object
	  var inputToTest = input;
	  if (typeof inputToTest === 'string') {
		  try {
			  inputToTest = JSON.parse(inputToTest);
		  } 
		  // if the conversion failed
		  catch(err){
			  return false;
		  }
		  
	  }
	  
	  // if we have on object we check deeper
	  if (typeof inputToTest === 'object') {
		  if (inputToTest.hasOwnProperty('header') && inputToTest.hasOwnProperty('bom')) {
			  return (checkHeader(inputToTest.header) && checkBom(inputToTest.bom));
		  } else {
			  return false;
		  }
	  } else {
		  return false;
	  }
  }
  
  function checkHeader(header) {
	  var columnsOk = (header.hasOwnProperty('columns') && checkHeaderColumns(header.columns));
	  var currencyOk = (header.hasOwnProperty('currency') && checkHeaderCurreny(header.currency));

	  return (columnsOk && currencyOk);
  }
  
  function checkHeaderColumns(columns) {
	  var isOk = Array.isArray(columns);
	  angular.forEach(columns, function(column) {
		  if (!column.hasOwnProperty('label')) {
			  isOk = false;
		  }
	  });
	  
	  return isOk;
	  
  }
  
  function checkHeaderCurreny(currency) {
	  return (typeof currency === 'string' && currency.length > 0);
  }
  
  function checkBom(bom) {
	  if (bom.hasOwnProperty('content') && bom.hasOwnProperty('currencyCode')) {
		  return (checkBomContent(bom.content) && checkBomCurrencyCode(bom.currencyCode));
	  } 
	  // bom object is invalid
	  else {
		  return false;
	  }
  }
  
  function checkBomContent(content) {
	  var isOk = Array.isArray(content);
	  angular.forEach(content, function(product) {
		  if (!product.hasOwnProperty('product')){
			  isOk = false;
		  }
	  });
	  return isOk;
  }
  
  function checkBomCurrencyCode(currencyCode) {
	  return (typeof currencyCode === 'string' && currencyCode.length > 0);
  }
  
  /**
   * Gets the list of products sorted by tag name and tag value.
   * 
   * @return result : the list of results
   */
  Bom.prototype.getSortedList = function (key,growingSens) {
	var result = this.createRowsForLevel(this.header.groups,this.model.content.contents,0,key,growingSens);
	return result;
  };
  
  /**
   * Create rows for a level of tag
   * 
   * @return result : the list of results for this level
   */
  Bom.prototype.createRowsForLevel = function (tagNames, content,level,key,growingSens) {
	  var result = [];
	  if (tagNames.length === 0) {
		  if (typeof key !== "undefined" && typeof growingSens !== "undefined") {
			  var resultSorted = _.sortBy(content, function(product){ 
				  if (product.bomProduct.products.length > 0){
					  if (key == 'NET_PRICE') {
						  return product.bomProduct.quantity*product.bomProduct.products[0].getNetPrice();
					  }
					  if (key == 'UNIT_NET_PRICE') {
						  return (1-product.bomProduct.products[0].discount)*product.bomProduct.products[0].unitPrice;
					  }
					  if (key == 'quantity') {
						  return product.bomProduct.quantity*product.bomProduct.products[0].quantity;
					  }
					  return product.bomProduct.products[0][key]; 
				  }
				  if (key == 'NET_PRICE') {
					  return product.bomProduct.getNetPrice();
				  }
				  if (key == 'UNIT_NET_PRICE') {
					  return (1-product.bomProduct.discount)*product.bomProduct.unitPrice;
				  }
				  return product.bomProduct[key]; 
			  });
			  
			  if (growingSens == false) {
				  resultSorted.reverse();
			  }
			  
			  content = resultSorted;
		  }

		  angular.forEach(content, function(productToInsert,index) {
			  var products = {};
			  products.title = '';
			  products.customClass = 'bom-custom-attribute-level-'+level;
			  products.level = level;
			  products.products = productToInsert;
			  products.index = index;
			  result.push(products);
		  }, this);
		  
		  return result;
	  }
	  
	  var tagName = _.first(tagNames);
	  var rows = _.map(_.groupBy(content, function(product){ 
			return product.bomTag[tagName.tag];
		}), function(val, key){ 
			var row ={};
			row.title = key;
			if (key==='undefined') {
				row.title = 'Others';
		  	}
			row.displayTitle = tagName.displayColumnHeaders;
			row.products = val;
			row.amount = makeSubTotal(row.products);
			row.level = level;
			row.customClass = 'bom-custom-attribute-level-'+level;
			if (tagName.accordion === true) {
				row.accordion = true;
			}
			return row;
		});
	  angular.forEach(rows, function(rowToInsert) {
			result.push(rowToInsert);
			result = result.concat(this.createRowsForLevel(_.rest(tagNames), rowToInsert.products, (level+1),key,growingSens));
			if (tagName.displayTotal) {
				  var row ={};
				  row.title= '';
				  row.subtotal = 'Sub total';
				  row.amount = makeSubTotal(rowToInsert.products);
				  row.customClass = 'bom-custom-attribute-level-'+(level+1);
				  row.displayTitle = false;
				  row.products = content;
				  row.level = level;
				  result.push(row);
			  }
		}, this);
	  
	  
	  return result;
  };
  
  function makeSubTotal(products) {
	  var sum = 0;
	  
	  angular.forEach(products, function(product) {
		  sum += product.bomProduct.getNetPrice();

		});
	  return sum;
  }
  
  /**
   * Sort products according to key and sens.
   * 
   */
  Bom.prototype.sortProducts = function (key,growingSens) {
	  var result = _.sortBy(this.model.content.contents, function(content){ 
		  if (content.bomProduct.products.length > 0){
			  if (key == 'NET_PRICE') {
				  return content.bomProduct.quantity*content.bomProduct.products[0].getNetPrice();
			  }
			  return content.bomProduct.products[0][key]; 
		  }
		  if (key == 'NET_PRICE') {
			  return content.bomProduct.getNetPrice();
		  }
		  return content.bomProduct[key]; 
	  });
	  
	  if (!growingSens) {
		  result.reverse();
	  }
	  
	  this.model.content.contents = result;
  };
  
  /**
  * Sort columns
  * 
  *@param order : the order to set
  */
 Bom.prototype.reorderColumns = function (order) {
	  var orderArray = order.split(',');
	  if (orderArray.length == this.header.columns.length) {
			
			var currentColIndex = 0;
			
			while (currentColIndex < orderArray.length) {
				if (orderArray.indexOf(this.header.columns[currentColIndex].id) === -1) {
					this.header.columns.splice(this.header.columns.length-1, 0, this.header.columns.splice(currentColIndex, 1)[0]);
				}
				else if (orderArray[currentColIndex] === this.header.columns[currentColIndex].id) {
					currentColIndex++;
				}
				else {
					var indexOfCol = -1;
					// Is the cookie column in the json columns ?
					angular.forEach(this.header.columns, function(header,index) {
						if (header.id === orderArray[currentColIndex]){
							indexOfCol = index;
						}
					});
					if (indexOfCol === -1) {
						currentColIndex++;
					}
					this.header.columns.splice(currentColIndex, 0, this.header.columns.splice(indexOfCol, 1)[0]);
				}
			}
	  }
 };
  
  
  /**
   * Return the constructor function
   */
  return Bom;
}]);