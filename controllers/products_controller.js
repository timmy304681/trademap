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

  const productsList = await findProduct(category);

  if (productsList.length === undefined) {
    res.status(400).send({ error: 'Wrong Request' });
    return;
  }

  res.status(200).json(productsList);
};

const postProduct = async (req, res) => {
  console.log(req.files);
  const { user_id, title, price, description, time, place, address, lat, lng, county, district } =
    req.body;
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

  const createResult = await productModel.createProduct(req.body, number);

  res.status(200).json(createResult);
};

module.exports = { getProducts, postProduct };
