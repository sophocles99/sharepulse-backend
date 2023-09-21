import bcrypt from "bcrypt";
import db from "../connection.js";
import insertDataIntoDb from "./utils/insert-data-into-db.js";

const seed = ({
  userData,
  profileData,
  portfolioData,
  cashHoldingData,
  shareData,
  portfolioHoldingData,
}) => {
  return db
    .query(`DROP TABLE IF EXISTS transactions;`)
    .then(() => {
      return db.query(`DROP TABLE IF EXISTS portfolio_holdings;`);
    })
    .then(() => {
      return db.query(`DROP TABLE IF EXISTS shares;`);
    })
    .then(() => {
      return db.query(`DROP TABLE IF EXISTS cash_holdings;`);
    })
    .then(() => {
      return db.query(`DROP TABLE IF EXISTS portfolios;`);
    })
    .then(() => {
      return db.query(`DROP TABLE IF EXISTS profiles;`);
    })
    .then(() => {
      return db.query(`DROP TABLE IF EXISTS users;`);
    })
    .then(() => {
      return db.query(`
        CREATE TABLE users (
          user_id SERIAL PRIMARY KEY,
          email VARCHAR(254) NOT NULL UNIQUE,
          password VARCHAR NOT NULL,
          last_login TIMESTAMP DEFAULT NULL
        )`);
    })
    .then(() => {
      return db.query(`
        CREATE TABLE profiles (
          user_id INT PRIMARY KEY REFERENCES users ON DELETE CASCADE,
          first_name VARCHAR(255) NOT NULL,
          last_name VARCHAR(255) NOT NULL,
          birth_date DATE NOT NULL,
          address_1 VARCHAR(255) NOT NULL,
          address_2 VARCHAR(255) NOT NULL,
          address_3 VARCHAR(255),
          address_4 VARCHAR(255),
          postcode VARCHAR(8) NOT NULL
        );`);
    })
    .then(() => {
      return db.query(`
        CREATE TABLE portfolios (
          portfolio_id SERIAL PRIMARY KEY,
          user_id INT REFERENCES users ON DELETE CASCADE,
          name VARCHAR(255) NOT NULL
        );`);
    })
    .then(() => {
      return db.query(`
        CREATE TABLE cash_holdings (
          cash_holding_id SERIAL PRIMARY KEY,
          user_id INT REFERENCES users ON DELETE CASCADE UNIQUE,
          amount NUMERIC(9, 2)
        );`);
    })
    .then(() => {
      return db.query(`
        CREATE TABLE shares (
          share_id SERIAL PRIMARY KEY,
          symbol VARCHAR(10) UNIQUE,
          company_name VARCHAR(255),
          description TEXT,
          exchange VARCHAR(10),
          currency VARCHAR(3),
          country VARCHAR(50),
          sector VARCHAR(50),
          industry VARCHAR(50)
        )`);
    })
    .then(() => {
      return db.query(`
        CREATE TABLE portfolio_holdings (
          portfolio_holdings_id SERIAL PRIMARY KEY,
          portfolio_id INT REFERENCES portfolios ON DELETE RESTRICT,
          share_id INT REFERENCES shares ON DELETE RESTRICT,
          quantity NUMERIC(11, 4)
        )`);
    })
    .then(() => {
      return db.query(`
        CREATE TABLE transactions (
          transaction_id SERIAL PRIMARY KEY,
          user_id INT NOT NULL REFERENCES users ON DELETE RESTRICT,
          type CHAR(1) NOT NULL CHECK (type IN ('D', 'W', 'B', 'S')),
          date_time TIMESTAMP NOT NULL,
          cash_holding_id INT NOT NULL REFERENCES cash_holdings ON DELETE RESTRICT,
          share_id INT REFERENCES shares ON DELETE RESTRICT,
          portfolio_id INT REFERENCES portfolios ON DELETE RESTRICT,
          quantity NUMERIC(11, 4),
          unit_price NUMERIC(11, 4),
          total_amount NUMERIC(11, 4)
        )`);
    })
    .then(() => {
      const userHashPromises = userData.map(async ({ email, password }) => ({
        email,
        password: await bcrypt.hash(password, 12),
      }));
      return Promise.all(userHashPromises);
    })
    .then((userDataHashedPasswords) => {
      return insertDataIntoDb(db, "users", userDataHashedPasswords);
    })
    .then(() => {
      return insertDataIntoDb(db, "profiles", profileData);
    })
    .then(() => {
      return insertDataIntoDb(db, "portfolios", portfolioData);
    })
    .then(() => {
      return insertDataIntoDb(db, "cash_holdings", cashHoldingData);
    })
    .then(() => {
      return insertDataIntoDb(db, "shares", shareData);
    })
    .then(() => {
      return insertDataIntoDb(db, "portfolio_holdings", portfolioHoldingData);
    });
};

export default seed;
