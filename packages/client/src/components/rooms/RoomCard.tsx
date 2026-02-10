import { Link } from 'react-router-dom';
import type { RoomWithDetails } from '@chat-app/shared';
import styles from './RoomCard.module.css';

interface RoomCardProps {
  room: RoomWithDetails;
}

export function RoomCard({ room }: RoomCardProps) {
  return (
    <Link to={`/chat/${room.id}`} className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.name}>{room.name}</h3>
        {room.countryFlag && <span className={styles.flag}>{room.countryFlag}</span>}
      </div>

      {room.description && (
        <p className={styles.description}>{room.description}</p>
      )}

      <div className={styles.footer}>
        <div className={styles.location}>
          {room.countryName && <span>{room.countryName}</span>}
          {room.stateName && <span> - {room.stateName}</span>}
        </div>
        <div className={styles.stats}>
          <span className={styles.online}>
            <span className={styles.onlineDot} />
            {room.onlineCount} online
          </span>
          <span className={styles.members}>{room.memberCount} members</span>
        </div>
      </div>
    </Link>
  );
}
