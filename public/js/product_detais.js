const id = new URLSearchParams(location.search).get('id');

(async () => {
  const response = await axios.get(`/api/1.0/products/details?id=1`);
  const product = response.data[0];

  console.log(product);
})();
