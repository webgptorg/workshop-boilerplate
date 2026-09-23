import type { UserRole } from "@/model/types";

export interface MockedUser {
  readonly id: string;
  readonly username: string;
  readonly password: string;
  readonly role: UserRole;
  readonly displayName: string;
  /** Class of the pupil, or class of the child of the parent */
  readonly className?: string;
  /** Pupil the parent takes care of */
  readonly childId?: string;
}

export const PUPIL_USER: MockedUser = {
  id: "pupil-anicka",
  username: "zak",
  password: "zak123",
  role: "pupil",
  displayName: "Anička Nováková",
  className: "4.B",
};

export const STAFF_USER: MockedUser = {
  id: "staff-marie",
  username: "jidelna",
  password: "jidelna123",
  role: "staff",
  displayName: "Marie Kuchařová",
};

export const PARENT_USER: MockedUser = {
  id: "parent-petr",
  username: "rodic",
  password: "rodic123",
  role: "parent",
  displayName: "Petr Novák",
  childId: PUPIL_USER.id,
  className: PUPIL_USER.className,
};

export const MOCKED_USERS: readonly MockedUser[] = [PUPIL_USER, STAFF_USER, PARENT_USER];
