const CENTER_LOCATION = { lat: 25.038664974857266, lng: 121.53243547090415 };
const ZOOM_LEVEL = 13;
const RADIUS = 5000; // meters
const GOOGLE_API_KEY = $('#map-script').attr('GOOGLE_API_KEY');
const script = $('<script></script>', {
  src: `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_API_KEY}&libraries=places&v=weekly&callback=initMap`,
  async: true,
  defer: true,
  type: 'text/javascript',
});
script.appendTo('body');

// event listener
$('#btn-map')[0].addEventListener('click', (e) => {
  e.preventDefault();
  const input = $('#input-position')[0];
  textSearch(input.value);
});

// function
function initMap() {
  const mapProp = {
    center: new google.maps.LatLng(CENTER_LOCATION.lat, CENTER_LOCATION.lng),
    zoom: ZOOM_LEVEL,
  };
  // 建立地圖
  const map = new google.maps.Map($('#map')[0], mapProp);
  return map;
}

function textSearch(input) {
  const mapProp = {
    center: new google.maps.LatLng(CENTER_LOCATION.lat, CENTER_LOCATION.lng),
    zoom: ZOOM_LEVEL,
  };
  // 建立地圖
  const map = new google.maps.Map($('#map')[0], mapProp);
  const service = new google.maps.places.PlacesService(map);
  const request = {
    location: new google.maps.LatLng(CENTER_LOCATION.lat, CENTER_LOCATION.lng),
    radius: RADIUS, // m
    query: input,
  };

  service.textSearch(request, function (results, status) {
    if (status == google.maps.places.PlacesServiceStatus.OK) {
      for (let i = 0; i < results.length; i++) {
        console.log(results[i]);
        createMarker(results[i], map);
        createList(results[i]);
      }
    }
  });
}

function createMarker(place, map) {
  if (!place.geometry || !place.geometry.location) return;

  const marker = new google.maps.Marker({
    map,
    position: place.geometry.location,
  });
  const infowindow = new google.maps.InfoWindow();
  google.maps.event.addListener(marker, 'click', (e) => {
    console.log();
    infowindow.setContent(place.name || '');
    infowindow.open(map);
  });
}

function createList(place) {
  console.log(place.geometry.location.lat());
  console.log(place.geometry.location.lng());
  const placeDetail = $(
    `<div>${place.name}</div>
    <div>${place.formatted_address}</div>
    <div>(${place.geometry.location.lat()}, ${place.geometry.location.lng()})</div>`
  );
  placeDetail.appendTo('#place');
}

window.initMap = initMap;
