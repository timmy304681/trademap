const productModel = require('../models/products_model');
const { getDistance, getImagePath } = require('../util/util');
const cache = require('../util/cache');

const pageSize = 6;

async function findProducts(category, query, paging) {
  const findActions = {
    all: getAllProducts,
    suggest: getSuggestProducts,
    autoCompleteSearch: getAutoCompleteSearchProducts,
    search: getSearchProducts,
    details: getProductDetails,
  };
  if (findActions[category]) {
    return findActions[category](query, paging);
  }
  return Promise.resolve({});
}

function getAllProducts(query, paging) {
  return productModel.getProductsByPaging(pageSize, paging);
}

async function getSuggestProducts(query, paging) {
  let products = await productModel.getProducts();
  const { lat, lng } = query;

  products.forEach((location) => {
    const relativeDistance = getDistance(location.lat, location.lng, lat, lng, 'K');
    location.distance = relativeDistance;
    location.photo = getImagePath(location.photo);
    location.image = getImagePath(location.image);
  });
  products.sort((a, b) => a.distance - b.distance); // sort data by distance
  products = products.slice(pageSize * (paging - 1), pageSize * (paging - 1) + pageSize);
  return products;
}

async function getAutoCompleteSearchProducts(query, paging) {
  const { keyword } = query;
  return productModel.getAutoComplete(keyword);
}

async function getSearchProducts(query, paging) {
  const { keyword } = query;

  let products = await productModel.searchProducts(keyword);

  const { distance, lat, lng } = query;
  products = products.filter((location) => {
    const relativeDistance = getDistance(location.lat, location.lng, lat, lng, 'K');
    location.distance = relativeDistance;
    return relativeDistance < distance;
  });
  return products;
}

async function getProductDetails(query, paging) {
  const { id } = query;

  let cacheProductDetails;

  if (cache.ready) {
    cacheProductDetails = await productModel.getProductCache(id);
  }

  if (cacheProductDetails) {
    // Get product details from cache
    return [JSON.parse(cacheProductDetails)];
  }

  // Search product details  from  mysql
  const productDetails = await productModel.getProductDetails(id);
  productDetails[0].photo = getImagePath(productDetails[0].photo);
  productDetails[0].images = productDetails[0].images.map((image) => getImagePath(image));

  if (cache.ready) {
    // Save product details in cache
    await productModel.createProductCache(id, productDetails[0]);
  }

  return productDetails;
}

module.exports = { findProducts };
