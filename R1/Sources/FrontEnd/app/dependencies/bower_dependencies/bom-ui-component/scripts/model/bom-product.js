'use strict';
angular.module('bomModel.product',[]).factory('BomProduct', function () {
 
  /**
   * Constructor
   */
  function Product(reference,description,quantity,discount,unitPrice,dataSheetUrl,pictureUrl) {
	this.reference = '';
	if (reference) {
		this.reference = reference;
	}
	this.description = '';
	if (description) {
		this.description = description;
	}
	this.quantity = getNumberOrZero(quantity);
	this.discount = getNumberOrZero(discount);
	this.unitPrice = getNumberOrZero(unitPrice);
	this.dataSheetUrl = '';
	if (dataSheetUrl) {
		this.dataSheetUrl = dataSheetUrl;
	}
	this.pictureUrl = '';
	if (pictureUrl) {
		this.pictureUrl = pictureUrl;
	}
    this.products = [];
  }
  
  function getNumberOrZero (numberInAnyType) {
	  var number;
	  if (typeof numberInAnyType === 'string') {
		  numberInAnyType = numberInAnyType.replace(/,/g, '.');
		  number = parseFloat(numberInAnyType);
	  } else if (numberInAnyType === null) {
		  number = 0;
	  } else {
		  number = numberInAnyType;
	  }
	  
	  if (isNaN(number)) {
		  return 0;
	  }
	  
	  return number;
  }
  
  /**
   * Adds a product.
   *
   * @param product : {Product} product information.
   * @return boolean : true if success
   */
  Product.prototype.addProduct = function (product) {
	  this.products.push(product);
	  return true;
  };
  
  /**
   * Gets a product by its index in the collection.
   *
   * @param productIndex : {int} index corresponding to the product to get.
   * @return {Product} the product.
   */
  Product.prototype.getProduct = function (productIndex) {
	  if (productIndex < this.products.length && productIndex >= 0) {
          var product = this.products[productIndex];

          if (product !== undefined) {
              return product;
          } else {
          console.log('getProduct : Product to get should not be undefined.');
              return null;
          }
      }
      console.log('getProduct : index should be in the list bounds (>= 0, < products.length = ' + this.products.length + ').');
      return null;
  };
  
  /**
   * Removes a product from the collection.
   *
   * @param product : {Product} the product to remove.
   * @return boolean : true if success, false if index is outside the collection bounds
   */
  Product.prototype.removeProduct = function (product) {
	  var productIndex = this.products.indexOf(product);

      if (productIndex < this.products.length && productIndex >= 0) {
              //splice rather than delete : delete would let an "undefined" element at its place
          this.products.splice(productIndex, 1);
          
          return true;
      }
      console.log('removeProduct : index should be in the list bounds (>= 0, < products.length = ' + this.products.length + ').');
      return false;
  };
  
  /**
   * Removes a product from the collection by its index.
   *
   * @param productIndex : {int} the index of the product to remove.
   * @return boolean : true if success, false if index is outside the collection bounds
   */
  Product.prototype.removeProductByIndex = function (productIndex) {

      if (productIndex < this.products.length && productIndex >= 0) {
              //splice rather than delete : delete would let an "undefined" element at its place
          this.products.splice(productIndex, 1);
          
          return true;
      }
      console.log('removeProductByIndex : index should be in the list bounds (>= 0, < products.length = ' + this.products.length + ').');
      return false;
  };
  
  /**
   * Calculates the price of a product.
   *
   * @return number : the price of the product
   */
  Product.prototype.getNetPrice = function () {
	  
	  if (this.products.length === 0) {
		  return Math.round(this.unitPrice * (1-this.discount) * this.quantity * 100) / 100;
	  } else {
		  var packPrice = 0;
		  var quantityOfPack = this.quantity;
			angular.forEach(this.products, function(product) {
				packPrice += (product.getNetPrice() * quantityOfPack);
			});
			return packPrice;
	  }
	  
  };
  
  /**
   * Calculates the price of a product.
   *
   * @return number : the price of the product
   */
  Product.prototype.getUnitNetPrice = function () {
	  return Math.round(this.unitPrice * (1-this.discount) * 100) / 100;
  };
  
  
  /**
   * jsonify the product object
   * 
   * @return the jsonified product
   */
  Product.prototype.jsonify = function () {
	  var productToJson = {};
	  
	  for (var key in this) {
		  productToJson[key] = this[key];
	  }
	  	  
	  if (this.products.length > 0) {
		  productToJson.products = [];
		  
		  for (var i = 0; i < this.products.length; i++) { 
		     var productInCollectionToJson = this.products[i].jsonify();
		     productToJson.products.push(productInCollectionToJson);
		  } 
	  }
	  
	  return productToJson;
  };
  
  /**
   * Return the constructor function
   */
  return Product;
});