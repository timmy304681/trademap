# Trademap

Trademap is dedicated to offering users a location-based trading platform. Offered consumers a user-friendly and convenient platform for face-to-face appointment reservations.

- Website: <a href="https://trademap.site/">https://trademap.site</a>
- docker image: <a href="https://hub.docker.com/r/timmy304681/trademap">https://hub.docker.com/r/timmy304681/trademap</a>

## Table of Contents

- [Tech Stack](#tech-stack)
- [System Architecture](#system-architecture)
- [Database Schema](#database-schema)
- [Features](#features)
- [Demo](#demo)
- [How to use it?](#how-to-use-it)

## System Architecture

### AWS EC2 server

<img src="./docs/architecture.png" width= 500px>

### Serverless

Build and deploy **Trademap** with the speed and immutability of container. Use **Fargate** with Amazon **ECS** to easily run and scale my containerized data processing workloads.
<img src="./docs/ecs.png" width= 500px>

## Tech Stack

- **Server**: Node.js, Express, Nginx, MySQL, MongoDB, Redis
- **Client**: JavaScript, jQuery, Bootstrap
- **Cloud Services**: EC2, ECS, RDS, ElastiCache, S3, CloudFront, ELB
- **CI/CD**: GitHub Actions
- **Testing**: Jest
- **Container**: docker
- **Others**: Socket.IO, Google Maps API , HERE API, Maptiler API, LINE Notify API

## Database Schema

<img src="./docs/table_schema.png" width= 500px>

## Features

- Calculated the real distance efficiently between the user and all products, and rendered the products to the user from near to far.
- Reduced the loading of the main database (**MySQL**) and solved the heavy reads and writes of chat room messages with MongoDB.
- Package Trademap into a **Docker** image, and easily deployed on AWS ECS (**Fargate launch type**) with load balancer to achieve **serverless** and **auto-scaling**.
- Offered an automatic detect tags system with mandarin NLP (**Jieba**).
- Programmed rate limiter with the **sliding log algorithm** and prevented malicious login attempts.
- Implemented a **Redis** cache of product details and boosted the user experience.
- Built a private communication chat room and instant messaging with WebSocket (**Socket.IO**).
- Rendered the location on the map immediately with **Here** and **Google Map** API.
- Sent users arrival notices instantly with **Line Notify**.
- Continually deployed with **GitHub actions**, and performed unit/integration tests with **Jest**.

## Demo

#### Product Search

<img src="./docs/product_search.gif" width= 500px>

#### Product Suggest

<img src="./docs/suggest.gif" width= 500px>

#### Automatic detect tags

<img src="./docs/tags.gif" width= 500px>

#### Arrival notices

<img src="./docs/line_notify.png" width= 300px>

<img src="./docs/line.png" width= 300px>

## How to use it?

1. Clone the project

```
git clone git@github.com:timmy304681/trademap.git
```

2. Install NPM dependencies

```
npm install
```

3. Create a `.env` file under root directory, and `.env-sample` is for your reference.

4. Set up your own database

```
npx sequelize-cli db:migrate
```

5. Start the server

```
node app.js
```

#### Containerizing

Offer a docker image and `docker-compose.yml`

```
docker pull timmy304681/trademap:latest
```
