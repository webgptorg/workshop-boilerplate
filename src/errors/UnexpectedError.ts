import { SpolecnyStulError } from "./SpolecnyStulError";

/**
 * Thrown when the application reaches a state which should never happen,
 * for example a hook used outside of its provider.
 */
export class UnexpectedError extends SpolecnyStulError {}
