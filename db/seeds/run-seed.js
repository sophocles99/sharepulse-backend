// const devData = require('../data/development-data/index.js');
import seed from "./seed.js";
import db from "../connection.js";

const runSeed = () => {
  return seed().then(() => db.end());
};

runSeed();
