import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
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

  afterEach(() => {
    vi.useRealTimers();
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
    expect(
      screen.getByText(/© 2026 RYN.*Federico Falconi e Gabriel Omar Peluso/),
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

  it("ruota automaticamente le news e consente la navigazione manuale", () => {
    vi.useFakeTimers();
    const { unmount } = render(<App />);

    expect(
      screen.getByRole("img", {
        name: /i giocatori ryn sollevano il trofeo/i,
      }),
    ).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(6500);
    });

    expect(
      screen.getByRole("img", {
        name: /annuncio del nuovo support di team x/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Team X.*Nuovo ingresso/)).toBeInTheDocument();

    act(() => {
      screen.getByRole("button", { name: /notizia precedente/i }).click();
    });

    expect(
      screen.getByRole("img", {
        name: /i giocatori ryn sollevano il trofeo/i,
      }),
    ).toBeInTheDocument();

    unmount();
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

    await user.click(
      screen.getAllByRole("button", { name: /^candidati$/i })[0],
    );

    expect(
      screen.getByRole("dialog", { name: /candidatura/i }),
    ).toBeInTheDocument();
    const positionSelect = screen.getByRole("combobox", {
      name: /posizione desiderata/i,
    });
    expect(positionSelect).toHaveValue("apex-support");
    expect(
      screen.getByRole("option", { name: "RYN Apex - Assistant Coach" }),
    ).toBeInTheDocument();
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
      screen.queryByRole("option", { name: "RYN Nova - Assistant Coach" }),
    ).not.toBeInTheDocument();
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
    expect(screen.getByText("Gabriel Omar Peluso")).toBeInTheDocument();
    expect(screen.queryByText("Gabriel Peluso")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "privacy@vostrodominio.it" }),
    ).not.toBeInTheDocument();
  });

  it("collega il consenso del modulo all'informativa privacy", async () => {
    const user = userEvent.setup();
    window.location.hash = "#/team/apex";
    render(<App />);

    await user.click(
      screen.getAllByRole("button", { name: /^candidati$/i })[0],
    );

    const privacyLink = screen.getByRole("link", { name: /privacy policy/i });
    expect(privacyLink).toHaveAttribute("href", "#/privacy");
    expect(privacyLink).toHaveAttribute("target", "_blank");
  });
});
