import type { FriendWithUser } from '@chat-app/shared';
import { UserAvatar } from '../user/UserAvatar';
import { GenderIcon } from '../user/GenderIcon';
import { Button } from '../common/Button';
import styles from './FriendRequests.module.css';

interface FriendRequestsProps {
  requests: FriendWithUser[];
  onAccept: (friendshipId: string) => void;
  onDecline: (friendshipId: string) => void;
  isLoading?: boolean;
}

export function FriendRequests({ requests, onAccept, onDecline, isLoading }: FriendRequestsProps) {
  if (isLoading) {
    return <div className={styles.loading}>Loading requests...</div>;
  }

  if (requests.length === 0) {
    return (
      <div className={styles.empty}>
        <p>No pending requests</p>
      </div>
    );
  }

  return (
    <div className={styles.list}>
      {requests.map((request) => (
        <div key={request.id} className={styles.item}>
          <div className={styles.info}>
            <UserAvatar
              username={request.user.username}
              avatarUrl={request.user.avatarUrl}
              size="md"
            />
            <div className={styles.details}>
              <span className={styles.username}>
                <GenderIcon gender={request.user.gender} size="sm" />
                {request.user.username}
              </span>
              <span className={styles.date}>
                {new Date(request.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
          <div className={styles.actions}>
            <Button size="sm" onClick={() => onAccept(request.id)}>
              Accept
            </Button>
            <Button size="sm" variant="outline" onClick={() => onDecline(request.id)}>
              Decline
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

interface SentRequestsProps {
  requests: FriendWithUser[];
  onCancel: (friendshipId: string) => void;
  isLoading?: boolean;
}

export function SentRequests({ requests, onCancel, isLoading }: SentRequestsProps) {
  if (isLoading) {
    return <div className={styles.loading}>Loading sent requests...</div>;
  }

  if (requests.length === 0) {
    return (
      <div className={styles.empty}>
        <p>No sent requests</p>
      </div>
    );
  }

  return (
    <div className={styles.list}>
      {requests.map((request) => (
        <div key={request.id} className={styles.item}>
          <div className={styles.info}>
            <UserAvatar
              username={request.user.username}
              avatarUrl={request.user.avatarUrl}
              size="md"
            />
            <div className={styles.details}>
              <span className={styles.username}>
                <GenderIcon gender={request.user.gender} size="sm" />
                {request.user.username}
              </span>
              <span className={styles.status}>Pending</span>
            </div>
          </div>
          <Button size="sm" variant="outline" onClick={() => onCancel(request.id)}>
            Cancel
          </Button>
        </div>
      ))}
    </div>
  );
}
