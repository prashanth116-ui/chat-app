import type { Socket } from 'socket.io';
import { verifyToken, type TokenPayload } from '../../utils/jwt.js';

declare module 'socket.io' {
  interface Socket {
    user?: TokenPayload;
  }
}

export function socketAuthMiddleware(socket: Socket, next: (err?: Error) => void) {
  const token = socket.handshake.auth.token;

  if (!token) {
    return next(new Error('Authentication required'));
  }

  try {
    const payload = verifyToken(token);
    socket.user = payload;
    next();
  } catch {
    next(new Error('Invalid token'));
  }
}
