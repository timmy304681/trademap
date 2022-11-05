const productModel = require('../models/products_model');

const getProducts = async (req, res) => {
  const { category } = req.params;

  async function findProduct(category) {
    // eslint-disable-next-line default-case
    switch (category) {
      case 'all':
        return productModel.getProducts();

      case 'search': {
        const { keyword } = req.query;
        if (keyword) {
          return productModel.searchProducts(keyword);
        }
        break;
      }
    }
    return Promise.resolve({});
  }

  let productsList;
  productsList = await findProduct(category);

  if (productsList.length === undefined) {
    res.status(400).send({ error: 'Wrong Request' });
    return;
  }

  // if search mode, caculate distance
  if (category === 'search' && !req.query.distance === undefined) {
    const { distance, lat, lng } = req.query;
    productsList = productsList.filter((x) => {
      const relativeDistance = getDistance(x.lat, x.lng, lat, lng, 'K');
      x.distance = relativeDistance;
      return relativeDistance < distance;
    });
  }

  res.status(200).json(productsList);
};

const postProduct = async (req, res) => {
  const userId = 1;
  const { title, price, description, time } = req.body;
  if (
    title === undefined ||
    title === '' ||
    price === undefined ||
    price === '' ||
    description === undefined ||
    description === '' ||
    time === undefined ||
    time === ''
  ) {
    return res.status(400).json({ error: 'title, price, description or time must not be null !' });
  }

  const placeDetail = JSON.parse(req.body['place-result']);

  //   Set order number by time , total 18 numbers
  const date = new Date();
  const dataValues = [
    date.getFullYear(),
    (date.getMonth() + 1).toString().padStart(2, '0'),
    date.getDate().toString().padStart(2, '0'),
    date.getHours().toString().padStart(2, '0'),
    date.getMinutes().toString().padStart(2, '0'),
    date.getSeconds().toString().padStart(2, '0'),
    date.getMilliseconds().toString().padStart(4, '0'),
  ];

  const number = dataValues.join('');

  const productData = {
    number,
    user_id: userId,
    title,
    price,
    description,
    time,
    place: placeDetail.title,
    address: placeDetail.address.label,
    lat: placeDetail.position.lat,
    lng: placeDetail.position.lng,
    county: placeDetail.address.county,
    district: placeDetail.address.district,
  };

  const images = req.files.map((x) => x.path);

  // create product for sell
  const createResult = await productModel.createProduct(productData, number, images);
  if (createResult == false) {
    return res.status(400).json({ error: 'Create product failed!' });
  }
  res.status(200).json(createResult);
};

// Reference from  https://www.geodatasource.com/developers/javascript
const getDistance = (lat1, lng1, lat2, lng2, unit) => {
  /* Unit
      'M' is statute miles (default)
      'K' is kilometers
      'N' is nautical miles
   */
  if (lat1 === lat2 && lng1 === lng2) {
    return 0;
  }

  const radlat1 = (Math.PI * lat1) / 180;
  const radlat2 = (Math.PI * lat2) / 180;
  const theta = lng1 - lng2;
  const radtheta = (Math.PI * theta) / 180;
  let dist =
    Math.sin(radlat1) * Math.sin(radlat2) +
    Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
  if (dist > 1) {
    dist = 1;
  }
  dist = Math.acos(dist);
  dist = (dist * 180) / Math.PI;
  dist = dist * 60 * 1.1515;
  if (unit === 'K') {
    dist *= 1.609344;
  }
  if (unit === 'N') {
    dist *= 0.8684;
  }
  return dist;
};

module.exports = { getProducts, postProduct };
