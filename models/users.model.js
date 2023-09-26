import bcrypt from "bcrypt";
import db from "../db/connection.js";

const insertUser = (user) => {
  const { email, password } = user;
  if (!email || !password) {
    const err = new Error();
    err.msg = "Bad request";
    err.status = 400;
    throw err;
  }
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
    .then(({ rows }) => rows[0].user_id);
};

export { insertUser };
