import { Router } from "express";
import { createUser } from "../controllers/users.controller.js";

const userRouter = Router();

userRouter.get("/createuser", createUser);

export default userRouter;
