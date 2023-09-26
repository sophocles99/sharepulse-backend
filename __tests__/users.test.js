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

describe("Create user", () => {
  test("201: returns msg confirming user created", () => {
    const newUser = {
      user: { email: "new@user.com", password: "Password123" },
    };
    return request(app)
      .post("/api/users/")
      .send(newUser)
      .expect(201)
      .then(({ body }) => {
        expect(body).toEqual({
          msg: "New user created",
          user_id: 11,
        });
      });
  });
});
