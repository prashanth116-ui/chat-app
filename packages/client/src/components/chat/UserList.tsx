import type { UserPublic } from '@chat-app/shared';
import { UserAvatar } from '../user/UserAvatar';
import { GenderIcon } from '../user/GenderIcon';
import styles from './UserList.module.css';

interface UserListProps {
  users: UserPublic[];
  title?: string;
}

export function UserList({ users, title = 'Online' }: UserListProps) {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.title}>{title}</span>
        <span className={styles.count}>{users.length}</span>
      </div>
      <div className={styles.list}>
        {users.map((user) => (
          <div key={user.id} className={styles.user}>
            <UserAvatar
              username={user.username}
              avatarUrl={user.avatarUrl}
              size="sm"
              isOnline
            />
            <span className={styles.username}>{user.username}</span>
            <GenderIcon gender={user.gender} size="sm" />
          </div>
        ))}
      </div>
    </div>
  );
}
