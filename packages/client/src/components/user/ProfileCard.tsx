import type { UserPublic } from '@chat-app/shared';
import { UserAvatar } from './UserAvatar';
import { GenderIcon } from './GenderIcon';
import styles from './ProfileCard.module.css';

interface ProfileCardProps {
  user: UserPublic;
  isOnline?: boolean;
}

export function ProfileCard({ user, isOnline }: ProfileCardProps) {
  return (
    <div className={styles.card}>
      <UserAvatar
        username={user.username}
        avatarUrl={user.avatarUrl}
        size="lg"
        isOnline={isOnline}
      />
      <div className={styles.info}>
        <div className={styles.nameRow}>
          <span className={styles.username}>{user.username}</span>
          <GenderIcon gender={user.gender} size="sm" />
        </div>
      </div>
    </div>
  );
}
