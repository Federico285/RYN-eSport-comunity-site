import type { Champion, DraftAction, DraftState, DraftTeam } from "./types";

const WIDTH = 1920;
const HEIGHT = 1080;
const PAGE_MARGIN = 60;
const BLUE = "#4a93ff";
const RED = "#ff5966";
const INK = "#f4f7fa";
const MUTED = "#8e9aa8";
const PANEL = "#101720";
const CARD = "#0a1017";

type ChampionImages = Map<number, HTMLImageElement>;

function roundedPath(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  const safeRadius = Math.min(radius, width / 2, height / 2);
  context.beginPath();
  context.moveTo(x + safeRadius, y);
  context.lineTo(x + width - safeRadius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + safeRadius);
  context.lineTo(x + width, y + height - safeRadius);
  context.quadraticCurveTo(
    x + width,
    y + height,
    x + width - safeRadius,
    y + height,
  );
  context.lineTo(x + safeRadius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - safeRadius);
  context.lineTo(x, y + safeRadius);
  context.quadraticCurveTo(x, y, x + safeRadius, y);
  context.closePath();
}

function fillRoundedRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  color: string,
) {
  roundedPath(context, x, y, width, height, radius);
  context.fillStyle = color;
  context.fill();
}

function text(
  context: CanvasRenderingContext2D,
  value: string,
  x: number,
  y: number,
  options: {
    size: number;
    weight?: number;
    color?: string;
    align?: CanvasTextAlign;
    maxWidth?: number;
  },
) {
  context.font = `${options.weight ?? 700} ${options.size}px Inter, Arial, sans-serif`;
  context.fillStyle = options.color ?? INK;
  context.textAlign = options.align ?? "left";
  context.textBaseline = "alphabetic";
  context.fillText(value, x, y, options.maxWidth);
}

function fitText(
  context: CanvasRenderingContext2D,
  value: string,
  maxWidth: number,
) {
  if (context.measureText(value).width <= maxWidth) return value;
  let result = value;
  while (
    result.length > 1 &&
    context.measureText(result + "…").width > maxWidth
  ) {
    result = result.slice(0, -1);
  }
  return result + "…";
}

function drawImageCover(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  const sourceRatio = image.naturalWidth / image.naturalHeight;
  const targetRatio = width / height;
  let sourceX = 0;
  let sourceY = 0;
  let sourceWidth = image.naturalWidth;
  let sourceHeight = image.naturalHeight;

  if (sourceRatio > targetRatio) {
    sourceWidth = image.naturalHeight * targetRatio;
    sourceX = (image.naturalWidth - sourceWidth) / 2;
  } else {
    sourceHeight = image.naturalWidth / targetRatio;
    sourceY = (image.naturalHeight - sourceHeight) / 2;
  }

  context.drawImage(
    image,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    x,
    y,
    width,
    height,
  );
}

function championForAction(
  action: DraftAction | undefined,
  championById: Map<number, Champion>,
) {
  return action?.championId ? championById.get(action.championId) : undefined;
}

function loadImage(url: string) {
  return new Promise<HTMLImageElement | null>((resolve) => {
    const image = new Image();
    let settled = false;
    const finish = (result: HTMLImageElement | null) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeoutId);
      resolve(result);
    };
    const timeoutId = window.setTimeout(() => finish(null), 8_000);
    image.crossOrigin = "anonymous";
    image.decoding = "async";
    image.onload = () => finish(image);
    image.onerror = () => finish(null);
    image.src = url;
  });
}

async function loadChampionImages(
  state: DraftState,
  championById: Map<number, Champion>,
) {
  const champions = Array.from(
    new Map(
      state.actions
        .map((action) =>
          action.championId ? championById.get(action.championId) : undefined,
        )
        .filter((champion): champion is Champion => Boolean(champion))
        .map((champion) => [champion.id, champion]),
    ).values(),
  );

  const loaded = await Promise.all(
    champions.map(
      async (champion) =>
        [champion.id, await loadImage(champion.imageUrl)] as const,
    ),
  );

  return new Map(
    loaded.filter(
      (entry): entry is readonly [number, HTMLImageElement] =>
        entry[1] !== null,
    ),
  );
}

function drawPickCard(
  context: CanvasRenderingContext2D,
  action: DraftAction | undefined,
  championById: Map<number, Champion>,
  images: ChampionImages,
  x: number,
  y: number,
  width: number,
  accent: string,
) {
  const champion = championForAction(action, championById);
  fillRoundedRect(context, x, y, width, 190, 8, CARD);
  context.save();
  roundedPath(context, x, y, width, 146, 8);
  context.clip();
  const image = champion ? images.get(champion.id) : undefined;
  if (image) {
    drawImageCover(context, image, x, y, width, 146);
  } else {
    const placeholder = context.createLinearGradient(x, y, x, y + 146);
    placeholder.addColorStop(0, `${accent}44`);
    placeholder.addColorStop(1, "#0a1017");
    context.fillStyle = placeholder;
    context.fillRect(x, y, width, 146);
    text(context, "RYN", x + width / 2, y + 88, {
      size: 30,
      weight: 950,
      color: `${accent}aa`,
      align: "center",
    });
  }
  const shade = context.createLinearGradient(x, y + 90, x, y + 146);
  shade.addColorStop(0, "rgba(5, 8, 12, 0)");
  shade.addColorStop(1, "rgba(5, 8, 12, 0.9)");
  context.fillStyle = shade;
  context.fillRect(x, y + 90, width, 56);
  context.restore();

  context.font = "850 18px Inter, Arial, sans-serif";
  const name = fitText(context, champion?.name ?? "—", width - 20);
  text(context, name, x + width / 2, y + 176, {
    size: 18,
    weight: 850,
    align: "center",
  });
}

function drawBanCard(
  context: CanvasRenderingContext2D,
  action: DraftAction | undefined,
  championById: Map<number, Champion>,
  images: ChampionImages,
  x: number,
  y: number,
  width: number,
  accent: string,
) {
  const champion = championForAction(action, championById);
  fillRoundedRect(context, x, y, width, 68, 7, "#0b1118");
  context.save();
  roundedPath(context, x, y, 58, 68, 7);
  context.clip();
  const image = champion ? images.get(champion.id) : undefined;
  if (image) {
    context.filter = "grayscale(1) brightness(0.58)";
    drawImageCover(context, image, x, y, 58, 68);
    context.filter = "none";
  } else {
    context.fillStyle = `${accent}22`;
    context.fillRect(x, y, 58, 68);
    text(context, "—", x + 29, y + 43, {
      size: 28,
      weight: 900,
      color: MUTED,
      align: "center",
    });
  }
  context.restore();

  context.font = "800 15px Inter, Arial, sans-serif";
  const name = fitText(
    context,
    action?.championId === null ? "Saltato" : (champion?.name ?? "—"),
    width - 72,
  );
  text(context, name, x + 68, y + 40, {
    size: 15,
    weight: 800,
    color: champion ? "#c4ccd5" : MUTED,
  });
}

function drawTeamPanel(
  context: CanvasRenderingContext2D,
  state: DraftState,
  team: DraftTeam,
  championById: Map<number, Champion>,
  images: ChampionImages,
  x: number,
) {
  const width = 870;
  const y = 145;
  const accent = team === "blue" ? BLUE : RED;
  const name = team === "blue" ? state.blueTeam : state.redTeam;
  const picks = state.actions.filter(
    (action) => action.team === team && action.kind === "pick",
  );
  const bans = state.actions.filter(
    (action) => action.team === team && action.kind === "ban",
  );

  fillRoundedRect(context, x, y, width, 480, 14, PANEL);
  context.fillStyle = accent;
  context.fillRect(x, y, 7, 480);
  text(context, team === "blue" ? "BLUE SIDE" : "RED SIDE", x + 30, y + 39, {
    size: 16,
    weight: 900,
    color: accent,
  });
  context.font = "950 34px Inter, Arial, sans-serif";
  text(context, fitText(context, name, 760), x + 30, y + 82, {
    size: 34,
    weight: 950,
  });
  text(context, "PICK FINALI", x + 30, y + 117, {
    size: 14,
    weight: 900,
    color: MUTED,
  });

  const contentX = x + 30;
  const cardWidth = 152;
  const gap = 15;
  Array.from({ length: 5 }, (_, index) => {
    drawPickCard(
      context,
      picks[index],
      championById,
      images,
      contentX + index * (cardWidth + gap),
      y + 132,
      cardWidth,
      accent,
    );
  });

  text(context, "BAN", x + 30, y + 360, {
    size: 14,
    weight: 900,
    color: MUTED,
  });
  Array.from({ length: 5 }, (_, index) => {
    drawBanCard(
      context,
      bans[index],
      championById,
      images,
      contentX + index * (cardWidth + gap),
      y + 374,
      cardWidth,
      accent,
    );
  });
}

function drawSequenceColumn(
  context: CanvasRenderingContext2D,
  state: DraftState,
  championById: Map<number, Champion>,
  title: string,
  start: number,
  end: number,
  x: number,
) {
  const y = 665;
  const width = 435;
  fillRoundedRect(context, x, y, width, 320, 12, "#0d131b");
  text(context, title, x + 22, y + 38, {
    size: 18,
    weight: 900,
    color: "#cbd4de",
  });

  state.actions.slice(start, end).forEach((action, localIndex) => {
    const actionIndex = start + localIndex;
    const rowY = y + 55 + localIndex * 41;
    const accent = action.team === "blue" ? BLUE : RED;
    if (localIndex % 2 === 0) {
      fillRoundedRect(context, x + 14, rowY, width - 28, 34, 5, "#111a24");
    }
    fillRoundedRect(context, x + 22, rowY + 5, 28, 24, 4, `${accent}33`);
    text(context, String(actionIndex + 1).padStart(2, "0"), x + 36, rowY + 23, {
      size: 12,
      weight: 900,
      color: accent,
      align: "center",
    });
    text(context, action.team === "blue" ? "BLU" : "ROSSO", x + 62, rowY + 23, {
      size: 12,
      weight: 900,
      color: accent,
    });

    const champion = championForAction(action, championById);
    context.font = "750 15px Inter, Arial, sans-serif";
    const actionLabel =
      action.kind === "ban" && action.championId === null
        ? "Ban saltato"
        : `${action.kind === "pick" ? "Pick" : "Ban"} · ${champion?.name ?? `#${action.championId}`}`;
    text(context, fitText(context, actionLabel, 280), x + 126, rowY + 23, {
      size: 15,
      weight: 750,
      color: "#c1cad4",
    });
  });
}

function canvasToBlob(canvas: HTMLCanvasElement) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Immagine non disponibile"));
    }, "image/png");
  });
}

export async function buildDraftResultImage(
  state: DraftState,
  championById: Map<number, Champion>,
): Promise<Blob> {
  await document.fonts?.ready;
  const images = await loadChampionImages(state, championById);
  const canvas = document.createElement("canvas");
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas non disponibile");

  const background = context.createLinearGradient(0, 0, WIDTH, HEIGHT);
  background.addColorStop(0, "#070b11");
  background.addColorStop(0.52, "#0a1017");
  background.addColorStop(1, "#090c12");
  context.fillStyle = background;
  context.fillRect(0, 0, WIDTH, HEIGHT);

  const blueGlow = context.createRadialGradient(130, 150, 0, 130, 150, 620);
  blueGlow.addColorStop(0, "rgba(74, 147, 255, 0.18)");
  blueGlow.addColorStop(1, "rgba(74, 147, 255, 0)");
  context.fillStyle = blueGlow;
  context.fillRect(0, 0, WIDTH / 2, 700);
  const redGlow = context.createRadialGradient(1790, 150, 0, 1790, 150, 620);
  redGlow.addColorStop(0, "rgba(255, 89, 102, 0.16)");
  redGlow.addColorStop(1, "rgba(255, 89, 102, 0)");
  context.fillStyle = redGlow;
  context.fillRect(WIDTH / 2, 0, WIDTH / 2, 700);

  text(context, "RYN DRAFT ROOM", PAGE_MARGIN, 46, {
    size: 17,
    weight: 950,
    color: "#22e0b8",
  });
  text(context, `LOBBY ${state.roomId}`, WIDTH - PAGE_MARGIN, 46, {
    size: 15,
    weight: 850,
    color: MUTED,
    align: "right",
  });
  text(context, "COMPOSIZIONI FINALI", WIDTH / 2, 76, {
    size: 46,
    weight: 950,
    align: "center",
  });
  context.font = "850 25px Inter, Arial, sans-serif";
  const matchup = fitText(
    context,
    `${state.blueTeam}  VS  ${state.redTeam}`,
    1100,
  );
  text(context, matchup, WIDTH / 2, 116, {
    size: 25,
    weight: 850,
    color: "#aeb9c5",
    align: "center",
  });

  drawTeamPanel(context, state, "blue", championById, images, PAGE_MARGIN);
  drawTeamPanel(context, state, "red", championById, images, 990);

  drawSequenceColumn(context, state, championById, "BAN · FASE 1", 0, 6, 60);
  drawSequenceColumn(context, state, championById, "PICK · FASE 1", 6, 12, 515);
  drawSequenceColumn(context, state, championById, "BAN · FASE 2", 12, 16, 970);
  drawSequenceColumn(
    context,
    state,
    championById,
    "PICK · FASE 2",
    16,
    20,
    1425,
  );

  context.fillStyle = "#202a35";
  context.fillRect(PAGE_MARGIN, 1018, WIDTH - PAGE_MARGIN * 2, 1);
  const date = new Intl.DateTimeFormat("it-IT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(state.createdAt));
  text(context, `${date} · Lobby ${state.roomId}`, PAGE_MARGIN, 1052, {
    size: 14,
    weight: 750,
    color: MUTED,
  });
  text(context, "Powered by Federico Falconi", WIDTH - PAGE_MARGIN, 1052, {
    size: 14,
    weight: 800,
    color: "#aeb9c5",
    align: "right",
  });

  return canvasToBlob(canvas);
}
