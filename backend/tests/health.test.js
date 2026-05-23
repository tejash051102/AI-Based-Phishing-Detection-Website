import request from "supertest";
import { describe, expect, it } from "vitest";
import app from "../src/app.js";

describe("health API", () => {
  it("returns service status", async () => {
    const response = await request(app).get("/api/health").expect(200);

    expect(response.body).toEqual({
      status: "ok",
      service: "phishguard-api"
    });
  });
});

