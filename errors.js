const handlePsqlErrors = (err, req, res, next) => {
  if (err.code === "22P02" || err.code === "23502" || err.code === "23505") {
    console.log("psql error", err.code);
    res.status(400).send({ msg: "Bad request" });
  } else if (err.code === "23503") {
    console.log("psql error", err.code);
    res.status(404).send({ msg: "Not found" });
  } else next(err);
};

const handleCustomErrors = (err, req, res, next) => {
  if (err.msg) {
    res.status(err.status).send({ msg: err.msg });
  } else next(err);
};

const handleServerErrors = (err, req, res, next) => {
  console.log(err);
  next(err);
};

export { handlePsqlErrors, handleCustomErrors, handleServerErrors };
