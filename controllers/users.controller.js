import { insertUser } from "../models/users.model.js";

const postUser = (req, res) => {
  const { user } = req.body;
  insertUser(user)
    .then((user_id) => {
      res.status(201).send({
        msg: "New user created",
        user_id: user_id,
      });
    })
    .catch((err) => console.log(err));
};

export { postUser };
