import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ThreatBadge from "./ThreatBadge";

describe("ThreatBadge", () => {
  it("renders the verdict label", () => {
    render(<ThreatBadge verdict="phishing" />);

    expect(screen.getByText("phishing")).toBeInTheDocument();
  });
});

