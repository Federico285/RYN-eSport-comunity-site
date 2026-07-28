import type { OpenPosition } from "../types/positions";

export type TeamRole = "top" | "jungle" | "mid" | "bot" | "support";

export type TeamMember = {
  role: TeamRole;
  roleLabel: string;
  name?: string;
  tag?: string;
  imageUrl?: string;
};

export type Team = {
  id: string;
  name: string;
  tier: string;
  statement: string;
  accent: string;
  secondary: string;
  roster: TeamMember[];
  coach?: Omit<TeamMember, "role" | "roleLabel">;
};

const roleLabels: Record<TeamRole, string> = {
  top: "Top",
  jungle: "Jungle",
  mid: "Mid",
  bot: "Bot",
  support: "Support",
};

const roster = (
  members: Partial<
    Record<TeamRole, Pick<TeamMember, "name" | "tag" | "imageUrl">>
  >,
): TeamMember[] =>
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
      top: { name: "Valken", tag: "RYN" },
      jungle: { name: "Kairo", tag: "RYN" },
      mid: { name: "Noctis", tag: "RYN" },
      bot: { name: "Raiden", tag: "RYN" },
    }),
    coach: { name: "Maverick", tag: "HEAD COACH" },
  },
  {
    id: "nova",
    name: "RYN Nova",
    tier: "Academy roster",
    statement: "Talento giovane, crescita veloce.",
    accent: "#22e0b8",
    secondary: "#34a8ff",
    roster: roster({
      top: { name: "Aster", tag: "RYN" },
      jungle: { name: "Flint", tag: "RYN" },
      mid: { name: "Lyra", tag: "RYN" },
      support: { name: "Echo", tag: "RYN" },
    }),
  },
  {
    id: "pulse",
    name: "RYN Pulse",
    tier: "Development roster",
    statement: "Il prossimo livello parte da qui.",
    accent: "#f0d84b",
    secondary: "#ef5da8",
    roster: roster({
      jungle: { name: "Nox", tag: "RYN" },
      mid: { name: "Zero", tag: "RYN" },
      bot: { name: "Flux", tag: "RYN" },
      support: { name: "Vesper", tag: "RYN" },
    }),
    coach: { name: "Iris", tag: "PERFORMANCE COACH" },
  },
];

export const openPositions: OpenPosition[] = teams.flatMap((team) => [
  ...team.roster
    .filter((member) => !member.name)
    .map((member) => ({
      id: `${team.id}-${member.role}`,
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
  ...(!team.coach?.name
    ? [
        {
          id: `${team.id}-coach`,
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
]);

export const siteConfig = {
  communityName: "RYN eSport Community",
  tagline: "Choose your lane. Earn your place.",
  minimumAge: 16,
  discordInviteUrl:
    import.meta.env.VITE_DISCORD_INVITE_URL || "https://discord.gg/placeholder",
  contactEmail: "staff@example.com",
  sections: { applicationTitle: "Candidati per il roster" },
};
