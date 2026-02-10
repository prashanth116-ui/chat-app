import { Link } from 'react-router-dom';
import type { RoomWithDetails } from '@chat-app/shared';
import styles from './RoomCard.module.css';

interface RoomCardProps {
  room: RoomWithDetails;
}

export function RoomCard({ room }: RoomCardProps) {
  const { genderCounts } = room;

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
          {genderCounts && room.onlineCount > 0 && (
            <span className={styles.genderStats}>
              <span className={styles.male} title="Male">{genderCounts.male}</span>
              <span className={styles.female} title="Female">{genderCounts.female}</span>
              <span className={styles.other} title="Other">{genderCounts.other}</span>
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
