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
    expect(screen.getByText(/powered by/i)).toHaveTextContent(
      "Powered by Federico Falconi",
    );

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
    const lockedPosition = screen.getByLabelText(/posizione desiderata/i);
    expect(lockedPosition).toHaveValue("RYN Apex - Support");
    expect(lockedPosition).toHaveAttribute("readonly");
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
  });

  it("mostra solo le posizioni aperte del team selezionato", async () => {
    const user = userEvent.setup();
    window.location.hash = "#/team/nova";
    render(<App />);

    await user.click(
      screen.getAllByRole("button", { name: /^candidati$/i })[0],
    );

    const positionSelect = screen.getByRole("combobox", {
      name: /posizione desiderata/i,
    });
    expect(positionSelect).toHaveValue("nova-bot");
    expect(
      screen.getByRole("option", { name: "RYN Nova - Bot" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: "RYN Nova - Coach" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("option", { name: "RYN Apex - Support" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("option", { name: "RYN Pulse - Top" }),
    ).not.toBeInTheDocument();
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

  it("apre il draft tool dalla navigazione principale", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /^draft$/i }));

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: /la partita inizia prima della landa/i,
      }),
    ).toBeInTheDocument();
    expect(window.location.hash).toBe("#/draft");
  });

  it("rende disponibile l'informativa privacy senza fingere che la mail sia attiva", () => {
    window.location.hash = "#/privacy";
    render(<App />);

    expect(
      screen.getByRole("heading", { level: 1, name: /informativa privacy/i }),
    ).toBeInTheDocument();
    expect(screen.getByText("privacy@vostrodominio.it")).toBeInTheDocument();
    expect(
      screen.getByText(/indirizzo non ancora attivo/i),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "privacy@vostrodominio.it" }),
    ).not.toBeInTheDocument();
  });

  it("collega il consenso del modulo all'informativa privacy", async () => {
    const user = userEvent.setup();
    window.location.hash = "#/team/apex";
    render(<App />);

    await user.click(screen.getByRole("button", { name: /^candidati$/i }));

    const privacyLink = screen.getByRole("link", { name: /privacy policy/i });
    expect(privacyLink).toHaveAttribute("href", "#/privacy");
    expect(privacyLink).toHaveAttribute("target", "_blank");
  });
});
