import { insertUser } from "../models/user.model.js";
import validateUser from "../validation/validate-user.js";

const registerUser = (req, res, next) => {
  const { user } = req.body;
  if (!user) return res.status(400).send({ msg: "user object required" });

  const { error } = validateUser(user);
  if (error) return res.status(400).send({ msg: error.details[0].message });

  insertUser(user)
    .then((user_id) => {
      res.status(201).send({ user_id });
    })
    .catch(next);
};

const loginUser = (req, res, next) => {
  const { user } = req.body;
  signInUser(user);
};

export { loginUser, registerUser };
