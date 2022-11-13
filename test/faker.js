const { faker } = require('@faker-js/faker');

const fakeData = {
  userId: faker.datatype.uuid(),
  username: faker.internet.userName(),
  email: faker.internet.email(),
  avatar: faker.image.avatar(),
  password: faker.internet.password(),
  birthdate: faker.date.birthdate(),
  registeredAt: faker.date.past(),
};

console.log(fakeData);
