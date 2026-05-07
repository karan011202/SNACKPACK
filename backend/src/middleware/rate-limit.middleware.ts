import {Middleware, MiddlewareContext} from '@loopback/rest';
import rateLimit, {ipKeyGenerator} from 'express-rate-limit';

function getRequestIdentity(request: MiddlewareContext['request']): string {
  const body = request.body as
    | {
        email?: unknown;
        phone?: unknown;
      }
    | undefined;

  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
  const phone = typeof body?.phone === 'string' ? body.phone.trim() : '';

  return email || phone || 'anonymous';
}

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // max 5 requests per window per IP
  message: {
    error: 'Too many login attempts. Try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: request => {
    const ip = ipKeyGenerator(request.ip || request.socket.remoteAddress || '');
    const identity = getRequestIdentity(request as MiddlewareContext['request']);
    return `${ip}:${identity}`;
  },
});

export const rateLimitMiddleware: Middleware = async (
  ctx: MiddlewareContext,
  next,
) => {
  const protectedRoutes = ['/signin', '/auth/send-otp', '/auth/verify-otp'];
  const requestPath = (ctx.request.path ?? '').toLowerCase();
  const requestMethod = (ctx.request.method ?? '').toUpperCase();

  const isProtectedRoute = protectedRoutes.some(
    route => requestPath === route || requestPath.endsWith(route),
  );

  if (requestMethod !== 'POST' || !isProtectedRoute) {
    return next();
  }
  
  return new Promise((resolve, reject) => {
    limiter(ctx.request, ctx.response, (err: unknown) => {
      if (err) reject(err);
      else resolve(next());
    });
  });
};