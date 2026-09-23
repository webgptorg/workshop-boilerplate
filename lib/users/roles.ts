import type { UserRole } from "./types";

export type RoleDefinition = {
  readonly role: UserRole;
  readonly label: string;
  readonly homePath: string;
  /**
   * One sentence describing what the role can do, shown on the login screen.
   */
  readonly capabilities: string;
};

export const ROLE_DEFINITIONS: Readonly<Record<UserRole, RoleDefinition>> = {
  PUPIL: {
    role: "PUPIL",
    label: "Žák",
    homePath: "/zak",
    capabilities: "Vidí týdenní jídelníček, vybírá si oběd a hodnotí jídla.",
  },
  STAFF: {
    role: "STAFF",
    label: "Jídelna",
    homePath: "/jidelna",
    capabilities: "Sestavuje jídelníček, upravuje jídla a čte hodnocení.",
  },
  PARENT: {
    role: "PARENT",
    label: "Rodič",
    homePath: "/rodic",
    capabilities: "Vidí jídelníček svého dítěte, nastavuje preference a hodnotí jídla.",
  },
};

export const USER_ROLES: readonly UserRole[] = ["PUPIL", "STAFF", "PARENT"];
