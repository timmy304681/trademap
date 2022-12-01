const authentication = localStorage.getItem('Authorization');
const params = {
  headers: { 'content-type': 'application/json', authorization: authentication },
};

$('#reserve-page').addClass('tm-main-color');
//此頁面只有會員能看見
(async () => {
  // 驗證會員身分
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

  // 只有鑽石會員才有此功能，渲染reserve 卡片
  try {
    const response = await axios.get(`/api/1.0/reserve`, params);
    const reserves = response.data;
    // eslint-disable-next-line no-restricted-syntax
    for (reserve of reserves) {
      const { id, tag, place, product_id, distance } = reserve;
      const newDom = $('.tm-tag-item').first().clone();
      newDom.removeAttr('hidden');
      newDom.find('.produtct-tag').html(tag);
      newDom.find('.produtct-place').html(place);
      newDom.find('.produtct-tag-id').attr('tagId', id);
      if (product_id != null) {
        newDom.find('.reserve-forsale-area').removeAttr('hidden');
        newDom.find('.reserve-forsale-btn').attr('productId', product_id);
        newDom.find('.reserve-distance').html(distance);
      }
      $('#reserve-area').append(newDom);
    }
  } catch (err) {
    console.log(err);
    await Swal.fire({
      icon: 'warning',
      title: '會員權限不足',
      text: `只有金級會員才享有預約功能`,
      footer: `上架商品達兩次後，可成為金級會員`,
    });
  }

  //將line token 存到db
  try {
    const lineToken = new URLSearchParams(location.search).get('lineToken');
    if (lineToken === null) {
      return;
    }
    const postData = { lineToken };
    const response = await axios.post('/api/1.0/users/lineToken', postData, {
      headers: { authorization: authentication },
    });

    console.log('add line token to db');

    await Swal.fire({
      icon: 'success',
      title: '建立line通知成功',
      text: `當有您預約的商品上架時，會以line通知您`,
    });
  } catch (err) {
    console.log(err);
  }
})();

$('#btn-submit').on('click', async (e) => {
  try {
    e.preventDefault();
    console.log('click');
    const tagsElement = $('[name=tags]');

    let tags = [];
    // eslint-disable-next-line no-restricted-syntax
    for (tag of tagsElement) {
      tags.push(tag.value);
    }

    const params = {
      headers: { authorization: authentication },
    };

    const placeInfo = JSON.parse($('#place-result').val());

    const postData = {
      tags: tags,
      lat: placeInfo.position.lat,
      lng: placeInfo.position.lng,
      place: placeInfo.title,
    };
    console.log(postData);
    console.log('before axios');

    const response = await axios.post('/api/1.0/reserve', postData, params);
    console.log(response);
    await Swal.fire({
      icon: 'success',
      title: '商品預約成功',
      text: `若有商品上架會使用line notify通知您`,
    });
    location.href = '/login/line_notify';
  } catch (err) {
    console.log(err);
    Swal.fire({
      icon: 'error',
      title: '商品預約失敗',
    });
  }
});

$(document).on('click', '.reserve-cancel-btn', (e) => {
  Swal.fire({
    title: '是否確定要刪除此關鍵字',
    text: '刪除後是無法還原的！',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    confirmButtonText: '刪除確認',
    cancelButtonColor: '#3085d6',
    cancelButtonText: '取消',
  }).then(async (result) => {
    if (result.isConfirmed) {
      const tagId = $(e.target).attr('tagId');
      console.log(tagId);
      const response = await axios.delete(`/api/1.0/reserve?id=${tagId}`, params);
      $(e.target).parents('.tm-tag-item').remove();
      Swal.fire('Deleted!', 'Your file has been deleted.', 'success');
    }
  });
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

// 商品到貨
$(document).on('click', '.reserve-forsale-btn', (e) => {
  const id = $(e.target).attr('productId');
  $.get(`/product_details?id=${id}`, (data) => {
    console.log(data);
    $('#product-modal-body').html(data);
    const myModal = new bootstrap.Modal(document.getElementById('product-modal'), {
      keyboard: false,
    });
    myModal.show();
  });
});
