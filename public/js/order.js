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
  const userId = localStorage.getItem('userId');
  const orderSelect = e.target.value;
  let orderTarget;
  if (orderSelect === 'sell') {
    orderTarget = orderArr.filter((x) => x['user_id'] == userId);
  } else if (orderSelect === 'buy') {
    orderTarget = orderArr.filter((x) => x['user_id'] != userId);
  } else if (orderSelect === 'all') {
    orderTarget = orderArr;
  }
  console.log(orderTarget);
  renderOrders(orderTarget);
});

function renderOrders(orderArr) {
  const userId = localStorage.getItem('userId');
  $('.clone-item').remove();
  $('#product-details-page').html('');
  // eslint-disable-next-line no-restricted-syntax
  for (order of orderArr) {
    let orderStaus;
    if (order.status === 0) {
      orderStaus = '販售中';
    } else if (order.status === 1) {
      orderStaus = '洽談中';
    } else if (order.status === 2) {
      orderStaus = '已販售';
    }
    const newDom = $('.list-group-item').first().clone();
    newDom.removeAttr('hidden');
    newDom.addClass('clone-item');
    newDom.attr('productId', `${order.product_id}`);
    newDom.children('.number').html(`訂單編號: ${order.number}`);
    newDom.children('.title').html(`${order.title}`);
    newDom.children('.place').html(`${order.place}`);
    newDom.find('.price').html(`商品售價：${order.price}`);
    newDom.find('.time').html(`${order.localTime}`);
    newDom.find('.status').html(`${orderStaus}`);
    newDom.find('.btn-sold').attr('sellerId', order.user_id).attr('productId', order.product_id);
    if (userId == order.user_id && order.status != 2) {
      newDom.find('.btn-sold').removeAttr('hidden');
    }
    $('#order-list').append(newDom);
  }
}

//
$(document).on('click', '.btn-sold', async (e) => {
  Swal.fire({
    title: '是否確定更改訂單狀態為成交',
    text: '更改狀態是無法還原的！',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    confirmButtonText: '確認',
    cancelButtonColor: '#3085d6',
    cancelButtonText: '取消',
  }).then(async (result) => {
    if (result.isConfirmed) {
      const authentication = localStorage.getItem('Authorization');
      const sellerId = $(e.target).attr('sellerId');
      const productId = $(e.target).attr('productId');
      const status = 2; // status 2 means sold out
      const postData = { sellerId, productId, status };
      const params = {
        headers: { authorization: authentication },
      };
      const response = await axios.put(`/api/1.0/orders`, postData, params);
      console.log(response);
      Swal.fire('恭喜成交', '此訂單狀態會變成已成交', 'success');
      location.reload();
    }
  });
});
