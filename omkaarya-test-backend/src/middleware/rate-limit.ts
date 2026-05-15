import rateLimit, { type Options, type RateLimitRequestHandler } from "express-rate-limit";

type RateLimitOptions = Pick<Options, "windowMs" | "max"> &
  Partial<Omit<Options, "windowMs" | "max">>;

/**
 * Rate limiter defaults for deployments behind Vercel / reverse proxies.
 * Express resolves the client IP via `trust proxy` + `X-Forwarded-For`, not RFC 7239 `Forwarded`.
 */
export function createRateLimiter(options: RateLimitOptions): RateLimitRequestHandler {
  const { validate: userValidate, ...rest } = options;
  const validate =
    userValidate === false
      ? false
      : {
          forwardedHeader: false,
          ...(userValidate && typeof userValidate === "object" ? userValidate : {}),
        };

  return rateLimit({
    standardHeaders: true,
    legacyHeaders: false,
    validate,
    ...rest,
  });
}
