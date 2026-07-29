import { describe, expect, it } from "vitest";
import { isDraftEligibleChampion } from "./draftApi";

describe("draft champion catalog", () => {
  it("esclude i modelli classici Jade dal catalogo corrente", () => {
    const current = {
      id: "Ahri",
      key: "103",
      name: "Ahri",
      image: { full: "Ahri.png" },
      tags: ["Mage"],
    };
    const legacy = {
      ...current,
      id: "Jade_Ahri",
      key: "100103",
      image: { full: "Jade_Ahri.png" },
    };

    expect(isDraftEligibleChampion(current)).toBe(true);
    expect(isDraftEligibleChampion(legacy)).toBe(false);
  });
});
