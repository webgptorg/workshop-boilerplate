/**
 * Thrown when a record (user, meal, week plan, …) is looked up by id and does not exist.
 */
export class NotFoundError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}
