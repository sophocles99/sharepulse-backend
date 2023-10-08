import express from "express";
import apiRouter from "./routes/api-router.js";
import {
  handlePsqlErrors,
  handleCustomErrors,
  handleServerErrors,
} from "./errors.js";

const app = express();

app.use(express.json());

app.use("/api", apiRouter);

app.get("/", (req, res) => {
  res.status(200).send({ msg: "Server listening" });
});

app.all("*", (_, res) => {
  res.status(404).send({ msg: "Route not found" });
});

app.use(handlePsqlErrors);

app.use(handleCustomErrors);

app.use(handleServerErrors);

export default app;
