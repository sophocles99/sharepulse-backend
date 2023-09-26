import { insertUser } from "../models/user.model.js";

const registerUser = (req, res, next) => {
  const { user } = req.body;
  insertUser(user)
    .then((user_id) => {
      res.status(201).send({ user_id });
    })
    .catch(next);
};

export { registerUser };
