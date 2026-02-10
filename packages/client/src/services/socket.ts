import { io, Socket } from 'socket.io-client';
import {
  SocketEvents,
  type JoinRoomPayload,
  type LeaveRoomPayload,
  type SendMessagePayload,
  type TypingPayload,
  type NewMessageEvent,
  type UserJoinedEvent,
  type UserLeftEvent,
  type UserTypingEvent,
  type OnlineUsersEvent,
} from '@chat-app/shared';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || '';

class SocketService {
  private socket: Socket | null = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private listeners: Map<string, Set<(data: any) => void>> = new Map();

  connect(token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket?.connected) {
        resolve();
        return;
      }

      this.socket = io(SOCKET_URL, {
        auth: { token },
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      this.socket.on('connect', () => {
        console.log('Socket connected');
        resolve();
      });

      this.socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        reject(error);
      });

      this.socket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
      });

      // Re-register all listeners when reconnecting
      this.socket.on('connect', () => {
        this.listeners.forEach((callbacks, event) => {
          callbacks.forEach((callback) => {
            this.socket?.on(event, callback);
          });
        });
      });
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.listeners.clear();
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  // Room actions
  joinRoom(roomId: string): void {
    this.socket?.emit(SocketEvents.JOIN_ROOM, { roomId } as JoinRoomPayload);
  }

  leaveRoom(roomId: string): void {
    this.socket?.emit(SocketEvents.LEAVE_ROOM, { roomId } as LeaveRoomPayload);
  }

  // Message actions
  sendMessage(roomId: string, content: string): void {
    this.socket?.emit(SocketEvents.SEND_MESSAGE, { roomId, content } as SendMessagePayload);
  }

  sendTyping(roomId: string): void {
    this.socket?.emit(SocketEvents.TYPING, { roomId } as TypingPayload);
  }

  // Event listeners
  onNewMessage(callback: (data: NewMessageEvent) => void): () => void {
    return this.on(SocketEvents.NEW_MESSAGE, callback);
  }

  onUserJoined(callback: (data: UserJoinedEvent) => void): () => void {
    return this.on(SocketEvents.USER_JOINED, callback);
  }

  onUserLeft(callback: (data: UserLeftEvent) => void): () => void {
    return this.on(SocketEvents.USER_LEFT, callback);
  }

  onUserTyping(callback: (data: UserTypingEvent) => void): () => void {
    return this.on(SocketEvents.USER_TYPING, callback);
  }

  onOnlineUsers(callback: (data: OnlineUsersEvent) => void): () => void {
    return this.on(SocketEvents.ONLINE_USERS, callback);
  }

  onError(callback: (data: { message: string }) => void): () => void {
    return this.on(SocketEvents.ERROR, callback);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private on<T>(event: string, callback: (data: T) => void): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
    this.socket?.on(event, callback as (...args: unknown[]) => void);

    return () => {
      this.listeners.get(event)?.delete(callback);
      this.socket?.off(event, callback as (...args: unknown[]) => void);
    };
  }
}

export const socketService = new SocketService();
