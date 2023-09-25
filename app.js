import express from "express";
import apiRouter from "./routes/api-router.js";

const app = express();

app.use("/api", apiRouter);

app.get("/", (req, res) => {
  res.status(200).send("Hello from the server!");
});

export default app;
