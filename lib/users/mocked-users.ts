import type { ParentUser, PupilUser, StaffUser, User } from "./types";

/**
 * Accounts of the first version. There is no database, so these are the only users that can log in.
 */
export const PUPIL_USER: PupilUser = {
  id: "user-pupil-adam",
  username: "zak",
  password: "zak123",
  displayName: "Adam Novák",
  role: "PUPIL",
  className: "5.B",
};

export const STAFF_USER: StaffUser = {
  id: "user-staff-jana",
  username: "jidelna",
  password: "jidelna123",
  displayName: "Jana Kuchařová",
  role: "STAFF",
  position: "vedoucí školní jídelny",
};

export const PARENT_USER: ParentUser = {
  id: "user-parent-petra",
  username: "rodic",
  password: "rodic123",
  displayName: "Petra Nováková",
  role: "PARENT",
  childUserId: PUPIL_USER.id,
};

export const MOCKED_USERS: readonly User[] = [PUPIL_USER, STAFF_USER, PARENT_USER];
