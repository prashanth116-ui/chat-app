import type { UserPublic } from '@chat-app/shared';
import { UserAvatar } from '../user/UserAvatar';
import { GenderIcon } from '../user/GenderIcon';
import { Button } from '../common/Button';
import styles from './FriendList.module.css';

interface FriendListProps {
  friends: UserPublic[];
  onRemove: (userId: string) => void;
  onMessage: (userId: string) => void;
  isLoading?: boolean;
}

export function FriendList({ friends, onRemove, onMessage, isLoading }: FriendListProps) {
  if (isLoading) {
    return <div className={styles.loading}>Loading friends...</div>;
  }

  if (friends.length === 0) {
    return (
      <div className={styles.empty}>
        <p>No friends yet</p>
        <p className={styles.emptyHint}>Search for users to add them as friends</p>
      </div>
    );
  }

  return (
    <div className={styles.list}>
      {friends.map((friend) => (
        <div key={friend.id} className={styles.item}>
          <div className={styles.info}>
            <UserAvatar username={friend.username} avatarUrl={friend.avatarUrl} size="md" />
            <span className={styles.username}>
              <GenderIcon gender={friend.gender} size="sm" />
              {friend.username}
            </span>
          </div>
          <div className={styles.actions}>
            <Button size="sm" onClick={() => onMessage(friend.id)}>
              Message
            </Button>
            <Button size="sm" variant="outline" onClick={() => onRemove(friend.id)}>
              Remove
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
