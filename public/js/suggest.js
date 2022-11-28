// ask user for the position
if ('geolocation' in navigator) {
  // get position from browser
  navigator.geolocation.getCurrentPosition(getPositionSuccess, getPositionError);
} else {
  // Use a third-party geolocation service
  console.log('Browser does not support the Geolocation API');
}

const lat = localStorage.getItem('lat');
const lng = localStorage.getItem('lng');
const paging = 1;
$('#suggest-page').addClass('tm-main-color');

//
(async () => {
  const response = await axios.get(
    `/api/1.0/products/suggest?lat=${lat}&lng=${lng}&paging=${paging}`
  );
  const products = response.data;
  console.log(products);
  for (product of products) {
    renderProducts();
  }
})();

// Modal
$(document).on('click', '.product-card', (e) => {
  const id = $(e.target).parents('.product-card').attr('productId');

  $.get(`/product_details?id=${id}`, (data) => {
    $('#product-modal-body').html(data);
    const myModal = new bootstrap.Modal(document.getElementById('product-modal'), {
      keyboard: false,
    });
    myModal.show();
  });
});

// init controller
const controller = new ScrollMagic.Controller();
// build scene
const scene = new ScrollMagic.Scene({
  triggerElement: '#loader',
  triggerHook: 'onEnter',
})
  .addTo(controller)
  .on('enter', () => {
    console.log('loading new items');
    setTimeout(scrollRenderProducts, 100);
  });

let page = 1;
async function scrollRenderProducts() {
  page++;
  const response = await axios.get(
    `/api/1.0/products/suggest?lat=${lat}&lng=${lng}&paging=${page}`
  );
  const products = response.data;
  console.log(products);
  for (product of products) {
    renderProducts(product);
  }
  // "loading" done -> revert to normal state
  scene.update(); // make sure the scene gets the new start position
  $('#loader').removeClass('active');
}
scrollRenderProducts();

// function
function renderProducts(product) {
  const newDom = $('.product-card').first().clone();
  newDom.removeAttr('hidden');
  newDom.attr('productId', product.product_id);
  newDom.find('.product-image').attr('src', product.image);
  newDom.find('.product-price').html(product.price);
  newDom.find('.product-title').html(product.title);
  newDom.find('.product-description').html(product.description);
  newDom.find('.user-photo').attr('src', product.photo);
  newDom.find('.user-name').html(product.name);
  newDom.find('.product-distance').html(Math.round(product.distance * 100) / 100);
  $('#product-cards-area').append(newDom);
}

// 調控瀏覽器的地理位置存取資訊cb
function getPositionSuccess(position) {
  // 將lat,lng存在localStorage
  localStorage.setItem('lat', position.coords.latitude);
  localStorage.setItem('lng', position.coords.longitude);
}

function getPositionError(err) {
  Swal.fire({
    icon: 'error',
    title: '地理位置錯誤',
    text: '無法取得您的地理位置!！ 請嘗試開啟瀏覽器地理位置存取權',
    footer:
      '<a href="https://support.google.com/chrome/answer/142065?hl=zh-Hant&co=GENIE.Platform%3DDesktop">Why do I have this issue?</a>',
  });
}
