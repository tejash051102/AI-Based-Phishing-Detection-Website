import request from "supertest";
import { describe, expect, it } from "vitest";
import app from "../src/app.js";

describe("auth validation", () => {
  it("rejects invalid registration payloads before database writes", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send({ name: "A", email: "not-email", password: "short" })
      .expect(422);

    expect(response.body.message).toBe("Validation failed");
    expect(response.body.errors.map((error) => error.field)).toEqual(
      expect.arrayContaining(["name", "email", "password"])
    );
  });

  it("rejects invalid login payloads", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({ email: "bad-email", password: "" })
      .expect(422);

    expect(response.body.errors).toHaveLength(2);
  });
});

