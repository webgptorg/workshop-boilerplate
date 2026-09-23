import spaceTrim from "spacetrim";
import { AuthenticationError } from "../errors";
import { MOCKED_USERS } from "./mocked-users";
import type { User } from "./types";

/**
 * Checks the credentials against the mocked accounts.
 *
 * @throws {AuthenticationError} when the credentials do not match any account
 */
export function authenticateUser(username: string, password: string): User {
  const normalizedUsername = username.trim().toLowerCase();

  const user = MOCKED_USERS.find(
    (candidate) => candidate.username === normalizedUsername && candidate.password === password,
  );

  if (user === undefined) {
    throw new AuthenticationError(
      spaceTrim(`
        Username \`${normalizedUsername}\` and the given password do not match any account.

        **Note:** This version has only mocked accounts, see \`lib/users/mocked-users.ts\`.
      `),
    );
  }

  return user;
}
