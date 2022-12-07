const express = require('express');
const app = express();
const engine = require('ejs-locals');
const http = require('http');
const server = http.createServer(app);
const io = require('./util/socket_io');
const rateLimiter = require('./util/rate_limiter');

// socket set up
io(server);

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

class Exception extends Error {
  constructor(msg, log, functionName) {
    super(msg);
    this.log = log;
    this.functionName = functionName;
  }

  get fullLog() {
    return JSON.stringify({
      timestamp: new Date(),
      log: this.log,
      function_name: this.functionName,
    });
  }
}

app.use((err, req, res, next) => {
  console.error(err.fullLog);
  res.status(500).json(err.stack);
});

server.listen(SERVER_PORT, () => {
  console.log(`Server running on port ${SERVER_PORT}`);
});
