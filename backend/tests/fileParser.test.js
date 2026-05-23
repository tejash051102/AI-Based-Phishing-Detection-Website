import { describe, expect, it } from "vitest";
import { extractScanItems } from "../src/services/fileParser.service.js";

describe("file parser service", () => {
  it("extracts multiple URLs and message blocks from uploaded text", () => {
    const content = `
      Please verify https://secure-login.example.ru/account now.

      Urgent: your wallet password expires today. Visit www.fake-bank.example/login.
    `;

    const items = extractScanItems(content, "txt");

    expect(items.filter((item) => item.type === "url")).toHaveLength(2);
    expect(items.some((item) => item.type === "text")).toBe(true);
    expect(items[0]).toHaveProperty("sourceLabel");
  });
});

