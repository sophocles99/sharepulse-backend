export const createUsersStr = `
  CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    email VARCHAR(254) NOT NULL UNIQUE,
    password VARCHAR NOT NULL,
    last_login TIMESTAMP DEFAULT NULL
  )`;

// profiles table has one-to-one relationship with users table
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

// one user can have multiple portfolios
export const createPortfoliosStr = `
  CREATE TABLE portfolios (
    portfolio_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users ON DELETE RESTRICT,
    name VARCHAR(255) NOT NULL
  );`;

// currently only one cash holding per user, in GBP
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

// transaction types as follows:
// cash transaction: D - deposit, W - withdrawal
// share trade: B - buy, S - sell

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

export const createTransactionTriggersStr = `
  CREATE OR REPLACE FUNCTION check_user_owns_portfolio() RETURNS TRIGGER AS $$
    BEGIN
      IF (NEW.type = 'B' OR NEW.type = 'S') AND
        (SELECT COUNT(*) FROM portfolios
        WHERE portfolio_id = NEW.portfolio_id AND user_id = NEW.user_id) = 0 THEN
        RAISE EXCEPTION 'user_id does not match portfolio_id';
      END IF;      
      RETURN NEW;
    END;
  $$ LANGUAGE plpgsql;

  CREATE TRIGGER validate_user_id_portfolio_id
    BEFORE INSERT ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION check_user_owns_portfolio();
  `;
