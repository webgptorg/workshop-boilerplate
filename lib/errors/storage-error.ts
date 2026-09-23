/**
 * Thrown when data persisted in the browser storage cannot be read or has an unexpected shape.
 */
export class StorageError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = "StorageError";
    Object.setPrototypeOf(this, StorageError.prototype);
  }
}
