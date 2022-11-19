$('#product-page').addClass('tm-main-color');
//此頁面只有會員能看見
(async () => {
  // 驗證會員身分
  try {
    const authentication = await localStorage.getItem('Authorization');
    const params = {
      headers: { 'content-type': 'application/json', authorization: authentication },
    };
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
})();

// submit form

$('#btn-submit').on('click', async (e) => {
  e.preventDefault();
  const Authorization = localStorage.getItem('Authorization');
  const postData = new FormData(form);

  const params = {
    headers: {
      authorization: Authorization,
    },
  };
  console.log('before axios');
  try {
    const response = await axios.post('/api/1.0/products', postData, params);
    console.log(response);
    await Swal.fire({
      icon: 'success',
      title: '商品上架成功',
      text: `訂單編號${response.data.number}`,
      footer: '確認後會跳轉至訂單頁面',
    });
    location.href = '/order';
  } catch (err) {
    console.log(err);
    Swal.fire({
      icon: 'error',
      title: '商品上架失敗',
    });
  }
});

// only allow 10 images
$('#images').on('change', (e) => {
  if ($('#images')[0].files.length > 10) {
    alert('You can select only 10 images');
    e.preventDefault();
  }
});

let count = 1;
$('#btn-add-tags').click(() => {
  if (count > 4) {
    return;
  }
  const newDom = $('.tm-tags-item').first().clone();
  $('#tags-insert-body').append(newDom);
  count++;
});
