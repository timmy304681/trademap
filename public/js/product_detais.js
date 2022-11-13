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
  } = product;
  const userId = product.user_id;
  // product
  $('#product-title').html(title);
  $('#product-price').html(`NT$${price}`);
  $('#product-place').html(place);
  $('#product-adress').html(address);
  $('#product-time').html(time);
  $('#product-description').html(description);

  // product images
  for (let i = 0; i < images.length; i++) {
    $('#product-images-carousel').append(
      `<button type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide-to="${i}"></button>`
    );
    $('#product-images').append(
      `<div class="carousel-item"><img src="${images[i]}" class="d-block w-auto" style="max-height:500px" /> </div>`
    );
    if (i === 0) {
      $('#product-images-carousel button').addClass('active');
      $('#product-images div').addClass('active');
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
