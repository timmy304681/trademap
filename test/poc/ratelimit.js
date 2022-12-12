const axios = require('axios');

for (let i = 0; i < 100; i++) {
  (async () => {
    try {
      const result = await axios.get(
        'http://localhost:3000/api/1.0/products/suggest?lat=25&lng=122&paging=0'
      );
      console.log(i, result.status);
    } catch (err) {
      console.log(i, '429');
    }
  })();
}
