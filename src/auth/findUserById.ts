import { spaceTrim } from "spacetrim";
import { NotFoundError } from "@/errors";
import { MOCKED_USERS, type MockedUser } from "./mockedUsers";

/**
 * @throws {NotFoundError} when the user does not exist
 */
export function findUserById(userId: string): MockedUser {
  const user = MOCKED_USERS.find((candidate) => candidate.id === userId);

  if (!user) {
    throw new NotFoundError(
      spaceTrim(`
        Uživatel s identifikátorem \`${userId}\` neexistuje.

        Dostupní uživatelé: ${MOCKED_USERS.map((candidate) => `\`${candidate.id}\``).join(", ")}
      `),
    );
  }

  return user;
}
