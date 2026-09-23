import type { UserRole } from "@/model/types";

export interface RoleDefinition {
  readonly role: UserRole;
  readonly label: string;
  /** Route where the role starts after login */
  readonly homePath: string;
}

export const ROLE_DEFINITIONS: Readonly<Record<UserRole, RoleDefinition>> = {
  pupil: { role: "pupil", label: "Žák", homePath: "/zak" },
  staff: { role: "staff", label: "Jídelna", homePath: "/jidelna" },
  parent: { role: "parent", label: "Rodič", homePath: "/rodic" },
};
