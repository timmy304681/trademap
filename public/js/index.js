const ZOOM_LEVEL = 13;
const LIMIT = 5;
const HERE_API_KEY = $('#map-script').attr('HERE_API_KEY');
let map, marker;

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
  });

  L.tileLayer(
    `https://{s}.base.maps.ls.hereapi.com/maptile/2.1/maptile/newest/normal.day.grey/{z}/{x}/{y}/256/png8?lg=cht&ppi=72&pois&apiKey=${HERE_API_KEY}`,
    {
      // attribution: '© 2020 HERE',
      subdomains: [1, 2, 3, 4],
    }
  ).addTo(map);

  //add center marker
  const marker = L.marker([CENTER_LOCATION.lat, CENTER_LOCATION.lng]).addTo(map);
  marker._icon.classList.add('huechange');
  /*
<style>
  img.huechange {
    filter: hue-rotate(-90deg);
  }
</style>
*/
}

// 產生marker
function markerClick(e) {
  const { title, price, description, place, address, lat, lng, county, district } = e.target.myData;
  map.flyTo(L.latLng({ lat, lng }), 18);
  // const imagePath = `${image}`;
  // <image src=${imagePath} style="height: 200px"></image>
  $('#product').html(`
    <div>商品： ${title}</div>
    <div>商品價錢： ${price}</div>
    <div>面交地點： ${place}</div> 
    <div>詳細地址： ${address}</div> 
    <div>商品描述： ${description}</div> 
    <button onclick="contact()">與賣家聯繫</button> 
    `);
}

/// event
// setup a marker group
const markers = L.markerClusterGroup();

$('#btn-submit').on('click', async (e) => {
  e.preventDefault();

  const params = {
    params: {
      distance: $('#distance')[0].value,
      keyword: $('#keyword')[0].value,
      lat: window.localStorage.getItem('lat'),
      lng: window.localStorage.getItem('lng'),
    },
  };
  const response = await axios.get('/api/1.0/products/search', params);
  console.log(response);
  const productArr = response.data;
  console.log(productArr);

  if (marker != undefined) {
    markers.clearLayers();
  }
  productArr.forEach((data) => {
    marker = L.marker([`${data.lat}`, `${data.lng}`])
      .bindPopup(`${data.title}`) //彈出窗口顯示
      .on('click', markerClick); //監控clicks
    //   .addTo(map)
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
  requestDelay: 200, // 延遲 300 毫秒再送出請求,api只允許 5  Requests Per Second (RPS)
  placeholder: '請輸入關鍵字', // 預設顯示的字串
};
$('#keyword').easyAutocomplete(options); // 啟用 EasyAutocomplete 到 inpupbox 這個元件

// contact

function contact() {
  console.log('test');
}
