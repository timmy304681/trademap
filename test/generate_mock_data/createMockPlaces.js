const pool = require('../util/mysql');

const mockDataNumber = 10;

const placeMock = {
  place: '忠孝新生',
  address: '106台北市大安區新生南路一段67號10652',
  lat: 25.04251,
  lng: 121.53286,
  county: '台北市',
  district: '大安區',
};

const { place, address, lat, lng, county, district } = placeMock;
const mockPlacesList = [];

// create a mock products list
for (let i = 1; i <= mockDataNumber; i++) {
  (placeMock.lat = lat + (Math.random() - 0.5) * 0.1),
    (placeMock.lng = lng + (Math.random() - 0.5) * 0.1),
    mockPlacesList.push({ ...placeMock });
}

async function main() {
  // truncate all table
  await pool.execute('DROP TABLE IF EXISTS place;');

  await pool.execute(`CREATE TABLE place (
    id INT unsigned AUTO_INCREMENT,
    place VARCHAR(30), 
    address VARCHAR(100), 
    lat DECIMAL(10, 6), 
    lng DECIMAL(10, 6), 
    county VARCHAR(10),
    district VARCHAR(10),
    PRIMARY KEY (id))`);

  // insert new data
  const placeSql = `INSERT INTO place (place, address ,lat,lng, county, district) VALUES ?`;
  await pool.query(placeSql, [mockPlacesList.map((x) => Object.values(x))]);

  // leave process

  console.log('Create mock places successfully');
  process.exit();
}

main();
