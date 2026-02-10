import { useEffect, useCallback, useRef } from 'react';
import { socketService } from '../services/socket';
import type {
  NewMessageEvent,
  UserJoinedEvent,
  UserLeftEvent,
  UserTypingEvent,
  OnlineUsersEvent,
} from '@chat-app/shared';

interface UseSocketOptions {
  onNewMessage?: (data: NewMessageEvent) => void;
  onUserJoined?: (data: UserJoinedEvent) => void;
  onUserLeft?: (data: UserLeftEvent) => void;
  onUserTyping?: (data: UserTypingEvent) => void;
  onOnlineUsers?: (data: OnlineUsersEvent) => void;
  onError?: (data: { message: string }) => void;
}

export function useSocketEvents(options: UseSocketOptions) {
  const optionsRef = useRef(options);
  optionsRef.current = options;

  useEffect(() => {
    const unsubscribes: (() => void)[] = [];

    if (optionsRef.current.onNewMessage) {
      unsubscribes.push(
        socketService.onNewMessage((data) => optionsRef.current.onNewMessage?.(data))
      );
    }

    if (optionsRef.current.onUserJoined) {
      unsubscribes.push(
        socketService.onUserJoined((data) => optionsRef.current.onUserJoined?.(data))
      );
    }

    if (optionsRef.current.onUserLeft) {
      unsubscribes.push(
        socketService.onUserLeft((data) => optionsRef.current.onUserLeft?.(data))
      );
    }

    if (optionsRef.current.onUserTyping) {
      unsubscribes.push(
        socketService.onUserTyping((data) => optionsRef.current.onUserTyping?.(data))
      );
    }

    if (optionsRef.current.onOnlineUsers) {
      unsubscribes.push(
        socketService.onOnlineUsers((data) => optionsRef.current.onOnlineUsers?.(data))
      );
    }

    if (optionsRef.current.onError) {
      unsubscribes.push(
        socketService.onError((data) => optionsRef.current.onError?.(data))
      );
    }

    return () => {
      unsubscribes.forEach((unsub) => unsub());
    };
  }, []);

  const joinRoom = useCallback((roomId: string) => {
    socketService.joinRoom(roomId);
  }, []);

  const leaveRoom = useCallback((roomId: string) => {
    socketService.leaveRoom(roomId);
  }, []);

  const sendMessage = useCallback((roomId: string, content: string) => {
    socketService.sendMessage(roomId, content);
  }, []);

  const sendTyping = useCallback((roomId: string) => {
    socketService.sendTyping(roomId);
  }, []);

  return {
    joinRoom,
    leaveRoom,
    sendMessage,
    sendTyping,
    isConnected: socketService.isConnected(),
  };
}
