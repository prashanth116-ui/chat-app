import { useParams, Navigate, Link } from 'react-router-dom';
import { useRoom } from '../hooks/useRooms';
import { useAuth } from '../hooks/useAuth';
import { ChatRoom } from '../components/chat/ChatRoom';
import styles from './Chat.module.css';

export function Chat() {
  const { roomId } = useParams<{ roomId: string }>();
  const { isAuthenticated } = useAuth();
  const { room, isLoading, error } = useRoom(roomId);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!roomId) {
    return <Navigate to="/rooms" replace />;
  }

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
        <span>Loading room...</span>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className={styles.error}>
        <h2>Room not found</h2>
        <p>{error || 'The room you are looking for does not exist.'}</p>
        <Link to="/rooms" className={styles.backLink}>
          Back to rooms
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <ChatRoom roomId={roomId} roomName={room.name} />
    </div>
  );
}
