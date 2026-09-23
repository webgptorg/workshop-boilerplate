import { spaceTrim } from "../../lib/space-trim";
export class AppError extends Error {
  readonly brand = "SpolecnyStulError";
  constructor(
    message: string,
    readonly status = 400,
  ) {
    super(spaceTrim(message));
    this.name = "AppError";
  }
}
