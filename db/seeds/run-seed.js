// const devData = require('../data/development-data/index.js');
import seed from "./seed.js";
import db from "../connection.js";
import devData from "../data/development-data/index.js";

const runSeed = () => {
  return seed(devData).then(() => db.end());
};

runSeed();
