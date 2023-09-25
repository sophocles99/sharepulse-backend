import request from "supertest";

import app from "../app.js";
import db from "../db/connection.js";
import seed from "../db/seeds/seed.js";
import testData from "../db/data/test-data/index.js";

beforeEach(() => {
  return seed(testData);
});

afterAll(() => {
  return db.end();
});

describe("Testing the testing", () => {
  test("Say hello", () => {
    return request(app)
      .get("/")
      .expect(200)
      .then(({ text }) => {
        expect(text).toEqual("Hello from the server!");
        console.log(text);
      });
  });
});
