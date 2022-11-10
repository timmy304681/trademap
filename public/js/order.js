(async () => {
  // 驗證會員身分
  const authentication = await localStorage.getItem('Authorization');
  const params = {
    headers: { 'content-type': 'application/json', authorization: authentication },
  };
  try {
    const response = await axios.get(`/api/1.0/users`, params);
  } catch (err) {
    console.log(err);
    await Swal.fire({
      icon: 'warning',
      title: '請登入會員',
      text: `此頁面為會員專屬`,
      footer: `將跳轉至登入註冊頁面`,
    });
    location.href = '/profile';
  }

  // order渲染
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
