import bcrypt from "bcrypt";
import db from "../connection.js";
import {
  createUsersStr,
  createProfilesStr,
  createPortfoliosStr,
  createCashHoldingsStr,
  createSharesStr,
  createPortfolioHoldingsStr,
  createTransactionsStr,
  createTransactionTriggersStr
} from "./db-definitions.js";
import insertDataIntoDb from "./utils/insert-data-into-db.js";

const seed = ({
  userData,
  profileData,
  portfolioData,
  cashHoldingData,
  shareData,
  portfolioHoldingData,
  transactionData,
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
      return db.query(createUsersStr);
    })
    .then(() => {
      return db.query(createProfilesStr);
    })
    .then(() => {
      return db.query(createPortfoliosStr);
    })
    .then(() => {
      return db.query(createCashHoldingsStr);
    })
    .then(() => {
      return db.query(createSharesStr);
    })
    .then(() => {
      return db.query(createPortfolioHoldingsStr);
    })
    .then(() => {
      return db.query(createTransactionsStr);
    })
    .then(() => {
      return db.query(createTransactionTriggersStr);
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
    })
    .then(() => {
      return insertDataIntoDb(db, "transactions", transactionData);
    });
};

export default seed;
