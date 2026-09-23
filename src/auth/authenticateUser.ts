import { spaceTrim } from "spacetrim";
import { AuthenticationError } from "@/errors";
import { MOCKED_USERS, type MockedUser } from "./mockedUsers";

/**
 * Finds the mocked user matching the credentials.
 *
 * @throws {AuthenticationError} when no user matches
 */
export function authenticateUser(username: string, password: string): MockedUser {
  const normalizedUsername = username.trim().toLowerCase();

  const user = MOCKED_USERS.find(
    (candidate) => candidate.username === normalizedUsername && candidate.password === password,
  );

  if (!user) {
    throw new AuthenticationError(
      spaceTrim(`
        Uživatelské jméno nebo heslo nesouhlasí.

        **Zkontrolujte** zadané jméno \`${normalizedUsername}\` a heslo.
        Zkušební účty jsou vypsané pod přihlašovacím formulářem.
      `),
    );
  }

  return user;
}
