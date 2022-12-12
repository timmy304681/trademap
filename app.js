const express = require('express');
const app = express();
const engine = require('ejs-locals');
const http = require('http');
const server = http.createServer(app);
const webSocket = require('./sockets/socket');
const rateLimiter = require('./util/rate_limiter');
const { SQLError } = require('./util/error_handler');

// webSocket set up
webSocket(server);

// env
require('dotenv').config();
const { SERVER_PORT, API_VERSION } = process.env;

// static files
app.use('/public', express.static(__dirname + '/public'));
app.use('/images', express.static(__dirname + '/images'));

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// views
app.engine('ejs', engine);
app.set('view engine', 'ejs');
app.use(require('./routes/views_route'));

// API route
app.use('/api/' + API_VERSION, rateLimiter, [
  require('./routes/products_route'),
  require('./routes/orders_route'),
  require('./routes/messages_route'),
  require('./routes/users_route'),
  require('./routes/reserve_route'),
]);

// line notify api
app.use('/login/line_notify', require('./routes/line_route'));

// Page not found
app.use((req, res, next) => {
  res.status(404).redirect('/404');
});

// Error handling

app.use((err, req, res, next) => {
  if (err instanceof SQLError) {
    console.error(err.errorLog);
    return res.status(500).json({ msg: err.message });
  }
  console.log('error handler');
  console.error(err);
  res.status(500).json({ error: 'Server error' });
});

server.listen(SERVER_PORT, () => {
  console.log(`Server running on port ${SERVER_PORT}`);
});
