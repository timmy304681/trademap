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

$('#form').validate({
  rules: {
    title: {
      required: true,
      rangelength: [5, 255],
    },
    description: {
      required: true,
      minlength: 5,
    },
    price: {
      required: true,
      number: true,
      max: 16777214,
      min: 1,
    },
  },
});

// submit form
$('#btn-submit').on('click', async (e) => {
  e.preventDefault();
  const titleInput = $('#title').val();
  const priceInput = $('#price').val();
  const descriptionInput = $('#description').val();
  const placeInput = $('#place-result').val();
  const imageFiles = $('#images').prop('files');

  if (titleInput.trim() === '' || titleInput.length < 5) {
    return errorAlert('商品名稱輸入錯誤', '最少請輸入5個字');
  }

  if (priceInput.trim() === '' || priceInput > 16777214 || priceInput.length < 0) {
    return errorAlert('價錢輸入錯誤', '僅允許大於零的整數且小於16777214');
  }
  if (descriptionInput.trim() === '' || descriptionInput.length < 5) {
    return errorAlert('商品描述輸入錯誤', '最少請輸入5個字');
  }

  if (placeInput === '') {
    return errorAlert('地點輸入錯誤', '不可為空');
  }

  if (imageFiles.length === 0) {
    return errorAlert('照片上傳錯誤', '請最少上傳一張照片');
  }

  if ($('#time').val() === '') {
    return errorAlert('時間輸入錯誤', '不可為空');
  }

  const Authorization = localStorage.getItem('Authorization');
  const postData = new FormData(form);

  $('.chip').each((index, domEle) => {
    const tag = $(domEle).html().split('<i')[0];
    postData.append('tags', tag);
  });

  const params = {
    headers: {
      authorization: Authorization,
    },
  };

  try {
    const response = await axios.post('/api/1.0/products', postData, params);

    await Swal.fire({
      icon: 'success',
      title: '商品上架成功',
      text: `訂單編號${response.data.number}`,
      footer: '確認後會跳轉至訂單頁面',
    });
    location.href = '/order';
  } catch (err) {
    console.log(err);
    errorAlert('商品上架失敗', '商品上架失敗');
  }
});

// only allow 10 images
$('#images').on('change', (e) => {
  if ($('#images')[0].files.length > 10) {
    alert('You can select only 10 images');
    e.preventDefault();
  }
});

// 防止按enter提交form
$(document).on('keypress', 'form', (e) => {
  return e.keyCode != 13;
});

// chips & tags
$('.chips').chips();

$('#title').bind('input propertychange', async (e) => {
  const input = $(e.target).val();
  const response = await axios.get(`/api/1.0/products/tags?title=${input}`);
  const tags = response.data;
  let tagsData = [];
  tags.forEach((e) => {
    tagsData.push({ tag: e });
  });

  $('.chips-initial').chips({
    data: tagsData,
    limit: 20,
  });
});

// functions
function errorAlert(title, text) {
  Swal.fire({
    icon: 'error',
    title: title,
    text: text,
  });
}

// jQuery File Upload
