const { getDistance, sanitizeRequest, getImagePath } = require('../util/util');

describe('Unit test for utility ', () => {
  test('getDistance: calculates the distance between two points', () => {
    // getDistance(lat1, lng1, lat2, lng2, unit)
    // 忠孝新生到板橋車站距離，預估約7.6公里
    const distance = getDistance(
      25.042534948676145,
      121.53298582862054,
      25.01440486315382,
      121.46399319857693,
      'K'
    );

    expect(distance).not.toBeNull();
    expect(distance).toBeDefined();
    expect(distance).toBeGreaterThan(7);
    expect(distance).toBeLessThan(9);
    expect(distance).toBeWithinRange(7, 9);
  });

  test('getImagePath: complete image path from mysql query', () => {
    // getImagePath(imagePath)
    const imagePath = getImagePath('/images/trademap.png');
    expect(imagePath).not.toBeNull();
    expect(imagePath).toBeDefined();
    expect(imagePath).toMatch('https://');
  });
});

// expect extend
expect.extend({
  toBeWithinRange(received, floor, ceiling) {
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      return {
        message: () => `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false,
      };
    }
  },
});
