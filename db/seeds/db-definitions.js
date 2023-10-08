export const createUsersStr = `
  CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    email VARCHAR(254) NOT NULL UNIQUE,
    password VARCHAR(60) NOT NULL,
    last_login TIMESTAMP DEFAULT NULL
  )`;

// profiles table has one-to-one relationship with users table
export const createProfilesStr = `
  CREATE TABLE profiles (
    user_id INT PRIMARY KEY REFERENCES users ON DELETE RESTRICT,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    birth_date DATE NOT NULL,
    street_address_1 VARCHAR(255) NOT NULL,
    street_address_2 VARCHAR(255),
    street_address_3 VARCHAR(255),
    post_town VARCHAR(255),
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
    amount NUMERIC(9, 2) NOT NULL DEFAULT 0
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
    quantity NUMERIC(11, 4),
    UNIQUE (portfolio_id, share_id)
  );`;

// transaction types as follows:
// cash transaction: D - deposit, W - withdrawal
// share transaction: B - buy, S - sell
// total_amount is always a positive number
export const createTransactionsStr = `
  CREATE TABLE transactions (
    transaction_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users ON DELETE RESTRICT,
    type CHAR(1) NOT NULL,
    date_time TIMESTAMP NOT NULL,
    share_id INT REFERENCES shares ON DELETE RESTRICT,
    portfolio_id INT REFERENCES portfolios ON DELETE RESTRICT,
    quantity NUMERIC(11, 4),
    unit_price NUMERIC(11, 4),
    total_amount NUMERIC(11, 4) NOT NULL
  );`;

export const createTransactionTriggersStr = `
  CREATE OR REPLACE FUNCTION check_type() RETURNS TRIGGER AS $$
    BEGIN
      IF NEW.type NOT IN ('D', 'W', 'B', 'S') THEN
        RAISE EXCEPTION 'invalid transaction type: %', NEW.type
        USING HINT = 'type must be ''D'', ''W'', ''B'', or ''S''', ERRCODE = '39P01';
      END IF;
      RETURN NEW;
    END;
  $$ LANGUAGE plpgsql;

  CREATE TRIGGER check_type
    BEFORE INSERT ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION check_type();


  CREATE OR REPLACE FUNCTION check_share_transaction_fields() RETURNS TRIGGER AS $$
    BEGIN
      IF (NEW.type = 'D' OR NEW.type = 'W') THEN
        IF NEW.share_id IS NOT NULL THEN RAISE EXCEPTION 'share_id must be null for cash transaction'
          USING ERRCODE = '39P01'; END IF;
        IF NEW.portfolio_id IS NOT NULL THEN RAISE EXCEPTION 'portfolio_id must be null for cash transaction'
          USING ERRCODE = '39P01'; END IF;
        IF NEW.quantity IS NOT NULL THEN RAISE EXCEPTION 'quantity must be null for cash transaction'
          USING ERRCODE = '39P01'; END IF;
        IF NEW.unit_price IS NOT NULL THEN RAISE EXCEPTION 'unit_price must be null for cash transaction'
          USING ERRCODE = '39P01'; END IF;
      END IF;
      IF (NEW.type = 'B' OR NEW.type = 'S') THEN
        IF NEW.share_id IS NULL THEN RAISE EXCEPTION 'share_id required for share transaction'
          USING ERRCODE = '39P01'; END IF;
        IF NEW.portfolio_id IS NULL THEN RAISE EXCEPTION 'portfolio_id required for share transaction'
          USING ERRCODE = '39P01'; END IF;
        IF NEW.quantity IS NULL THEN RAISE EXCEPTION 'quantity required for share transaction'
          USING ERRCODE = '39P01'; END IF;
        IF NEW.unit_price IS NULL THEN RAISE EXCEPTION 'unit_price required for share transaction'
          USING ERRCODE = '39P01'; END IF;
      END IF;
      RETURN NEW;
    END;
  $$ LANGUAGE plpgsql;

  CREATE TRIGGER check_share_transaction_fields
    BEFORE INSERT ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION check_share_transaction_fields();


  CREATE OR REPLACE FUNCTION check_user_owns_portfolio() RETURNS TRIGGER AS $$
    BEGIN
      IF (NEW.type = 'B' OR NEW.type = 'S') AND
      (SELECT COUNT(*) FROM portfolios WHERE portfolio_id = NEW.portfolio_id AND user_id = NEW.user_id) = 0 THEN
        RAISE EXCEPTION 'user_id must match owner of portfolio_id %', NEW.portfolio_id
        USING ERRCODE = '39P01';
      END IF;      
      RETURN NEW;
    END;
  $$ LANGUAGE plpgsql;

  CREATE TRIGGER check_user_owns_portfolio
    BEFORE INSERT ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION check_user_owns_portfolio();


  CREATE OR REPLACE FUNCTION check_total_amount() RETURNS TRIGGER AS $$
    BEGIN
      IF (NEW.type = 'B' OR NEW.type = 'S') AND NEW.total_amount <> ROUND(NEW.quantity * NEW.unit_price, 4) THEN
        RAISE EXCEPTION 'incorrect total_amount' USING ERRCODE = '39P01';
      END IF;
      RETURN NEW;
    END;
  $$ LANGUAGE plpgsql;
  
  CREATE TRIGGER check_total_amount
    BEFORE INSERT ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION check_total_amount();


  CREATE OR REPLACE FUNCTION update_cash_holdings() RETURNS TRIGGER AS $$
    BEGIN
      IF (NEW.type = 'D' OR NEW.type = 'S') THEN
        UPDATE cash_holdings
        SET amount = amount + NEW.total_amount
        WHERE user_id = NEW.user_id;
      END IF;
      IF (NEW.type = 'W' OR NEW.type = 'B') THEN
        UPDATE cash_holdings
        SET amount = amount - NEW.total_amount
        WHERE user_id = NEW.user_id;
      END IF;
      RETURN NULL;
    END;
  $$ LANGUAGE plpgsql;

  CREATE TRIGGER update_cash_holdings
    AFTER INSERT ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_cash_holdings();


  CREATE OR REPLACE FUNCTION update_portfolio_holdings() RETURNS TRIGGER AS $$
    DECLARE
      quantity_adjustment NUMERIC;
    BEGIN
      IF (NEW.type = 'B' OR NEW.type = 'S') THEN
        CASE
          WHEN NEW.type = 'B' THEN
            quantity_adjustment := NEW.quantity;
          WHEN NEW.type = 'S' THEN
            quantity_adjustment := 0 - NEW.quantity;
        END CASE;

        IF (SELECT COUNT(*) FROM portfolio_holdings
        WHERE portfolio_id = NEW.portfolio_id AND share_id = NEW.share_id) = 0 THEN
          INSERT INTO portfolio_holdings (portfolio_id, share_id, quantity)
          VALUES (NEW.portfolio_id, NEW.share_id, quantity_adjustment);
        ELSE
          UPDATE portfolio_holdings
          SET quantity = quantity + quantity_adjustment
          WHERE portfolio_id = NEW.portfolio_id AND share_id = NEW.share_id;
        END IF;
      END IF;
      RETURN NULL;
    END;
  $$ LANGUAGE plpgsql;

  CREATE TRIGGER update_portfolio_holdings
    AFTER INSERT ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_portfolio_holdings();
  `;
