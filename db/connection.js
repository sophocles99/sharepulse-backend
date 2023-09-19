import pg from "pg";
const { Pool } = pg;

import dotenv from "dotenv";
import {fileURLToPath} from 'url';
const __dirname = fileURLToPath(new URL('.', import.meta.url));

const ENV = process.env.NODE_ENV || "development";
dotenv.config({
  path: `${__dirname}../.env.${ENV}`,
});

if (!process.env.PGDATABASE) {
  throw new Error("No PGDATABASE configured");
}

export default new Pool();
