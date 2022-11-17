let orderArr;
$('#order-page').addClass('tm-main-color');
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
  orderArr = response.data;
  renderOrders(orderArr);
})();

$('#order-list').click((e) => {
  const productId = $(e.target).parents('.list-group-item').attr('productId');
  if (productId === undefined) {
    return;
  }
  $.get(`/product_details?id=${productId}`, (data) => {
    $('#product-details-page').html(data);
  });
});

$('#order-select').on('change', (e) => {
  const orderSelect = e.target.value;
  let orderTarget;
  if (orderSelect === 'sell') {
    orderTarget = orderArr.filter((x) => x['user_id'] == localStorage.getItem('userId'));
  } else if (orderSelect === 'buy') {
    orderTarget = orderArr.filter((x) => x['user_id'] != localStorage.getItem('userId'));
  } else if (orderSelect === 'all') {
    orderTarget = orderArr;
  }
  console.log(orderTarget);
  renderOrders(orderTarget);
});

function renderOrders(orderArr) {
  // 將原本渲染的畫面清掉
  // $('#order-list').html('');
  $('.clone-item').remove();
  $('#product-details-page').html('');
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
    const newDom = $('.list-group-item').first().clone();
    newDom.removeAttr('hidden');
    newDom.addClass('clone-item');
    newDom.attr('productId', `${order.product_id}`);
    newDom.children('.number').html(`訂單編號: ${order.number}`);
    newDom.children('.title').html(`${order.title}`);
    newDom.children('.place').html(`${order.place}`);
    newDom.children('.row').children('.price').html(`商品售價：${order.price}`);
    newDom.children('.row').children('.time').html(`${order.localTime}`);
    newDom.children('.row').children('.status').html(`${orderStaus}`);
    newDom.show();
    $('#order-list').append(newDom);
  }
}
