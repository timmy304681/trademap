const place1 = { lat: 25.038664974857266, lng: 121.53243547090415 };
const place2 = {
  title: '台北車站',
  position: { lat: 25.04745, lng: 121.51613 },
};
const place3 = {
  title: '大心新泰式麵食',
  position: { lat: 25.04217, lng: 121.55232 },
};
const place4 = {
  title: '善導寺捷運站',
  position: { lat: 25.0449, lng: 121.52323 },
};

console.log(distance(place1.lat, place1.lng, place2.position.lat, place2.position.lng, 'K'));

function distance(lat1, lon1, lat2, lon2, unit) {
  if (lat1 == lat2 && lon1 == lon2) {
    return 0;
  } else {
    var radlat1 = (Math.PI * lat1) / 180;
    var radlat2 = (Math.PI * lat2) / 180;
    var theta = lon1 - lon2;
    var radtheta = (Math.PI * theta) / 180;
    var dist =
      Math.sin(radlat1) * Math.sin(radlat2) +
      Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    if (dist > 1) {
      dist = 1;
    }
    dist = Math.acos(dist);
    dist = (dist * 180) / Math.PI;
    dist = dist * 60 * 1.1515;
    if (unit == 'K') {
      dist = dist * 1.609344;
    }
    if (unit == 'N') {
      dist = dist * 0.8684;
    }
    return dist;
  }
}
