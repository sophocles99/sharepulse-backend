import bcrypt from "bcrypt";
import format from "pg-format";
import db from "../connection.js";

const seed = ({ userData, profileData }) => {
  return db
    .query(`DROP TABLE IF EXISTS profiles;`)
    .then(() => {
      return db.query(`DROP TABLE IF EXISTS users;`);
    })
    .then(() => {
      return db.query(`CREATE TABLE users (
        user_id SERIAL PRIMARY KEY,
        email VARCHAR(254) NOT NULL UNIQUE,
        password VARCHAR NOT NULL,
        last_login TIMESTAMP DEFAULT NULL
      )`);
    })
    .then(() => {
      return db.query(`CREATE TABLE profiles (
        user_id INT PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
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
      const userHashPromises = userData.map(async ({ email, password }) => ({
        email,
        hashedPassword: await bcrypt.hash(password, 12),
      }));
      return Promise.all(userHashPromises);
    })
    .then((usersWithHashedPasswords) => {
      const insertUsersQueryStr = format(
        `INSERT INTO users (
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
        `INSERT INTO profiles (
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
    });
};

export default seed;
