"use strict";

const mysql = require("mysql2");

const pool = mysql.createPool({
    host: "remotemysql.com",
    user: "bQS9a8yxca",
    password: "6FJqwlrvjR",
    database: "bQS9a8yxca",
    connectionLimit: 100,
    dateStrings: true,
  });

module.exports = pool;
