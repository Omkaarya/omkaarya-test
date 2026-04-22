export class HttpError extends Error {
  readonly statusCode: number;
  /** Machine-readable, stable identifier (e.g. TEMPLE_NOT_FOUND). */
  readonly code: string;
  /** Longer human explanation; defaults in the error handler if omitted. */
  readonly reason?: string;

  constructor(
    statusCode: number,
    message: string,
    options?: { cause?: unknown; code?: string; reason?: string }
  ) {
    super(message, options);
    this.name = "HttpError";
    this.statusCode = statusCode;
    this.code = options?.code ?? `HTTP_${statusCode}`;
    this.reason = options?.reason;
  }
}

export function isHttpError(e: unknown): e is HttpError {
  return e instanceof HttpError;
}
