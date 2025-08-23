import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT), 
  database: process.env.DB_NAME,
});
console.log("ENV:", process.env.DB_USER, process.env.DB_PORT, process.env.DB_NAME);

export default pool;
