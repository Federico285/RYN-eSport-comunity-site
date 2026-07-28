import type { ApplicationPayload } from "./validation";

const MAX_FIELD = 1024;
const MAX_TEXT = 3900;

function neutralizeMentions(value: string): string {
  return value
    .replace(/@everyone/gi, "@\u200beveryone")
    .replace(/@here/gi, "@\u200bhere")
    .replace(/<@&\d+>/g, "[role mention]")
    .replace(/<@!?\d+>/g, "[user mention]");
}

function truncate(value: string | undefined, max = MAX_FIELD): string {
  const safe = neutralizeMentions(
    (value || "Non indicato").replace(/[<>]/g, "").trim(),
  );
  return safe.length > max ? `${safe.slice(0, max - 3)}...` : safe;
}

export function buildDiscordPayload(
  application: ApplicationPayload,
  applicationId: string,
) {
  return {
    allowed_mentions: { parse: [] },
    embeds: [
      {
        title: "Nuova candidatura",
        color: 2221761,
        timestamp: new Date().toISOString(),
        fields: [
          { name: "ID", value: applicationId, inline: false },
          {
            name: "Posizione",
            value: truncate(application.positionId),
            inline: true,
          },
          { name: "Nome", value: truncate(application.fullName), inline: true },
          { name: "Email", value: truncate(application.email), inline: true },
          {
            name: "Discord",
            value: truncate(application.discordUsername),
            inline: true,
          },
          {
            name: "Eta",
            value: `${application.age} anni, requisito confermato`,
            inline: true,
          },
          {
            name: "Disponibilita",
            value: truncate(application.weeklyAvailability),
            inline: false,
          },
          {
            name: "Esperienza",
            value: truncate(application.experience, MAX_TEXT),
            inline: false,
          },
          {
            name: "Motivazione",
            value: truncate(application.motivation, MAX_TEXT),
            inline: false,
          },
          {
            name: "Portfolio",
            value: truncate(application.portfolioUrl),
            inline: false,
          },
          {
            name: "Curriculum",
            value: truncate(application.cvUrl),
            inline: false,
          },
        ],
      },
    ],
  };
}

export async function sendApplicationToDiscord(
  webhookUrl: string,
  application: ApplicationPayload,
  applicationId: string,
) {
  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(buildDiscordPayload(application, applicationId)),
  });

  if (response.status === 429) {
    return { ok: false, status: 429 };
  }

  return { ok: response.ok, status: response.status };
}
