import type { Champion, DraftTokens } from "../draft/types";

type CreateDraftInput = {
  blueTeam: string;
  redTeam: string;
  timerSeconds: number;
};

export type CreateDraftResult =
  | { success: true; roomId: string; tokens: DraftTokens }
  | { success: false; error: string };

const apiBase = () =>
  (
    import.meta.env.VITE_DRAFT_API_URL ||
    import.meta.env.VITE_APPLICATION_API_URL ||
    ""
  ).replace(/\/$/, "");

export async function createDraft(
  input: CreateDraftInput,
): Promise<CreateDraftResult> {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 12_000);

  try {
    const response = await fetch(apiBase() + "/drafts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
      signal: controller.signal,
    });
    const data = (await response
      .json()
      .catch(() => null)) as CreateDraftResult | null;

    if (!response.ok || !data?.success) {
      return {
        success: false,
        error:
          data?.success === false
            ? data.error
            : "Non è stato possibile creare la lobby.",
      };
    }
    return data;
  } catch {
    return {
      success: false,
      error: "Servizio draft non raggiungibile. Riprova tra poco.",
    };
  } finally {
    window.clearTimeout(timeoutId);
  }
}

export function draftSocketUrl(roomId: string): string {
  const base = apiBase() || window.location.origin;
  const url = new URL(
    base + "/drafts/" + encodeURIComponent(roomId) + "/socket",
    window.location.origin,
  );
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  return url.toString();
}

type DataDragonChampion = {
  id: string;
  key: string;
  name: string;
  image: { full: string };
  tags: string[];
};

export function isDraftEligibleChampion(champion: DataDragonChampion) {
  return !champion.id.startsWith("Jade_");
}

let championRequest: Promise<Champion[]> | null = null;

export function loadChampions(): Promise<Champion[]> {
  if (championRequest) return championRequest;

  championRequest = (async () => {
    const versionsResponse = await fetch(
      "https://ddragon.leagueoflegends.com/api/versions.json",
    );
    if (!versionsResponse.ok) throw new Error("Versioni Riot non disponibili");
    const versions = (await versionsResponse.json()) as string[];
    const version = versions[0];
    if (!version) throw new Error("Versione Riot non disponibile");

    const championResponse = await fetch(
      "https://ddragon.leagueoflegends.com/cdn/" +
        version +
        "/data/it_IT/champion.json",
    );
    if (!championResponse.ok) throw new Error("Campioni Riot non disponibili");
    const payload = (await championResponse.json()) as {
      data: Record<string, DataDragonChampion>;
    };

    return Object.values(payload.data)
      .filter(isDraftEligibleChampion)
      .map((champion) => ({
        id: Number(champion.key),
        slug: champion.id,
        name: champion.name,
        imageUrl:
          "https://ddragon.leagueoflegends.com/cdn/" +
          version +
          "/img/champion/" +
          champion.image.full,
        tags: champion.tags,
      }))
      .sort((first, second) => first.name.localeCompare(second.name, "it"));
  })();

  championRequest.catch(() => {
    championRequest = null;
  });
  return championRequest;
}
