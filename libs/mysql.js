import mysql from "mysql2/promise";

export const myConexion = await mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "pampas_travel",
});
