const express = require('express');
const app = express();
const engine = require('ejs-locals');
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = require('./util/message');
const morganBody = require('morgan-body');

// socket set up
io(server);

// env
require('dotenv').config();
const { SERVER_PORT, API_VERSION } = process.env;

// static files
app.use('/public', express.static(__dirname + '/public'));
app.use('/images', express.static(__dirname + '/images'));
// app.use('/test', express.static(__dirname + '/test'));

// middileware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// hook morganBody to express app
morganBody(app, { logResponseBody: false });

// views
app.engine('ejs', engine);
app.set('view engine', 'ejs');
app.use(require('./routes/views_route'));

// API route
app.use('/api/' + API_VERSION, [
  require('./routes/products_route'),
  require('./routes/orders_route'),
  require('./routes/messages_route'),
]);

// Page not found
app.use((req, res, next) => {
  res.status(404).render('404.ejs', { title: 'Not Found' });
});

// Error handling
app.use((err, req, res, next) => {
  console.log(err);
  res.status(500).send('Internal Server Error');
});

server.listen(SERVER_PORT, () => {
  console.log(`Server running on port ${SERVER_PORT}`);
});
