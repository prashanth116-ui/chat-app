import { useNavigate } from 'react-router-dom';
import { useConversations } from '../hooks/useConversations';
import { UserAvatar } from '../components/user/UserAvatar';
import { GenderIcon } from '../components/user/GenderIcon';
import styles from './Messages.module.css';

export function Messages() {
  const navigate = useNavigate();
  const { conversations, isLoading, error } = useConversations();

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading conversations...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>{error}</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Messages</h1>

      {conversations.length === 0 ? (
        <div className={styles.empty}>
          <p>No conversations yet</p>
          <p className={styles.emptyHint}>Start a conversation by messaging a friend</p>
        </div>
      ) : (
        <div className={styles.list}>
          {conversations.map((conv) => (
            <button
              key={conv.id}
              className={styles.conversation}
              onClick={() => navigate(`/messages/${conv.id}`)}
            >
              <UserAvatar
                username={conv.otherUser.username}
                avatarUrl={conv.otherUser.avatarUrl}
                size="md"
              />
              <div className={styles.info}>
                <div className={styles.header}>
                  <span className={styles.username}>
                    <GenderIcon gender={conv.otherUser.gender} size="sm" />
                    {conv.otherUser.username}
                  </span>
                  {conv.lastMessage && (
                    <span className={styles.time}>
                      {formatTime(conv.lastMessage.createdAt)}
                    </span>
                  )}
                </div>
                {conv.lastMessage && (
                  <p className={styles.preview}>
                    {conv.lastMessage.content.length > 50
                      ? conv.lastMessage.content.slice(0, 50) + '...'
                      : conv.lastMessage.content}
                  </p>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  if (diff < 60000) return 'now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}d`;

  return date.toLocaleDateString();
}
