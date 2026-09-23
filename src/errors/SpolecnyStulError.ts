/**
 * Base class for all branded errors thrown by the application.
 *
 * Messages are formatted as markdown and written with `spaceTrim`
 * so that they stay readable both in the console and in the UI.
 */
export abstract class SpolecnyStulError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = new.target.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
