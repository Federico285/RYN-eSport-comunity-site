# Script amministrativi

## create-discord-community-invite.mjs

Genera un invite Discord con `role_ids` per assegnare automaticamente il ruolo `Community`.

Variabili richieste:

```bash
DISCORD_BOT_TOKEN=
DISCORD_CHANNEL_ID=
DISCORD_COMMUNITY_ROLE_ID=
DISCORD_INVITE_MAX_AGE=0
DISCORD_INVITE_MAX_USES=0
```

Il bot deve avere `Create Instant Invite` e `Manage Roles`. Il ruolo del bot deve essere superiore al ruolo `Community`.

Esecuzione:

```bash
node scripts/create-discord-community-invite.mjs
```
