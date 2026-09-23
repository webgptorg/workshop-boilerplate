import spaceTrim from "spacetrim";
import { NotFoundError } from "../errors";
import { MOCKED_USERS } from "./mocked-users";
import type { PupilUser, User } from "./types";

export function findUserById(userId: string): User | null {
  return MOCKED_USERS.find((user) => user.id === userId) ?? null;
}

export function getUserById(userId: string): User {
  const user = findUserById(userId);

  if (user === null) {
    throw new NotFoundError(
      spaceTrim(`
        User with id \`${userId}\` does not exist.

        Known user ids: ${MOCKED_USERS.map((knownUser) => `\`${knownUser.id}\``).join(", ")}
      `),
    );
  }

  return user;
}

export function getPupilUserById(userId: string): PupilUser {
  const user = getUserById(userId);

  if (user.role !== "PUPIL") {
    throw new NotFoundError(
      spaceTrim(`
        User with id \`${userId}\` is not a pupil, their role is \`${user.role}\`.
      `),
    );
  }

  return user;
}

export function listPupilUsers(): PupilUser[] {
  return MOCKED_USERS.filter((user): user is PupilUser => user.role === "PUPIL");
}
