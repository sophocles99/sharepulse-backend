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

describe("Register user", () => {
  test("201: returns new user_id", () => {
    const newUser = {
      user: { email: "new@user.com", password: "Password123" },
    };
    return request(app)
      .post("/api/users/register")
      .send(newUser)
      .expect(201)
      .then(({ body }) => {
        expect(body).toEqual({
          msg: "User successfully registered",
          user_id: 11,
        });
      });
  });
  test("400: returns error for malformed user object", () => {
    const newUser = {
      user: { email: "new@user.com" },
    };
    return request(app)
      .post("/api/users/register")
      .send(newUser)
      .expect(400)
      .then(({ body }) => {
        const { msg, details } = body;
        expect(msg).toBe("Bad request");
        expect(details).toBe("'password' is required");
      });
  });
  test("400: returns error for invalid email", () => {
    const newUser = {
      user: { email: "new@usercom" },
    };
    return request(app)
      .post("/api/users/register")
      .send(newUser)
      .expect(400)
      .then(({ body }) => {
        const { msg, details } = body;
        expect(msg).toBe("Bad request");
        expect(details).toBe("'email' must be a valid email");
      });
  });
  test("400: returns error for invalid password", () => {
    const newUser = {
      user: { email: "new@user.com", password: "nocapitals" },
    };
    return request(app)
      .post("/api/users/register")
      .send(newUser)
      .expect(400)
      .then(({ body }) => {
        const { msg, details } = body;
        expect(msg).toBe("Bad request");
        expect(details).toBe(
          "'password' should contain at least 1 uppercase character"
        );
      });
  });
  test("409: returns error for duplicate email", () => {
    const newUser = {
      user: { email: "eldridge.treutel@gmail.com", password: "Password123" },
    };
    return request(app)
      .post("/api/users/register")
      .send(newUser)
      .expect(409)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("Email already in use");
      });
  });
});

describe.only("Login user", () => {
  test("200: returns successful login message", () => {
    const login = {
      user: { email: "eldridge.treutel@gmail.com", password: "Eldridge121" },
    };
    return request(app)
      .post("/api/users/login")
      .send(login)
      .expect(200)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("Logged in");
      });
  });
});
