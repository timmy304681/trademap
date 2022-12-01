const HERE_API_KEY = $('#map-script').attr('HERE_API_KEY');
const CENTER_LOCATION = { lat: localStorage.getItem('lat'), lng: localStorage.getItem('lng') };
const LIMIT = 5;

// Auto complete and click
const hereOptions = {
  // 定義 EasyAutocomplete 的選取項目來源
  url: (phrase) => {
    return `https://discover.search.hereapi.com/v1/discover?at=${CENTER_LOCATION.lat},${CENTER_LOCATION.lng}&limit=${LIMIT}&lang=zh-TW&q=${phrase}&apikey=${HERE_API_KEY}`;
  },
  listLocation: 'items', // 使用回傳的 item 作為選取清單
  getValue: 'title', // 在選取清單中顯示 title
  list: {
    onClickEvent: (e) => {
      // 按下選取項目之後的動作
      const data = $('#place').getSelectedItemData();
      console.log(data);
      $('#place-select').html(`地點確認： ${data.address.label}`);
      // save data in hidden input value
      $('#place-result').val(JSON.stringify(data));
    },
  },
  requestDelay: 300, // 延遲 300 毫秒再送出請求,api只允許 5  Requests Per Second (RPS)
  placeholder: '搜尋地點', // 預設顯示的字串
};
$('#place').easyAutocomplete(hereOptions); // 啟用 EasyAutocomplete 到 inputbox 這個元件
