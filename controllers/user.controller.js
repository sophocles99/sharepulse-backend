import jwt from "jsonwebtoken";
import { authenticateUser, createUser } from "../models/user.model.js";
import { validateLogin, validateUser } from "../validation/user.validate.js";

const registerUser = (req, res, next) => {
  const { user } = req.body;
  if (!user) return res.status(400).send({ msg: "Bad request" });

  const { error } = validateUser(user);
  if (error) {
    let details = error.details[0].message.replaceAll('"', "'");
    return res.status(400).send({ msg: "Bad request", details });
  }

  createUser(user)
    .then((user_id) => {
      res.status(201).send({ msg: "User successfully registered", user_id });
    })
    .catch((err) => {
      if (err.code === "23505")
        return res.status(409).send({ msg: "Email already in use" });
      next(err);
    });
};

const loginUser = (req, res, next) => {
  const { user } = req.body;
  if (!user) return res.status(400).send({ msg: "Bad request" });

  const { error } = validateLogin(user);
  if (error) {
    let details = error.details[0].message.replaceAll('"', "'");
    return res.status(400).send({ msg: "Bad request", details });
  }

  authenticateUser(user)
    .then((loggedInUser) => {
      if (loggedInUser) {
        const token = jwt.sign(
          { user_id: loggedInUser.user_id },
          process.env.JWT_SECRET
        );
        return res.status(200).send({ msg: "Logged in", token });
      }
      res.status(400).send({ msg: "Invalid email or password" });
    })
    .catch(next);
};

export { loginUser, registerUser };
