export type UserRole = "PUPIL" | "STAFF" | "PARENT";

type UserBase = {
  readonly id: string;
  readonly username: string;
  /**
   * Plain-text password of a mocked account. There is no real authentication in this version.
   */
  readonly password: string;
  readonly displayName: string;
};

export type PupilUser = UserBase & {
  readonly role: "PUPIL";
  readonly className: string;
};

export type StaffUser = UserBase & {
  readonly role: "STAFF";
  readonly position: string;
};

export type ParentUser = UserBase & {
  readonly role: "PARENT";
  readonly childUserId: string;
};

export type User = PupilUser | StaffUser | ParentUser;
