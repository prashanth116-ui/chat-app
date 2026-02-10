import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import type { RoomWithDetails } from '@chat-app/shared';
import styles from './RoomSearch.module.css';

const API_URL = import.meta.env.VITE_API_URL || '';

interface RoomSearchProps {
  placeholder?: string;
}

export function RoomSearch({ placeholder = 'Search rooms...' }: RoomSearchProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<RoomWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `${API_URL}/api/rooms/search?q=${encodeURIComponent(query)}`
        );
        if (response.ok) {
          const data = await response.json();
          setResults(data);
          setIsOpen(true);
        }
      } catch {
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (room: RoomWithDetails) => {
    navigate(`/chat/${room.id}`);
    setQuery('');
    setResults([]);
    setIsOpen(false);
  };

  return (
    <div className={styles.container} ref={containerRef}>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => results.length > 0 && setIsOpen(true)}
        placeholder={placeholder}
        className={styles.input}
      />
      {isLoading && <div className={styles.spinner} />}
      {isOpen && results.length > 0 && (
        <div className={styles.dropdown}>
          {results.map((room) => (
            <button
              key={room.id}
              className={styles.result}
              onClick={() => handleSelect(room)}
            >
              <div className={styles.roomInfo}>
                <span className={styles.roomName}>
                  {room.countryFlag && <span>{room.countryFlag} </span>}
                  {room.name}
                </span>
                <span className={styles.roomMeta}>
                  {room.memberCount} members
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
