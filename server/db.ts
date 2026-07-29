import mysql from "mysql2/promise";
import { ResultSetHeader, RowDataPacket } from "mysql2";

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "job_search",
};

// Create pool using the newly created database
const db = mysql.createPool({
  ...dbConfig,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export async function initializeDatabase() {
  // Connect without selecting a database
  const connection = await mysql.createConnection(dbConfig);

  // Create database if it does not exist
  await connection.query(`
    CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\`
  `);

  await connection.end();

  console.log(`Database "${dbConfig.database}" is ready.`);
}

export default db;
