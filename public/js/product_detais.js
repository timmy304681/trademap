(async () => {
  const id = $('#product-id').attr('productId');

  const response = await axios.get(`/api/1.0/products/details?id=${id}`);
  const product = response.data[0];
  console.log(product);
  const {
    title,
    number,
    price,
    time,
    description,
    place,
    address,
    lat,
    lng,
    images,
    name,
    email,
    photo,
    status,
    localTime,
  } = product;
  const userId = product.user_id;
  // product
  $('#product-title').html(title);
  $('#product-price').html(`NT$${price}`);
  $('#product-place').html(place);
  $('#product-adress').html(address);
  $('#product-time').html(localTime);
  $('#product-description').html(description);

  // product images
  for (let i = 0; i < images.length; i++) {
    const btnDom = $('.tm-carousel-btn').first().clone();
    const imageDom = $('.carousel-item').first().clone();

    if (i > 0) {
      btnDom.attr('data-bs-slide-to', i);
      btnDom.removeAttr('aria-current');
      $('#product-images-carousel').append(btnDom);

      imageDom.removeClass('active');
      imageDom.children('img').attr('src', images[i]);
      $('#product-images').append(imageDom);
    } else {
      $('.carousel-item').children('img').attr('src', images[i]);
    }
  }

  // seller
  $('#user-name').html(name);
  $('#user-photo').attr('src', photo);
  $('#btn-contact').attr('sellerId', userId).attr('productId', id);
})();

// contact
$('#btn-contact').on('click', async (e) => {
  e.preventDefault();
  const sellerId = $('#btn-contact').attr('sellerId');
  const productId = $('#btn-contact').attr('productId');
  const userId = localStorage.getItem('userId');
  if (sellerId === userId) {
    return Swal.fire({
      icon: 'warning',
      title: '此商品為您上架商品',
    });
  }

  try {
    const authentication = localStorage.getItem('Authorization');

    const postData = { sellerId, productId };
    const params = {
      headers: { authorization: authentication },
    };
    const response = await axios.post(`/api/1.0/chatrooms`, postData, params);

    location.href = '/message';
  } catch (err) {
    console.log(err);
    await Swal.fire({
      icon: 'warning',
      title: '請登入會員',
      text: `連絡賣家為會員專屬`,
      footer: `將跳轉至登入註冊頁面`,
    });
    location.href = '/profile';
  }
});
