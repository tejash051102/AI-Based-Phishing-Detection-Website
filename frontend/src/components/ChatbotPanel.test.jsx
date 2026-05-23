import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import ChatbotPanel from "./ChatbotPanel";

describe("ChatbotPanel", () => {
  it("opens the assistant panel", async () => {
    render(<ChatbotPanel />);

    await userEvent.click(screen.getByTitle("Open AI assistant"));

    expect(screen.getByText("AI security assistant")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Ask about phishing signs...")).toBeInTheDocument();
  });
});

