import { insertUser } from "../models/users.model.js";

const postUser = (req, res, next) => {
  const { user } = req.body;
  insertUser(user)
    .then((user_id) => {
      res.status(201).send({ user_id });
    })
    .catch(next);
};

export { postUser };
