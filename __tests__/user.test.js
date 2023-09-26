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
  test("201: returns new user_id", () => {
    const newUser = {
      user: { email: "new@user.com", password: "Password123" },
    };
    return request(app)
      .post("/api/user/register")
      .send(newUser)
      .expect(201)
      .then(({ body }) => {
        expect(body).toEqual({
          user_id: 11,
        });
      });
  });
  test("400: returns error for malformed user object", () => {
    const newUser = {
      user: { email: "new@user.com" },
    };
    return request(app)
      .post("/api/user/register")
      .send(newUser)
      .expect(400)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("Bad request");
      });
  });
});
