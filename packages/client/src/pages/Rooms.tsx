import { useState, useMemo } from 'react';
import type { RoomWithDetails } from '@chat-app/shared';
import { useRooms } from '../hooks/useRooms';
import { RoomList } from '../components/rooms/RoomList';
import { CountryFilter } from '../components/rooms/CountryFilter';
import styles from './Rooms.module.css';

type SortOption = 'online' | 'male' | 'female' | 'other' | 'name';

export function Rooms() {
  const [countryId, setCountryId] = useState<number | undefined>();
  const [stateId, setStateId] = useState<number | undefined>();
  const [sortBy, setSortBy] = useState<SortOption>('online');

  const { rooms, isLoading, error } = useRooms({ countryId, stateId });

  const sortedRooms = useMemo(() => {
    const sorted = [...rooms];
    sorted.sort((a, b) => {
      switch (sortBy) {
        case 'online':
          return b.onlineCount - a.onlineCount;
        case 'male':
          return (b.genderCounts?.male ?? 0) - (a.genderCounts?.male ?? 0);
        case 'female':
          return (b.genderCounts?.female ?? 0) - (a.genderCounts?.female ?? 0);
        case 'other':
          return (b.genderCounts?.other ?? 0) - (a.genderCounts?.other ?? 0);
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });
    return sorted;
  }, [rooms, sortBy]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Chat Rooms</h1>
        <div className={styles.filters}>
          <CountryFilter
            selectedCountryId={countryId}
            selectedStateId={stateId}
            onCountryChange={setCountryId}
            onStateChange={setStateId}
          />
          <div className={styles.sortContainer}>
            <label htmlFor="sort" className={styles.sortLabel}>Sort by:</label>
            <select
              id="sort"
              className={styles.sortSelect}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
            >
              <option value="online">Most Online</option>
              <option value="male">Most Male</option>
              <option value="female">Most Female</option>
              <option value="other">Most Other</option>
              <option value="name">Name</option>
            </select>
          </div>
        </div>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <RoomList rooms={sortedRooms} isLoading={isLoading} />
    </div>
  );
}
