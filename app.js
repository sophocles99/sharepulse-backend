import express from "express";
import apiRouter from "./routes/api-router.js";

const app = express();

app.use(express.json());

app.use("/api", apiRouter);

app.get("/", (req, res) => {
  res.status(200).send({ msg: "Server listening" });
});

app.all("*", (_, res) => {
  res.status(404).send({ msg: "Not found" });
});

export default app;
