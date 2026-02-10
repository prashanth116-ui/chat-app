import type { RoomWithDetails } from '@chat-app/shared';
import { RoomCard } from './RoomCard';
import styles from './RoomList.module.css';

interface RoomListProps {
  rooms: RoomWithDetails[];
  isLoading?: boolean;
  emptyMessage?: string;
}

export function RoomList({ rooms, isLoading, emptyMessage = 'No rooms found' }: RoomListProps) {
  if (isLoading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
        <span>Loading rooms...</span>
      </div>
    );
  }

  if (rooms.length === 0) {
    return <div className={styles.empty}>{emptyMessage}</div>;
  }

  return (
    <div className={styles.list}>
      {rooms.map((room) => (
        <RoomCard key={room.id} room={room} />
      ))}
    </div>
  );
}
