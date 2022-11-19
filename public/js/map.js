const MAP_TILER_TYPE = 'maptiler'; // maptiler, here or google
const HERE_API_KEY = $('#map-script').attr('HERE_API_KEY');
const MAPTILER_API_KEY = $('#map-script').attr('MAPTILER_API_KEY');
const ZOOM_LEVEL = 14;
const MAX_ZOOM_LEVEL = 18;
const MIN_ZOOM_LEVEL = 12;
const LIMIT = 5;
const markers = L.markerClusterGroup(); // setup a marker group
let map, marker, CENTER_LOCATION;

// ask user for the position
if ('geolocation' in navigator) {
  // get position from browser
  navigator.geolocation.getCurrentPosition(getPositionSuccess, getPositionError);
  CENTER_LOCATION = { lat: localStorage.getItem('lat'), lng: localStorage.getItem('lng') };
} else {
  // Use a third-party geolocation service
  console.log('Browser does not support the Geolocation API');
}

$('#btn-map-search').click(async (e) => {
  // 先清除marker
  window.scroll({ top: $('body').prop('scrollHeight') }); // scroll移到最下面
  if (marker != undefined) {
    markers.clearLayers();
  }
  e.preventDefault();

  const params = {
    params: {
      distance: $('#distance')[0].value,
      keyword: $('#keyword')[0].value,
      lat: localStorage.getItem('lat'),
      lng: localStorage.getItem('lng'),
    },
  };
  const response = await axios.get('/api/1.0/products/search', params);
  const productArr = response.data;

  productArr.forEach((data) => {
    marker = L.marker([`${data.lat}`, `${data.lng}`])
      .bindPopup(`${data.title}`) //彈出窗口顯示
      .on('click', markerClick); //監控clicks

    marker.myData = data; // 將客製化data加進去marker
    markers.addLayer(marker);
    map.addLayer(markers);
  });
});

// Auto complete and click
const options = {
  // 定義 EasyAutocomplete 的選取項目來源
  url: (phrase) => {
    return `/api/1.0/products/autoCompleteSearch?keyword=${phrase}`;
  },
  getValue: 'title', // 在選取清單中顯示 title
  list: {
    onClickEvent: (e) => {
      // 按下選取項目之後的動作
    },
  },
  adjustWidth: false,
  requestDelay: 300, // 延遲 300 毫秒再送出請求,api只允許 5  Requests Per Second (RPS)
  placeholder: '請輸入關鍵字', // 預設顯示的字串
  theme: 'round',
};
$('#keyword').easyAutocomplete(options); // 啟用 EasyAutocomplete 到 inpupbox 這個元件

// Auto complete and click
const hereOptions = {
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
$('#place').easyAutocomplete(hereOptions); // 啟用 EasyAutocomplete 到 inpupbox 這個元件

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

// Functions
// 調控瀏覽器的地理位置存取資訊cb
function getPositionSuccess(position) {
  const lat = position.coords.latitude;
  const lng = position.coords.longitude;
  const CENTER_LOCATION = { lat, lng };
  createMap(CENTER_LOCATION);

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

// 定義一個地圖物件
function createMap(CENTER_LOCATION) {
  map = L.map('map', {
    center: [`${CENTER_LOCATION.lat}`, `${CENTER_LOCATION.lng}`],
    zoom: `${ZOOM_LEVEL}`,
    maxZoom: `${MAX_ZOOM_LEVEL}`,
    minZoom: `${MIN_ZOOM_LEVEL}`,
  });

  // add Map Tile (here or maptiler)
  addMapTile(map, CENTER_LOCATION, MAP_TILER_TYPE);

  // add center marker
  marker = L.marker([CENTER_LOCATION.lat, CENTER_LOCATION.lng]).addTo(map);
  marker._icon.classList.add('huechange');
  /* <style>img.huechange {filter: hue-rotate(-90deg);}</style> */
}

// choose map tile
function addMapTile(map, CENTER_LOCATION, mapType) {
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
  } else if (mapType === 'google') {
    L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
      maxZoom: 20,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    }).addTo(map);
  } else {
    console.log('map type error, only allow here & maptiler');
  }
}

// 產生marker
async function markerClick(e) {
  console.log(e.target.myData);
  const { id } = e.target.myData;
  const response = await axios.get(`/api/1.0/products/details?id=${id}`);

  const {
    user_id,
    title,
    price,
    place,
    address,
    lat,
    lng,
    description,
    images,
    create_time,
    name,
    email,
    photo,
  } = response.data[0];
  map.flyTo(L.latLng({ lat, lng }), 18);

  $.get(`/product_details?id=${id}`, (data) => {
    console.log(data);
    $('#product-modal-body').html(data);
    const myModal = new bootstrap.Modal(document.getElementById('product-modal'), {
      keyboard: false,
    });
    myModal.show();
  });
}
