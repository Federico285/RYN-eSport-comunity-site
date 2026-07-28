#!/usr/bin/env node

const required = [
  "DISCORD_BOT_TOKEN",
  "DISCORD_CHANNEL_ID",
  "DISCORD_COMMUNITY_ROLE_ID",
];
const missing = required.filter((key) => !process.env[key]);

if (missing.length > 0) {
  console.error(`Variabili mancanti: ${missing.join(", ")}`);
  process.exit(1);
}

const token = process.env.DISCORD_BOT_TOKEN;
const channelId = process.env.DISCORD_CHANNEL_ID;
const roleId = process.env.DISCORD_COMMUNITY_ROLE_ID;
const maxAge = Number(process.env.DISCORD_INVITE_MAX_AGE ?? "0");
const maxUses = Number(process.env.DISCORD_INVITE_MAX_USES ?? "0");

console.log("Creo un Community Invite Discord con role_ids.");
console.log("Permessi richiesti: Create Instant Invite e Manage Roles.");
console.log(
  "Il ruolo del bot deve essere gerarchicamente superiore al ruolo Community.",
);

const response = await fetch(
  `https://discord.com/api/v10/channels/${channelId}/invites`,
  {
    method: "POST",
    headers: {
      Authorization: `Bot ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      role_ids: [roleId],
      max_age: Number.isFinite(maxAge) ? maxAge : 0,
      max_uses: Number.isFinite(maxUses) ? maxUses : 0,
      unique: true,
    }),
  },
);

const data = await response.json().catch(() => null);

if (!response.ok || !data?.code) {
  console.error(
    `Creazione invito non riuscita. Status HTTP: ${response.status}`,
  );
  if (data?.message) console.error(`Messaggio Discord: ${data.message}`);
  process.exit(1);
}

console.log(`Invite creato: https://discord.gg/${data.code}`);
console.log("Copia il link in frontend/.env come VITE_DISCORD_INVITE_URL.");
console.log(
  "Alternativa manuale: se Discord mostra l opzione Community Invite con ruoli nell interfaccia, genera l invito dal canale e seleziona il ruolo Community.",
);
