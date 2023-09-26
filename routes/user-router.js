import { Router } from "express";
import { postUser } from "../controllers/users.controller.js";

const userRouter = Router();

userRouter.post("/", postUser);

export default userRouter;
