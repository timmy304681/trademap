const paging = 1;
const lat = localStorage.getItem('lat');
const lng = localStorage.getItem('lng');
$('#suggest-page').addClass('tm-main-color');

(async () => {
  const response = await axios.get(
    `/api/1.0/products/suggest?lat=${lat}&lng=${lng}&paging=${paging}`
  );
  const products = response.data;
  console.log(products);
  for (product of products) {
    renderProducts();
  }
  $('#loader').addClass('active');
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
  .on('enter', function (e) {
    console.log('loading new items');
    setTimeout(scrollRenderProducts, 1000);
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
    renderProducts();
  }
  // "loading" done -> revert to normal state
  scene.update(); // make sure the scene gets the new start position
  $('#loader').removeClass('active');
}
scrollRenderProducts();

// function
function renderProducts() {
  const newDom = $('.product-card').first().clone();
  newDom.removeAttr('hidden');
  newDom.attr('productId', product.product_id);
  newDom.find('.product-image').attr('src', product.image);
  newDom.find('.product-title').html(product.title);
  newDom.find('.product-description').html(product.description);
  newDom.find('.user-photo').attr('src', product.photo);
  newDom.find('.user-name').html(product.name);
  newDom.find('.product-distance').html(Math.round(product.distance * 100) / 100);
  $('#product-cards-area').append(newDom);
}
