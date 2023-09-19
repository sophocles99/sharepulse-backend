import format from "pg-format";
import db from "../connection.js";

const seed = ({ userData }) => {
  console.log(userData.map(user => user.postcode.length));
  return db
    .query(`DROP TABLE IF EXISTS users;`)
    .then(() => {
      return db.query(`CREATE TABLE users (
      first_name VARCHAR(255),
      last_name VARCHAR(255),
      email VARCHAR(254),
      birth_date DATE,
      address_1 VARCHAR(255),
      address_2 VARCHAR(255),
      address_3 VARCHAR(255),
      address_4 VARCHAR(255),
      postcode VARCHAR(8)
    );`);
    })
    .then(() => {
      const insertUsersQueryStr = format(
        `INSERT INTO users (first_name,
                            last_name,
                            email,
                            birth_date,
                            address_1,
                            address_2,
                            address_3,
                            address_4,
                            postcode) VALUES %L;`,
        userData.map(
          ({
            first_name,
            last_name,
            email,
            birth_date,
            address_1,
            address_2,
            address_3,
            address_4,
            postcode,
          }) => [
            first_name,
            last_name,
            email,
            birth_date,
            address_1,
            address_2,
            address_3,
            address_4,
            postcode,
          ]
        )
      );
      return db.query(insertUsersQueryStr);
    });
};

export default seed;
