const mysql = require('mysql2/promise');

// my sql database
require('dotenv').config();
const DB_HOST = process.env.DB_HOST;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_NAME = process.env.DB_NAME;
const DB_DATABASE = process.env.DB_DATABASE;

const pool = mysql.createPool({
    host: DB_HOST,
    user: DB_NAME,
    database: DB_DATABASE,
    password: DB_PASSWORD,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 10,
});

module.exports = pool;
