import styles from './UserAvatar.module.css';

interface UserAvatarProps {
  username: string;
  avatarUrl?: string | null;
  size?: 'sm' | 'md' | 'lg';
  isOnline?: boolean;
}

function getInitials(username: string): string {
  return username.slice(0, 2).toUpperCase();
}

function getColorFromName(name: string): string {
  const colors = [
    '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e',
    '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
    '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export function UserAvatar({ username, avatarUrl, size = 'md', isOnline }: UserAvatarProps) {
  const backgroundColor = getColorFromName(username);

  return (
    <div className={`${styles.avatar} ${styles[size]}`}>
      {avatarUrl ? (
        <img src={avatarUrl} alt={username} className={styles.image} />
      ) : (
        <div className={styles.initials} style={{ backgroundColor }}>
          {getInitials(username)}
        </div>
      )}
      {isOnline !== undefined && (
        <span className={`${styles.status} ${isOnline ? styles.online : styles.offline}`} />
      )}
    </div>
  );
}
