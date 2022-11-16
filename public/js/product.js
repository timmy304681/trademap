const CENTER_LOCATION = { lat: 25.038664974857266, lng: 121.53243547090415 };
const ZOOM_LEVEL = 14;
const MAX_ZOOM_LEVEL = 18;
const MIN_ZOOM_LEVEL = 12;
const LIMIT = 5;
const HERE_API_KEY = $('#map-script').attr('HERE_API_KEY');
const MAPTILER_API_KEY = $('#map-script').attr('MAPTILER_API_KEY');
const MAP_TILER_TYPE = 'maptiler'; // maptiler or here
let map, marker;

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

// Leaflet create map
createMap();

// Auto complete and click
const options = {
  // 定義 EasyAutocomplete 的選取項目來源
  url: (phrase) => {
    return `
        https://discover.search.hereapi.com/v1/discover?at=${CENTER_LOCATION.lat},${CENTER_LOCATION.lng}&limit=${LIMIT}&lang=zh-TW&q=${phrase}&apikey=${HERE_API_KEY}`;
  },
  listLocation: 'items', // 使用回傳的 item 作為選取清單
  getValue: 'title', // 在選取清單中顯示 title
  list: {
    onClickEvent: (e) => {
      // 按下選取項目之後的動作
      const data = $('#place').getSelectedItemData();
      console.log(data);
      if (marker != undefined) {
        map.removeLayer(marker);
      }
      //產生marker
      marker = L.marker([`${data.position.lat}`, `${data.position.lng}`]).addTo(map);
      map.flyTo(L.latLng(data.position), 18); // 把地圖移動到選取項目
      $('#place-select').html(`地點確認： ${data.address.label}`);
      // save data in hidden input value
      $('#place-result').val(JSON.stringify(data));
    },
  },
  requestDelay: 300, // 延遲 300 毫秒再送出請求,api只允許 5  Requests Per Second (RPS)
  placeholder: '搜尋地點', // 預設顯示的字串
};
$('#place').easyAutocomplete(options); // 啟用 EasyAutocomplete 到 inpupbox 這個元件

// keytype enter
$('#place').on('keypress', (e) => {
  // 監聽使用者是否按下「Enter」
  if (e.which == 13) {
    e.preventDefault();
    const phrase = $('#place').val(); // 取得使用者輸入的字串
    $.getJSON(
      `
    https://discover.search.hereapi.com/v1/discover?at=${CENTER_LOCATION.lat},${CENTER_LOCATION.lng}&limit=1&lang=zh-TW&q=${phrase}&apikey=${HERE_API_KEY}`,
      (value) => {
        //  雖只限定回傳一筆，但因為value.items出來是arr所以用arr fuction解析
        value.items.forEach((data) => {
          if (marker != undefined) {
            map.removeLayer(marker);
          }
          //產生maker 經度：${data.position.lat}，緯度：${data.position.lng}
          marker = L.marker([`${data.position.lat}`, `${data.position.lng}`]).addTo(map);
          map.flyTo(L.latLng(data.position), 18);
          $('#place-select').html(`地點確認： ${data.address.label}`);
          // save data in hidden input value
          $('#place-result').val(JSON.stringify(data));
        });
      }
    );
  }
});

// submit form
const title = $('');

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

// 定義一個地圖物件
function createMap() {
  map = L.map('map', {
    center: [`${CENTER_LOCATION.lat}`, `${CENTER_LOCATION.lng}`],
    zoom: `${ZOOM_LEVEL}`,
    maxZoom: `${MAX_ZOOM_LEVEL}`,
    minZoom: `${MIN_ZOOM_LEVEL}`,
  });

  // add Map Tile (here or maptiler)
  addMapTile(map, MAP_TILER_TYPE);

  // add center marker
  marker = L.marker([CENTER_LOCATION.lat, CENTER_LOCATION.lng]).addTo(map);
  marker._icon.classList.add('huechange');
  /* <style>img.huechange {filter: hue-rotate(-90deg);}</style> */
}

// choose map tile
function addMapTile(map, mapType) {
  if (mapType === 'here') {
    L.tileLayer(
      `https://{s}.base.maps.ls.hereapi.com/maptile/2.1/maptile/newest/normal.day.transit/{z}/{x}/{y}/256/png8?lg=cht&ppi=72&pois&apiKey=${HERE_API_KEY}`,
      {
        // attribution: '© 2020 HERE',
        subdomains: [1, 2, 3, 4],
      }
    ).addTo(map);
  } else if (mapType === 'maptiler') {
    L.maplibreGL({
      attribution:
        '\u003ca href="https://www.maptiler.com/copyright/" target="_blank"\u003e\u0026copy; MapTiler\u003c/a\u003e \u003ca href="https://www.openstreetmap.org/copyright" target="_blank"\u003e\u0026copy; OpenStreetMap contributors\u003c/a\u003e',
      style: `https://api.maptiler.com/maps/e095a72d-8a10-4727-9b40-d8230fc0f96b/style.json?key=${MAPTILER_API_KEY}`,
    }).addTo(map);
  } else {
    console.log('map type error, only allow here & maptiler');
  }
}
