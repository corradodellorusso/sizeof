export class SizeOfError extends Error {
  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = "SizeOfError";
    this.cause = cause;
  }
}
