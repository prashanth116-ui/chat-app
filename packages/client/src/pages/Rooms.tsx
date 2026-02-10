import { useState } from 'react';
import { useRooms } from '../hooks/useRooms';
import { RoomList } from '../components/rooms/RoomList';
import { CountryFilter } from '../components/rooms/CountryFilter';
import styles from './Rooms.module.css';

export function Rooms() {
  const [countryId, setCountryId] = useState<number | undefined>();
  const [stateId, setStateId] = useState<number | undefined>();

  const { rooms, isLoading, error } = useRooms({ countryId, stateId });

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Chat Rooms</h1>
        <CountryFilter
          selectedCountryId={countryId}
          selectedStateId={stateId}
          onCountryChange={setCountryId}
          onStateChange={setStateId}
        />
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <RoomList rooms={rooms} isLoading={isLoading} />
    </div>
  );
}
