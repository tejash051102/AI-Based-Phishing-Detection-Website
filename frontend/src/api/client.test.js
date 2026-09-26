import { describe, expect, it } from "vitest";
import { normalizeApiBaseUrl } from "./client";

describe("normalizeApiBaseUrl", () => {
  it("uses the local default when value is empty", () => {
    expect(normalizeApiBaseUrl("")).toBe("http://localhost:5000/api");
  });

  it("appends /api for host-only URLs", () => {
    expect(normalizeApiBaseUrl("https://ai-based-phishing-detection-website.onrender.com")).toBe(
      "https://ai-based-phishing-detection-website.onrender.com/api"
    );
  });

  it("does not duplicate /api when already present", () => {
    expect(normalizeApiBaseUrl("https://ai-based-phishing-detection-website.onrender.com/api")).toBe(
      "https://ai-based-phishing-detection-website.onrender.com/api"
    );
    expect(normalizeApiBaseUrl("https://ai-based-phishing-detection-website.onrender.com/api/")).toBe(
      "https://ai-based-phishing-detection-website.onrender.com/api"
    );
  });
});
