export class HttpError extends Error {
  readonly statusCode: number;

  constructor(statusCode: number, message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "HttpError";
    this.statusCode = statusCode;
  }
}

export function isHttpError(e: unknown): e is HttpError {
  return e instanceof HttpError;
}
