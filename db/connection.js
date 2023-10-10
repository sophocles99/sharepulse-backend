import pg from "pg";
import { config } from "dotenv";
import { fileURLToPath } from "url";

const { Pool } = pg;

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const ENV = process.env.NODE_ENV || "development";

config({
  path: `${__dirname}../.env.${ENV}`,
});

if (!process.env.PGDATABASE) {
  throw new Error("No PGDATABASE configured");
}

export default new Pool();
