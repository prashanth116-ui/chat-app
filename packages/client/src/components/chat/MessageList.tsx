import { useEffect, useRef } from 'react';
import type { MessageWithUser } from '@chat-app/shared';
import { UserAvatar } from '../user/UserAvatar';
import { GenderIcon } from '../user/GenderIcon';
import styles from './MessageList.module.css';

interface MessageListProps {
  messages: MessageWithUser[];
  currentUserId?: string;
}

function formatTime(dateString: string): string {
  return new Date(dateString).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function MessageList({ messages, currentUserId }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className={styles.empty}>
        <p>No messages yet</p>
        <p className={styles.emptyHint}>Be the first to say hello!</p>
      </div>
    );
  }

  return (
    <div className={styles.list}>
      {messages.map((message, index) => {
        const isOwn = message.userId === currentUserId;
        const showAvatar =
          index === 0 || messages[index - 1].userId !== message.userId;

        return (
          <div
            key={message.id}
            className={`${styles.message} ${isOwn ? styles.own : ''}`}
          >
            {!isOwn && showAvatar && (
              <UserAvatar
                username={message.user.username}
                avatarUrl={message.user.avatarUrl}
                size="sm"
              />
            )}
            {!isOwn && !showAvatar && <div className={styles.avatarPlaceholder} />}

            <div className={styles.bubble}>
              {showAvatar && !isOwn && (
                <div className={styles.header}>
                  <span className={styles.username}>{message.user.username}</span>
                  <GenderIcon gender={message.user.gender} size="sm" />
                </div>
              )}
              <p className={styles.content}>{message.content}</p>
              <span className={styles.time}>{formatTime(message.createdAt)}</span>
            </div>
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}
