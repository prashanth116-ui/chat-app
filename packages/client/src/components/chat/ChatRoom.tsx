import { useState, useEffect, useCallback } from 'react';
import type { MessageWithUser, UserPublic } from '@chat-app/shared';
import { messages as messagesApi } from '../../services/api';
import { useSocketEvents } from '../../hooks/useSocket';
import { useAuth } from '../../hooks/useAuth';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { UserList } from './UserList';
import styles from './ChatRoom.module.css';

interface ChatRoomProps {
  roomId: string;
  roomName: string;
}

export function ChatRoom({ roomId, roomName }: ChatRoomProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<MessageWithUser[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<UserPublic[]>([]);
  const [typingUsers, setTypingUsers] = useState<Map<string, string>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [showUsers, setShowUsers] = useState(false);

  // Socket event handlers
  const handleNewMessage = useCallback((data: { message: MessageWithUser }) => {
    if (data.message.roomId === roomId) {
      setMessages((prev) => [...prev, data.message]);
    }
  }, [roomId]);

  const handleUserJoined = useCallback((data: { user: UserPublic; roomId: string }) => {
    if (data.roomId === roomId) {
      setOnlineUsers((prev) => {
        if (prev.some((u) => u.id === data.user.id)) return prev;
        return [...prev, data.user];
      });
    }
  }, [roomId]);

  const handleUserLeft = useCallback((data: { userId: string; roomId: string }) => {
    if (data.roomId === roomId) {
      setOnlineUsers((prev) => prev.filter((u) => u.id !== data.userId));
    }
  }, [roomId]);

  const handleUserTyping = useCallback((data: { userId: string; username: string; roomId: string }) => {
    if (data.roomId === roomId && data.userId !== user?.id) {
      setTypingUsers((prev) => {
        const newMap = new Map(prev);
        newMap.set(data.userId, data.username);
        return newMap;
      });

      // Clear typing indicator after 3 seconds
      setTimeout(() => {
        setTypingUsers((prev) => {
          const newMap = new Map(prev);
          newMap.delete(data.userId);
          return newMap;
        });
      }, 3000);
    }
  }, [roomId, user?.id]);

  const handleOnlineUsers = useCallback((data: { roomId: string; users: UserPublic[] }) => {
    if (data.roomId === roomId) {
      setOnlineUsers(data.users);
    }
  }, [roomId]);

  const { joinRoom, leaveRoom, sendMessage, sendTyping } = useSocketEvents({
    onNewMessage: handleNewMessage,
    onUserJoined: handleUserJoined,
    onUserLeft: handleUserLeft,
    onUserTyping: handleUserTyping,
    onOnlineUsers: handleOnlineUsers,
  });

  // Load initial messages and join room
  useEffect(() => {
    async function load() {
      try {
        setIsLoading(true);
        const loadedMessages = await messagesApi.getByRoom(roomId);
        setMessages(loadedMessages);
        joinRoom(roomId);
      } catch (error) {
        console.error('Failed to load messages:', error);
      } finally {
        setIsLoading(false);
      }
    }

    load();

    return () => {
      leaveRoom(roomId);
    };
  }, [roomId, joinRoom, leaveRoom]);

  const handleSend = (content: string) => {
    sendMessage(roomId, content);
  };

  const handleTyping = () => {
    sendTyping(roomId);
  };

  const typingText = typingUsers.size > 0
    ? Array.from(typingUsers.values()).join(', ') + ' typing...'
    : null;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.roomName}>{roomName}</h2>
        <button
          className={styles.usersToggle}
          onClick={() => setShowUsers(!showUsers)}
        >
          {onlineUsers.length} online
        </button>
      </div>

      <div className={styles.content}>
        <div className={styles.chat}>
          {isLoading ? (
            <div className={styles.loading}>Loading messages...</div>
          ) : (
            <MessageList messages={messages} currentUserId={user?.id} />
          )}

          {typingText && <div className={styles.typing}>{typingText}</div>}

          <MessageInput
            onSend={handleSend}
            onTyping={handleTyping}
            disabled={isLoading}
          />
        </div>

        {showUsers && (
          <div className={styles.sidebar}>
            <UserList users={onlineUsers} />
          </div>
        )}
      </div>
    </div>
  );
}
