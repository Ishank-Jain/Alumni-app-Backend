const { Pool } = require("pg");

console.log("PG_USER =", process.env.PG_USER);
console.log("PG_PASSWORD =", process.env.PG_PASSWORD);
console.log("TYPE =", typeof process.env.PG_PASSWORD);

const pool = new Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: Number(process.env.PG_PORT),
});

module.exports = pool;