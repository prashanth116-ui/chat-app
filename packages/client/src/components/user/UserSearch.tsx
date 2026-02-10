import { useState, useEffect, useRef } from 'react';
import type { UserPublic } from '@chat-app/shared';
import { users } from '../../services/api';
import { UserAvatar } from './UserAvatar';
import { GenderIcon } from './GenderIcon';
import styles from './UserSearch.module.css';

interface UserSearchProps {
  onSelect: (user: UserPublic) => void;
  placeholder?: string;
}

export function UserSearch({ onSelect, placeholder = 'Search users...' }: UserSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<UserPublic[]>([]);
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
        const data = await users.search(query);
        setResults(data);
        setIsOpen(true);
      } catch {
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (user: UserPublic) => {
    onSelect(user);
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
          {results.map((user) => (
            <button
              key={user.id}
              className={styles.result}
              onClick={() => handleSelect(user)}
            >
              <UserAvatar username={user.username} avatarUrl={user.avatarUrl} size="sm" />
              <span className={styles.username}>
                <GenderIcon gender={user.gender} size="sm" />
                {user.username}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
