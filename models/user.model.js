import bcrypt from "bcrypt";
import db from "../db/connection.js";

const createUser = (user) => {
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
    .then(({ rows }) => rows[0].user_id);
};

const authenticateUser = (user) => {
  const { email, password } = user;
  return db
    .query(
      `SELECT password FROM users
      WHERE email = $1;`,
      [email]
    )
    .then(({ rows }) => {
      if (rows.length === 0) return false;
      return bcrypt.compare(password, rows[0].password);
    });
};

export { authenticateUser, createUser };
