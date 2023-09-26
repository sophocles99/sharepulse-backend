import bcrypt from "bcrypt";
import db from "../db/connection.js";

const insertUser = (user) => {
  const { email, password } = user;
  return bcrypt
    .hash(password, 12)
    .then((hashedPassword) => {
      return db.query(
        `INSERT INTO users
       (email, password)
       VALUES ($1, $2)
       RETURNING *;`,
        [email, hashedPassword]
      );
    })
    .then(({ rows }) => rows[0].user_id)
    .catch((err) => console.log(err));
};

export { insertUser };
