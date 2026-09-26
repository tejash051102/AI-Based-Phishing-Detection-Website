import request from "supertest";
import { describe, expect, it } from "vitest";
import app from "../src/app.js";

describe("cors", () => {
  it("allows preflight requests from the deployed frontend origin", async () => {
    const response = await request(app)
      .options("/api/auth/login")
      .set("Origin", "https://phishgaurd-frontend.onrender.com")
      .set("Access-Control-Request-Method", "POST")
      .set("Access-Control-Request-Headers", "content-type,authorization")
      .expect(204);

    expect(response.headers["access-control-allow-origin"]).toBe("https://phishgaurd-frontend.onrender.com");
    expect(response.headers["access-control-allow-credentials"]).toBe("true");
    expect(response.headers["access-control-allow-headers"]).toContain("Content-Type");
    expect(response.headers["access-control-allow-methods"]).toContain("POST");
  });

  it("blocks disallowed origins", async () => {
    await request(app)
      .options("/api/auth/register")
      .set("Origin", "https://malicious.example.com")
      .set("Access-Control-Request-Method", "POST")
      .expect(500);
  });
});
