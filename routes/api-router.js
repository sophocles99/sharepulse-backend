import { Router } from "express";
import userRouter from "./user-router.js";

const apiRouter = Router();

apiRouter.use("/users", userRouter);

export default apiRouter;
