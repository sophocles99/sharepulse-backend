import express from "express";
import apiRouter from "./routes/api-router.js";

const app = express();

app.use("/api", apiRouter);

export default app;
