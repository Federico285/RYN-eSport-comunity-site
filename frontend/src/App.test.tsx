import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";

vi.mock("./hooks/useTurnstile", () => ({
  useTurnstile: () => ({
    containerRef: { current: null },
    reset: vi.fn(),
  }),
}));

describe("Team recruitment flow", () => {
  beforeEach(() => {
    window.location.hash = "#/";
  });

  it("mostra la home e apre la selezione dei team", async () => {
    const user = userEvent.setup();
    render(<App />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: /competere insieme/i,
      }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /scopri i team/i }));

    expect(
      screen.getByRole("button", { name: /apri il roster ryn apex/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /apri il roster ryn nova/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /apri il roster ryn pulse/i }),
    ).toBeInTheDocument();
    expect(window.location.hash).toBe("#/teams");
  });

  it("naviga al dettaglio condiviso del team", async () => {
    const user = userEvent.setup();
    window.location.hash = "#/teams";
    render(<App />);

    await user.click(
      screen.getByRole("button", { name: /apri il roster ryn apex/i }),
    );

    expect(
      screen.getByRole("heading", { level: 1, name: /ryn apex/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("region", { name: /formazione ryn apex/i }),
    ).toBeInTheDocument();
    expect(window.location.hash).toBe("#/team/apex");
  });

  it("apre la candidatura con team e ruolo preselezionati", async () => {
    const user = userEvent.setup();
    window.location.hash = "#/team/apex";
    render(<App />);

    await user.click(screen.getByRole("button", { name: /^candidati$/i }));

    expect(
      screen.getByRole("dialog", { name: /candidatura/i }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/posizione desiderata/i)).toHaveValue(
      "apex-support",
    );
  });

  it("consente di passare al team successivo", async () => {
    const user = userEvent.setup();
    window.location.hash = "#/team/apex";
    render(<App />);

    await user.click(screen.getByRole("button", { name: /team successivo/i }));

    expect(
      screen.getByRole("heading", { level: 1, name: /ryn nova/i }),
    ).toBeInTheDocument();
  });
});
