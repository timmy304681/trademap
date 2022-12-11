const express = require('express');
const request = require('supertest');
const productRoute = require('../routes/products_route');
const app = express();

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// api
app.use(productRoute);

describe('Integration tests for the products API', () => {
  test('GET /products/all - success - get all products list by paging ', async () => {
    const { body, statusCode } = await request(app).get('/products/all');

    expect(body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(Number),
          title: expect.any(String),
          description: expect.any(String),
          price: expect.any(Number),
          number: expect.any(String),
          time: expect.any(String),
          place: expect.any(String),
          address: expect.any(String),
          lat: expect.any(String),
          lng: expect.any(String),
          user_id: expect.any(Number),
          status: expect.any(Number),
        }),
      ])
    );
    expect(statusCode).toBe(200);
  });

  test('GET /products/suggest - success - get suggest products list by paging ', async () => {
    const { body, statusCode } = await request(app).get('/products/suggest');

    expect(body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          product_id: expect.any(Number),
          title: expect.any(String),
          description: expect.any(String),
        }),
      ])
    );
    expect(statusCode).toBe(200);
  });

  test('GET /products/autoCompleteSearch  - success -  get auto complete ', async () => {
    const { body, statusCode } = await request(app)
      .get('/products/autoCompleteSearch')
      .query({ keyword: 'macbook' });

    expect(body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(Number),
          title: expect.any(String),
          description: expect.any(String),
        }),
      ])
    );
    expect(statusCode).toBe(200);
  });

  test('GET /products/search  - success - search products ', async () => {
    const { body, statusCode } = await request(app)
      .get('/products/search')
      .query({ keyword: 'macbook', distance: 20, lat: 25.04253, lng: 121.53298 });

    expect(body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(Number),
          title: expect.any(String),
          description: expect.any(String),
        }),
      ])
    );
    expect(statusCode).toBe(200);
  });

  test('GET /products/details  - success - search products ', async () => {
    const { body, statusCode } = await request(app).get('/products/details').query({ id: 2 });

    expect(body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(Number),
          title: expect.any(String),
          description: expect.any(String),
          price: expect.any(Number),
          number: expect.any(String),
          time: expect.any(String),
          place: expect.any(String),
          address: expect.any(String),
          lat: expect.any(String),
          lng: expect.any(String),
          user_id: expect.any(Number),
          name: expect.any(String),
          email: expect.any(String),
          photo: expect.any(String),
          status: expect.any(Number),
          localTime: expect.any(String),
          images: expect.any(Array),
        }),
      ])
    );
    expect(statusCode).toBe(200);
  });

  test('GET /products/tags - success - get tags by input a product title', async () => {
    const { body, statusCode } = await request(app)
      .get('/products/tags')
      .query({ title: 'macbook AIR 2022九成新太空灰M2晶片8G/512G' });

    expect(body).toEqual(expect.arrayContaining(['macbook', 'AIR', '太空']));
    expect(statusCode).toBe(200);
  });
});
