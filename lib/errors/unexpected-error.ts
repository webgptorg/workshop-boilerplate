/**
 * Thrown from code paths that should be unreachable, for example an exhaustive `switch` fallthrough.
 */
export class UnexpectedError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = "UnexpectedError";
    Object.setPrototypeOf(this, UnexpectedError.prototype);
  }
}
