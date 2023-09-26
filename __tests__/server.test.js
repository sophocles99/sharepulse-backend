import request from "supertest";
import app from "../app.js";

describe("Server tests", () => {
  test("200: server listening", () => {
    return request(app)
      .get("/")
      .expect(200)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("Server listening");
      });
  });
  test("404: returns msg for unknown endpoint", () => {
    return request(app)
      .get("/api/nonexistent")
      .expect(404)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("Not found");
      });
  });
});
