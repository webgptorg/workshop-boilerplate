import { SpolecnyStulError } from "./SpolecnyStulError";

/**
 * Thrown when a referenced entity (meal, user, week plan) does not exist.
 */
export class NotFoundError extends SpolecnyStulError {}
