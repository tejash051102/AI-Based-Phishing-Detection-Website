import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ExplainabilityPanel from "./ExplainabilityPanel";

describe("ExplainabilityPanel", () => {
  it("explains URL phishing signals from model features", () => {
    render(
      <ExplainabilityPanel
        scan={{
          type: "url",
          input: "http://paypal-login.example.com/verify/account",
          verdict: "phishing",
          aiDetails: {
            features: {
              has_https: 0,
              keyword_count: 3,
              url_length: 52,
              subdomain_count: 1
            }
          }
        }}
      />
    );

    expect(screen.getByText("Why this result?")).toBeInTheDocument();
    expect(screen.getByText("Missing HTTPS")).toBeInTheDocument();
    expect(screen.getByText("Possible brand impersonation")).toBeInTheDocument();
  });
});
