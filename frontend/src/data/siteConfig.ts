import type { OpenPosition } from "../types/positions";

export type TeamRole = "top" | "jungle" | "mid" | "bot" | "support";

export type TeamMember = {
  role: TeamRole;
  roleLabel: string;
  isOpen: boolean;
  name?: string;
  tag?: string;
  imageUrl?: string;
};

export type TeamStaffMember = Omit<TeamMember, "role" | "roleLabel">;

export type Team = {
  id: string;
  name: string;
  tier: string;
  statement: string;
  accent: string;
  secondary: string;
  roster: TeamMember[];
  coach: TeamStaffMember;
  assistantCoach?: TeamStaffMember;
};

const roleLabels: Record<TeamRole, string> = {
  top: "Top",
  jungle: "Jungle",
  mid: "Mid",
  bot: "Bot",
  support: "Support",
};

type RosterMemberConfig = Pick<TeamMember, "isOpen"> &
  Partial<Pick<TeamMember, "name" | "tag" | "imageUrl">>;

const roster = (members: Record<TeamRole, RosterMemberConfig>): TeamMember[] =>
  (Object.keys(roleLabels) as TeamRole[]).map((role) => ({
    role,
    roleLabel: roleLabels[role],
    ...members[role],
  }));

export const teams: Team[] = [
  {
    id: "apex",
    name: "RYN Apex",
    tier: "Main roster",
    statement: "Disciplina, pressione, risultato.",
    accent: "#ff4655",
    secondary: "#ffb347",
    roster: roster({
      top: { name: "Valken", tag: "RYN", isOpen: false },
      jungle: { name: "Kairo", tag: "RYN", isOpen: false },
      mid: { name: "Noctis", tag: "RYN", isOpen: false },
      bot: { name: "Raiden", tag: "RYN", isOpen: false },
      support: { isOpen: true },
    }),
    coach: { name: "Maverick", tag: "HEAD COACH", isOpen: false },
    assistantCoach: { isOpen: true },
  },
  {
    id: "nova",
    name: "RYN Nova",
    tier: "Academy roster",
    statement: "Talento giovane, crescita veloce.",
    accent: "#22e0b8",
    secondary: "#34a8ff",
    roster: roster({
      top: { name: "Aster", tag: "RYN", isOpen: false },
      jungle: { name: "Flint", tag: "RYN", isOpen: false },
      mid: { name: "Lyra", tag: "RYN", isOpen: false },
      bot: { isOpen: true },
      support: { name: "Echo", tag: "RYN", isOpen: false },
    }),
    coach: { isOpen: true },
  },
  {
    id: "pulse",
    name: "RYN Pulse",
    tier: "Development roster",
    statement: "Il prossimo livello parte da qui.",
    accent: "#f0d84b",
    secondary: "#ef5da8",
    roster: roster({
      top: { isOpen: true },
      jungle: { name: "Nox", tag: "RYN", isOpen: false },
      mid: { name: "Zero", tag: "RYN", isOpen: false },
      bot: { name: "Flux", tag: "RYN", isOpen: false },
      support: { name: "Vesper", tag: "RYN", isOpen: false },
    }),
    coach: { name: "Iris", tag: "PERFORMANCE COACH", isOpen: false },
  },
];

export const openPositions: OpenPosition[] = teams.flatMap((team) => [
  ...team.roster
    .filter((member) => member.isOpen)
    .map((member) => ({
      id: `${team.id}-${member.role}`,
      teamId: team.id,
      title: `${team.name} - ${member.roleLabel}`,
      shortDescription: `Candidatura player ${member.roleLabel} per ${team.name}.`,
      description: `Slot ${member.roleLabel} aperto nel roster ${team.name}.`,
      requirements: [
        "Mentalita competitiva",
        "Disponibilita per scrim",
        "Comunicazione chiara",
      ],
      niceToHave: ["Esperienza in team", "VOD review disponibili"],
      commitment: "Da definire in fase di colloquio",
      location: "Remoto",
      isOpen: true,
    })),
  ...(team.coach.isOpen
    ? [
        {
          id: `${team.id}-coach`,
          teamId: team.id,
          title: `${team.name} - Coach`,
          shortDescription: `Candidatura coach per ${team.name}.`,
          description: `Posizione coach aperta per ${team.name}.`,
          requirements: [
            "Esperienza competitiva",
            "Capacita di analisi",
            "Leadership",
          ],
          niceToHave: ["Esperienza in lega", "Metodo di VOD review"],
          commitment: "Da definire in fase di colloquio",
          location: "Remoto",
          isOpen: true,
        } satisfies OpenPosition,
      ]
    : []),
  ...(team.assistantCoach?.isOpen
    ? [
        {
          id: `${team.id}-assistant-coach`,
          teamId: team.id,
          title: `${team.name} - Assistant Coach`,
          shortDescription: `Candidatura assistant coach per ${team.name}.`,
          description: `Posizione assistant coach aperta per ${team.name}.`,
          requirements: [
            "Conoscenza del gioco competitivo",
            "Capacita di analisi",
            "Collaborazione con il coaching staff",
          ],
          niceToHave: ["Esperienza in team", "Metodo di VOD review"],
          commitment: "Da definire in fase di colloquio",
          location: "Remoto",
          isOpen: true,
        } satisfies OpenPosition,
      ]
    : []),
]);

export const siteConfig = {
  communityName: "RYN eSport Community",
  tagline: "Choose your lane. Earn your place.",
  minimumAge: 16,
  discordInviteUrl:
    import.meta.env.VITE_DISCORD_INVITE_URL || "https://discord.gg/placeholder",
  contactEmail: "staff@example.com",
  // FIXME(domain): quando il dominio ufficiale sara disponibile, attivare
  // Cloudflare Email Routing e sostituire l'indirizzo modello con privacy@<dominio>.
  privacy: {
    emailTemplate: "privacy@vostrodominio.it",
    emailReady: false,
    lastUpdated: "31 luglio 2026",
  },
  sections: { applicationTitle: "Candidati per il roster" },
};
