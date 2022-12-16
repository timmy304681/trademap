const CENTER_LOCATION = { lat: 25.038664974857266, lng: 121.53243547090415 };
const ZOOM_LEVEL = 13;
const LIMIT = 5;
const HERE_API_KEY = $('#map-script').attr('HERE_API_KEY');
// var platform = new H.service.Platform({
//   apikey: `${HERE_API_KEY}`,
// });

// Leaflet
// 定義一個地圖物件
const map = L.map('map', {
  center: [`${CENTER_LOCATION.lat}`, `${CENTER_LOCATION.lng}`],
  zoom: `${ZOOM_LEVEL}`,
  zoomControl: false,
});

// 地圖的左下角加上比例尺
L.control
  .scale({
    position: 'bottomleft',
  })
  .addTo(map);

// 設定圖資來源，來源為here
L.tileLayer(
  `https://{s}.base.maps.ls.hereapi.com/maptile/2.1/maptile/newest/normal.day.grey/{z}/{x}/{y}/256/png8?lg=cht&ppi=72&pois&apiKey=${HERE_API_KEY}`,
  {
    // attribution: '© 2020 HERE',
    subdomains: [1, 2, 3, 4],
  }
).addTo(map);

// Autosuggest
let marker;
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
      const data = $('#inputbox').getSelectedItemData();
      console.log(data);
      if (marker != undefined) {
        map.removeLayer(marker);
      }
      //產生marker
      marker = L.marker([`${data.position.lat}`, `${data.position.lng}`]).addTo(map);
      map.flyTo(L.latLng(data.position), 18); // 把地圖移動到選取項目
      $('#place-select').html(`地點確認： ${data.address.label}`);
    },
  },
  requestDelay: 300, // 延遲 300 毫秒再送出請求,api只允許 5  Requests Per Second (RPS)
  placeholder: '搜尋地點', // 預設顯示的字串
};
$('#inputbox').easyAutocomplete(options); // 啟用 EasyAutocomplete 到 inpupbox 這個元件

// keytype enter
$('#inputbox').on('keypress', (e) => {
  // 監聽使用者是否按下「Enter」
  if (e.which == 13) {
    e.preventDefault();
    const phrase = $('#inputbox').val(); // 取得使用者輸入的字串
    $.getJSON(
      `
    https://discover.search.hereapi.com/v1/discover?at=${CENTER_LOCATION.lat},${CENTER_LOCATION.lng}&limit=1&lang=zh-TW&q=${phrase}&apikey=${HERE_API_KEY}`,
      (value) => {
        //  雖只限定回傳一筆，但因為value.items出來是arr所以用arr fuction解析
        console.log(value);
        value.items.forEach((data) => {
          if (marker != undefined) {
            map.removeLayer(marker);
          }
          //產生maker 經度：${data.position.lat}，緯度：${data.position.lng}
          marker = L.marker([`${data.position.lat}`, `${data.position.lng}`]).addTo(map);
          map.flyTo(L.latLng(data.position), 18);
          $('#place-select').html(`地點確認： ${data.address.label}`);
        });
      }
    );
  }
});

// 定義一個地圖物件
const map2 = L.map('map2', {
  center: [`${CENTER_LOCATION.lat}`, `${CENTER_LOCATION.lng}`],
  zoom: `${ZOOM_LEVEL}`,
});

L.tileLayer(
  `https://{s}.base.maps.ls.hereapi.com/maptile/2.1/maptile/newest/normal.day.grey/{z}/{x}/{y}/256/png8?lg=cht&ppi=72&pois&apiKey=${HERE_API_KEY}`,
  {
    // attribution: '© 2020 HERE',
    subdomains: [1, 2, 3, 4],
  }
).addTo(map2);

$.getJSON('/api/1.0/products/all', (tradeList) => {
  tradeList.forEach((data) => {
    const markerTrade = L.marker([`${data.lat}`, `${data.lng}`])
      .addTo(map2)
      .bindPopup(`${data.title}`) //彈出窗口顯示
      .on('click', markerClick); //監控clicks
    markerTrade.myData = data; // 將客製化data加進去marker
  });
});

function markerClick(e) {
  const { title, price, description, place, address, lat, lng, county, district } = e.target.myData;
  map2.flyTo(L.latLng({ lat, lng }), 15);
  // const imagePath = `${image}`;
  // <image src=${imagePath} style="height: 200px"></image>
  $('#product').html(`
  <div>商品： ${title}</div>
  <div>商品價錢： ${price}</div>
  <div>面交地點： ${place}</div> 
  <div>詳細地址： ${address}</div> 
  <div>商品描述： ${description}</div> 
  `);
}
