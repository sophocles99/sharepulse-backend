import db from "../connection.js";

const seed = () => {
  return db
    .query(`DROP TABLE IF EXISTS users;`)
    .then(() => {
      return db.query(`CREATE TABLE users (
      first_name VARCHAR(255),
      last_name VARCHAR(255),
      email VARCHAR(254),
      birth_date DATE,
      
    );`);
    })
    // .then(() => {
    //   return db.query(`INSERT INTO `);
    // });
};

export default seed;
