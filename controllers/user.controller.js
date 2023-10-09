import { insertUser } from "../models/user.model.js";
import validateUser from "../validation/validate-user.js";

const registerUser = (req, res, next) => {
  const { user } = req.body;
  if (!user) return res.status(400).send({ msg: "Bad request" });

  const { error } = validateUser(user);
  if (error) {
    let details = error.details[0].message.replaceAll('"', "'");
    return res.status(400).send({ msg: "Bad request", details });
  }

  insertUser(user)
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
  signInUser(user);
};

export { loginUser, registerUser };
