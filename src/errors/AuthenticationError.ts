import { SpolecnyStulError } from "./SpolecnyStulError";

/**
 * Thrown when a login attempt does not match any mocked user.
 */
export class AuthenticationError extends SpolecnyStulError {}
