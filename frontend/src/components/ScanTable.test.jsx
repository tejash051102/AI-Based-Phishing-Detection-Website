import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import ScanTable from "./ScanTable";

describe("ScanTable", () => {
  it("links scan rows to the detail page", () => {
    render(
      <MemoryRouter>
        <ScanTable
          scans={[
            {
              _id: "scan-1",
              input: "https://phish.example/login",
              type: "url",
              verdict: "phishing",
              threatScore: 91,
              createdAt: "2026-05-23T10:00:00.000Z"
            }
          ]}
        />
      </MemoryRouter>
    );

    expect(screen.getByRole("link", { name: "https://phish.example/login" })).toHaveAttribute(
      "href",
      "/history/scan-1"
    );
    expect(screen.getByText("91/100")).toBeInTheDocument();
  });
});

