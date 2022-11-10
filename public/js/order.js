// $('#btn-submit').on('click', async (e) => {
//   e.preventDefault();
//   $(`#order-list`).html('');})
(async () => {
  const Authorization = localStorage.getItem('Authorization');
  const params = {
    headers: { authorization: Authorization },
  };
  const response = await axios.get('/api/1.0/orders', params);
  console.log(response);
  const orderArr = response.data;
  // eslint-disable-next-line no-restricted-syntax
  for (order of orderArr) {
    let orderStaus;
    if (order.status === 0) {
      orderStaus = '販售中';
    } else if (order.status === 1) {
      orderStaus = '洽談中';
    } else {
      orderStaus = '已販售';
    }
    $('#order-list').append(` 
  <li class="list-group-item" id="${order.id}">
  <div class="number">訂單編號: ${order.number}</div>
  <div class="title">${order.title}</div>
  <div class="place">${order.place}</div>
  <div class="row">
    <div class="price col">商品售價：${order.price}</div>
    <div class="time col-6">${order.time}</div>
    <div class="status col-2 text-right">${orderStaus}</div>
  </div>
</li>`);
  }
})();
