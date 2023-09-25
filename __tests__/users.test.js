import request from "supertest";

import app from "../app.js";
import * as db from "../db/connection.js";
import seed from "../db/seeds/seed.js";
// import * as testData from "../data/test-data/index.js";

describe("Testing the testing", () => {
  test("Say hello", () => {
    return request(app)
      .get("/")
      .expect(200)
      .then(({text}) => {
        expect(text).toEqual("Hello from the server!");
        console.log(text);
      });
  });
});
