const authentication = localStorage.getItem('Authorization');
const params = {
  headers: { 'content-type': 'application/json', authorization: authentication },
};
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
  $('#reserve-area').html('');
  try {
    const response = await axios.get(`/api/1.0/reserve`, params);
    const reserves = response.data;
  } catch (err) {
    console.log(err);
    await Swal.fire({
      icon: 'warning',
      title: '會員權限不足',
      text: `只有鑽石級會員才享有預約功能`,
      footer: `上架商品達兩次後，可成為鑽石級💎會員`,
    });
  }
  // eslint-disable-next-line no-restricted-syntax
  for (reserve of reserves) {
    const tag = reserve.tag;
    $('#reserve-area').append(
      `<div class="col-3 mt-2">
<div class="card radius-10 border-start border-0 border-3 border-info">
  <div class="card-body">
    <div class="d-flex align-items-center">
      <div>
        <p class="mb-0 text-secondary">Product Tag</p>
        <h4 class="my-1 text-info">${tag}</h4>
        <button class="mb-0 font-13">取消</button>
      </div>
      <div
        class="widgets-icons-2 rounded-circle bg-gradient-scooter text-white ms-auto"
      >
        <i class="fa fa-shopping-cart"></i>
      </div>
    </div>
  </div>
</div>
</div>`
    );
  }
})();

// ask user for the position
if ('geolocation' in navigator) {
  // get position from browser
  navigator.geolocation.getCurrentPosition(getPositionSuccess, getPositionError);
} else {
  // Use a third-party geolocation service
  console.log('Browser does not support the Geolocation API');
}

// 調控瀏覽器的地理位置存取資訊cb
function getPositionSuccess(position) {
  const lat = position.coords.latitude;
  const lng = position.coords.longitude;

  // 將lat,lng存在localStorage
  window.localStorage.setItem('lat', lat);
  window.localStorage.setItem('lng', lng);
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

$('#btn-submit').on('click', async (e) => {
  e.preventDefault();
  console.log('click');
  const tagsElement = $('[name=tags]');

  let tags = [];
  // eslint-disable-next-line no-restricted-syntax
  for (tag of tagsElement) {
    tags.push(tag.value);
  }
  const Authorization = localStorage.getItem('Authorization');
  const params = {
    headers: { authorization: Authorization },
  };
  const postData = {
    tags: tags,
    lat: localStorage.getItem('lat'),
    lng: localStorage.getItem('lng'),
    distance: $('#distance').val(),
  };
  console.log(postData);
  console.log('before axios');
  try {
    const response = await axios.post('/api/1.0/reserve', postData, params);
    console.log(response);
    await Swal.fire({
      icon: 'success',
      title: '商品預約成功',
      text: `若有商品上架會馬上通知您`,
    });
    location.reload();
  } catch (err) {
    console.log(err);
    Swal.fire({
      icon: 'error',
      title: '商品預約失敗',
    });
  }
});
