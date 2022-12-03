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
  $('#category-all').addClass('tm-order-category-chose');
})();

$('#order-list').click((e) => {
  $('#order-sign').remove();
  $('#product-details-area').removeAttr('hidden');
  const productId = $(e.target).parents('.list-group-item').attr('productId');
  if (productId === undefined) {
    return;
  }
  $.get(`/product_details?id=${productId}`, (data) => {
    $('#product-details-page').html(data);
  });
});

$('.tm-order-category').on('click', (e) => {
  $('.tm-order-category').removeClass('tm-order-category-chose');
  $(e.currentTarget).addClass('tm-order-category-chose');
  const userId = localStorage.getItem('userId');
  const orderSelect = $(e.currentTarget).attr('category');

  let orderTarget;
  if (orderSelect === 'sell') {
    orderTarget = orderArr.filter((x) => x['user_id'] == userId);
  } else if (orderSelect === 'buy') {
    orderTarget = orderArr.filter((x) => x['user_id'] != userId);
  } else if (orderSelect === 'all') {
    orderTarget = orderArr;
  }
  renderOrders(orderTarget);
});

function renderOrders(orderArr) {
  const userId = localStorage.getItem('userId');
  $('#order-amount-message').removeAttr('hidden');
  $('#order-amount').html(orderArr.length);
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
    newDom.find('.number').html(`訂單編號: ${order.number}`);
    newDom.find('.title').html(`${order.title}`);
    newDom.find('.place').html(`${order.place}`);
    newDom.find('.price').html(`${order.price}`);
    newDom.find('.time').html(`${order.localTime}`);
    newDom.find('.status').html(`${orderStaus}`);
    newDom.find('.btn-sold').attr('sellerId', order.user_id).attr('productId', order.product_id);
    if (userId == order.user_id && order.status != 2) {
      newDom.find('.btn-sold').removeAttr('hidden');
    }
    $('#order-list').append(newDom);
  }
}

// 確認交易
$(document).on('click', '.tm-sold-btn', async (e) => {
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
      const response = await axios.patch(`/api/1.0/orders`, postData, params);
      Swal.fire('恭喜成交', '此訂單狀態會變成已成交', 'success');
      location.reload();
    }
  });
});

// 修改訂單彈窗
$(document).on('click', '.tm-revise-btn', async (e) => {
  const id = $(e.target).attr('productId');
  const response = await axios.get(`/api/1.0/products/details?id=${id}`);
  console.log(response);
  const data = response.data[0];
  const { title, price, description, place, localTime } = data;
  // 將商品id先放在title
  $('#display-title').attr('productId', id);
  $('#display-title').html(title);
  $('#input-title').val(title);
  $('#display-price').html(price);
  $('#input-price').val(price);
  $('#display-description').html(description);
  $('#input-description').val(description);
  $('#display-place').html(place);
  $('#place').val(place);
  $('#display-time').html(localTime);
  $('#input-time').val(localTime);
  const myModal = new bootstrap.Modal($('#product-modal'), {
    keyboard: false,
  });
  myModal.show();
});

// 點擊後可修改訂單，
$('.display-data').click((e) => {
  const clickedDiv = $(e.target);
  clickedDiv.hide();
  clickedDiv.next().show();
});

// 儲存按鈕
$('.revise-btn').click(async (e) => {
  const editArea = $(e.target).parents('.edit-data');

  const id = $('#display-title').attr('productId');
  const property = editArea.find('.tm-input').attr('name');
  const value = editArea.find('.tm-input').val();
  const data = { id };
  data[property] = value;
  await Swal.fire({
    title: '確定要修改資料嗎?',
    text: '請謹慎修改資料',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'OK',
  }).then(async (result) => {
    if (result.isConfirmed) {
      // 送到後端改db
      const authentication = await localStorage.getItem('Authorization');
      const params = {
        headers: { 'content-type': 'application/json', authorization: authentication },
      };
      const response = await axios.patch('/api/1.0/products/details', data, params);
      Swal.fire({
        icon: 'success',
        title: '資料修改完成',
        showConfirmButton: false,
        timer: 1500,
      });
    }
  });
  // 前端部分
  let displayData = editArea.find('.tm-input').val();
  if (property === 'place-result') {
    displayData = editArea.find('#place').val();
  }
  editArea.hide();
  editArea.prev().html(displayData);
  editArea.prev().show();
});
