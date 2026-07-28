import { BrainCircuit } from "lucide-react";
import type { TeamRole } from "../data/siteConfig";

type RoleIconProps = {
  role: TeamRole | "coach";
  size?: number;
  className?: string;
};

const publicAsset = (path: string) => `${import.meta.env.BASE_URL}${path}`;

export function RoleIcon({ role, size = 28, className }: RoleIconProps) {
  if (role === "coach") {
    return (
      <BrainCircuit
        aria-hidden="true"
        className={className}
        size={size}
        strokeWidth={1.5}
      />
    );
  }

  return (
    <img
      className={`role-icon ${className ?? ""}`}
      src={publicAsset(`roles/${role}.svg`)}
      width={size}
      height={size}
      alt=""
      aria-hidden="true"
    />
  );
}