const express = require('express');
const app = express();
const { wrapAsync } = require('./util/util');
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = require('./test/message');

// socket set up
io(server);

// env
require('dotenv').config();
const { GOOGLE_API_KEY, SERVER_PORT, HERE_API_KEY, API_VERSION } = process.env;
app.use('/public', express.static(__dirname + '/public'));
app.use('/images', express.static(__dirname + '/images'));
app.use('/test', express.static(__dirname + '/test'));

// view
app.set('view engine', 'ejs');

app.get('/here', (req, res) => {
  res.render('./here.ejs', {
    HERE_API_KEY: HERE_API_KEY,
  });
});

// mock data
const data = require('./test/mockData');

app.get(
  '/data',
  wrapAsync(async (req, res) => {
    res.status(200).json(data);
  })
);

app.use(function (err, req, res, next) {
  console.log(err);
  res.status(500).send('Internal Server Error');
});

server.listen(SERVER_PORT, () => {
  console.log(`Server running on port ${SERVER_PORT}`);
});
