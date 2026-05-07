import {HttpErrors, Middleware, MiddlewareContext} from '@loopback/rest';
import {JwtService} from '../services/jwt.service';

const jwtService = new JwtService();

type ProtectedRoute = {
  methods: string[];
  match: (path: string) => boolean;
};

const protectedRoutes: ProtectedRoute[] = [
  {
    methods: ['POST', 'PATCH', 'PUT', 'DELETE'],
    match: path => path === '/users' || path.startsWith('/users/'),
  },
  {
    methods: ['POST', 'PATCH', 'PUT', 'DELETE'],
    match: path =>
      path === '/menu-items' ||
      path.startsWith('/menu-items/') ||
      path === '/menu-items-with-image',
  },
  {
    methods: ['POST'],
    match: path =>
      path === '/upload' ||
      path === '/files' ||
      path === '/filesv2' ||
      path === '/uploadbase64' ||
      path.startsWith('/containers/'),
  },
];

function isProtectedRoute(requestPath: string, requestMethod: string): boolean {
  return protectedRoutes.some(
    route => route.methods.includes(requestMethod) && route.match(requestPath),
  );
}

export const jwtAuthMiddleware: Middleware = async (
  ctx: MiddlewareContext,
  next,
) => {
  const requestPath = (ctx.request.path ?? '').toLowerCase();
  const requestMethod = (ctx.request.method ?? '').toUpperCase();

  if (!isProtectedRoute(requestPath, requestMethod)) {
    return next();
  }

  const authHeader = ctx.request.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new HttpErrors.Unauthorized('Missing or invalid Authorization header.');
  }

  const token = authHeader.slice('Bearer '.length).trim();
  if (!token) {
    throw new HttpErrors.Unauthorized('Missing bearer token.');
  }

  try {
    const payload = jwtService.verifyToken(token);
    (ctx.request as MiddlewareContext['request'] & {user?: unknown}).user = payload;
    return next();
  } catch (error) {
    throw new HttpErrors.Unauthorized('Invalid or expired token.');
  }
};
