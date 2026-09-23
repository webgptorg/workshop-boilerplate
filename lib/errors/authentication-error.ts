/**
 * Thrown when a username and password pair does not match any known account.
 */
export class AuthenticationError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = "AuthenticationError";
    Object.setPrototypeOf(this, AuthenticationError.prototype);
  }
}
