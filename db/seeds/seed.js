import bcrypt from "bcrypt";
import format from "pg-format";
import db from "../connection.js";

const seed = ({ userData, profileData, portfolioData, cashHoldingData, shareData, portfolioHoldingData }) => {
  return db
    .query(`DROP TABLE IF EXISTS portfolio_holdings;`)
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
        )`)
    })
    .then(() => {
      const userHashPromises = userData.map(async ({ email, password }) => ({
        email,
        hashedPassword: await bcrypt.hash(password, 12),
      }));
      return Promise.all(userHashPromises);
    })
    .then((usersWithHashedPasswords) => {
      const insertUsersQueryStr = format(
        `
        INSERT INTO users (
          email,
          password
        ) VALUES %L;`,
        usersWithHashedPasswords.map(({ email, hashedPassword }) => [
          email,
          hashedPassword,
        ])
      );
      return db.query(insertUsersQueryStr);
    })
    .then(() => {
      const insertProfilesQueryStr = format(
        `
        INSERT INTO profiles (
          user_id,
          first_name,
          last_name,
          birth_date,
          address_1,
          address_2,
          address_3,
          address_4,
          postcode
        ) VALUES %L;`,
        profileData.map(
          ({
            user_id,
            first_name,
            last_name,
            birth_date,
            address_1,
            address_2,
            address_3,
            address_4,
            postcode,
          }) => [
            user_id,
            first_name,
            last_name,
            birth_date,
            address_1,
            address_2,
            address_3,
            address_4,
            postcode,
          ]
        )
      );
      return db.query(insertProfilesQueryStr);
    })
    .then(() => {
      const insertPortfoliosQueryStr = format(
        `
        INSERT INTO portfolios (
          user_id,
          name
        ) VALUES %L;`,
        portfolioData.map(({ user_id, name }) => [user_id, name])
      );
      return db.query(insertPortfoliosQueryStr);
    })
    .then(() => {
      const insertCashHoldingsQueryStr = format(
        `
        INSERT INTO cash_holdings (
          user_id,
          amount
        ) VALUES %L;`,
        cashHoldingData.map(({ user_id, amount }) => {
          return [user_id, amount];
        })
      );
      return db.query(insertCashHoldingsQueryStr);
    })
    .then(() => {
      const insertSharesQueryStr = format(
        `
        INSERT INTO shares (
          symbol,
          company_name,
          description,
          exchange,
          currency,
          country,
          sector,
          industry
        ) VALUES %L;`,
        shareData.map(
          ({
            symbol,
            company_name,
            description,
            exchange,
            currency,
            country,
            sector,
            industry,
          }) => [
            symbol,
            company_name,
            description,
            exchange,
            currency,
            country,
            sector,
            industry,
          ]
        )
      );
      return db.query(insertSharesQueryStr);
    })
    .then(() => {
      const insertPortfolioHoldingsQueryStr = format(
        `
        INSERT INTO portfolio_holdings (
          portfolio_id,
          share_id,
          quantity
        ) VALUES %L;`,
        portfolioHoldingData.map(({ portfolio_id, share_id, quantity }) => {
          return [portfolio_id, share_id, quantity];
        })
      );
      return db.query(insertPortfolioHoldingsQueryStr);
    })
};

export default seed;
