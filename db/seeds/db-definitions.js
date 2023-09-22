export const createUsersStr = `
  CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    email VARCHAR(254) NOT NULL UNIQUE,
    password VARCHAR NOT NULL,
    last_login TIMESTAMP DEFAULT NULL
  )`;

export const createProfilesStr = `
  CREATE TABLE profiles (
    user_id INT PRIMARY KEY REFERENCES users ON DELETE RESTRICT,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    birth_date DATE NOT NULL,
    address_1 VARCHAR(255) NOT NULL,
    address_2 VARCHAR(255) NOT NULL,
    address_3 VARCHAR(255),
    address_4 VARCHAR(255),
    postcode VARCHAR(8) NOT NULL
  );`;

export const createPortfoliosStr = `
  CREATE TABLE portfolios (
    portfolio_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL
  );`;

export const createCashHoldingsStr = `
  CREATE TABLE cash_holdings (
    user_id INT PRIMARY KEY REFERENCES users ON DELETE RESTRICT,
    amount NUMERIC(9, 2)
  );`;

export const createSharesStr = `
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
  );`;

export const createPortfolioHoldingsStr = `
    CREATE TABLE portfolio_holdings (
      portfolio_holdings_id SERIAL PRIMARY KEY,
      portfolio_id INT REFERENCES portfolios ON DELETE RESTRICT,
      share_id INT REFERENCES shares ON DELETE RESTRICT,
      quantity NUMERIC(11, 4)
    );`;

export const createTransactionsStr = `
  CREATE TABLE transactions (
    transaction_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users ON DELETE RESTRICT,
    type CHAR(1) NOT NULL CHECK (type IN ('D', 'W', 'B', 'S')),
    date_time TIMESTAMP NOT NULL,
    share_id INT REFERENCES shares ON DELETE RESTRICT,
    portfolio_id INT REFERENCES portfolios ON DELETE RESTRICT,
    quantity NUMERIC(11, 4),
    unit_price NUMERIC(11, 4),
    total_amount NUMERIC(11, 4) NOT NULL,
    CONSTRAINT "share_id: null for cash transaction, required for trade"
      CHECK (((type = 'D' OR type = 'W') AND share_id IS NULL) OR
        ((type = 'B' OR type = 'S') AND share_id IS NOT NULL)),
    CONSTRAINT "portfolio_id: null for cash transaction, required for trade"
      CHECK (((type = 'D' OR type = 'W') AND portfolio_id IS NULL) OR
        ((type = 'B' OR type = 'S') AND portfolio_id IS NOT NULL)),
    CONSTRAINT "quantity: null for cash transaction, required for trade"
      CHECK (((type = 'D' OR type = 'W') AND quantity IS NULL) OR
        ((type = 'B' OR type = 'S') AND quantity IS NOT NULL)),
    CONSTRAINT "unit_price: null for cash transaction, required for trade"
      CHECK (((type = 'D' OR type = 'W') AND unit_price IS NULL) OR
        ((type = 'B' OR type = 'S') AND unit_price IS NOT NULL)),
    CONSTRAINT "total_amount: must equal quantity * unit_price"
      CHECK (((type = 'B' OR type = 'S') AND total_amount = ROUND(quantity * unit_price, 4)) OR
        (type = 'D' OR type = 'W'))
  );`;
