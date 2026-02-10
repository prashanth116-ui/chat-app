import { useState } from 'react';
import type { Room } from '@chat-app/shared';
import { rooms as roomsApi } from '../../services/api';
import { useCountries, useStates } from '../../hooks/useRooms';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import styles from './CreateRoomModal.module.css';

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (room: Room) => void;
}

export function CreateRoomModal({ isOpen, onClose, onCreated }: CreateRoomModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [countryId, setCountryId] = useState<number | null>(null);
  const [stateId, setStateId] = useState<number | null>(null);
  const [isPrivate, setIsPrivate] = useState(false);
  const [maxUsers, setMaxUsers] = useState(100);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { countries } = useCountries();
  const { states } = useStates(countryId ?? undefined);

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setCountryId(value ? Number(value) : null);
    setStateId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const room = await roomsApi.create({
        name,
        description: description || undefined,
        countryId: countryId ?? undefined,
        stateId: stateId ?? undefined,
        isPrivate,
        maxUsers,
      });
      onCreated(room);
      resetForm();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create room');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setCountryId(null);
    setStateId(null);
    setIsPrivate(false);
    setMaxUsers(100);
    setError(null);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Room">
      <form onSubmit={handleSubmit} className={styles.form}>
        {error && <div className={styles.error}>{error}</div>}

        <Input
          label="Room Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          minLength={3}
          maxLength={100}
          required
          placeholder="Enter room name"
        />

        <div className={styles.field}>
          <label className={styles.label}>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={500}
            placeholder="Enter room description (optional)"
            className={styles.textarea}
            rows={3}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Country</label>
          <select
            value={countryId ?? ''}
            onChange={handleCountryChange}
            className={styles.select}
          >
            <option value="">Global (No country)</option>
            {countries.map((country) => (
              <option key={country.id} value={country.id}>
                {country.flagEmoji} {country.name}
              </option>
            ))}
          </select>
        </div>

        {countryId && states.length > 0 && (
          <div className={styles.field}>
            <label className={styles.label}>State/Region</label>
            <select
              value={stateId ?? ''}
              onChange={(e) => setStateId(e.target.value ? Number(e.target.value) : null)}
              className={styles.select}
            >
              <option value="">All regions</option>
              {states.map((state) => (
                <option key={state.id} value={state.id}>
                  {state.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className={styles.field}>
          <label className={styles.label}>Max Users</label>
          <input
            type="number"
            value={maxUsers}
            onChange={(e) => setMaxUsers(Number(e.target.value))}
            min={2}
            max={1000}
            className={styles.input}
          />
        </div>

        <div className={styles.checkbox}>
          <input
            type="checkbox"
            id="isPrivate"
            checked={isPrivate}
            onChange={(e) => setIsPrivate(e.target.checked)}
          />
          <label htmlFor="isPrivate">Private room (invite only)</label>
        </div>

        <div className={styles.actions}>
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            Create Room
          </Button>
        </div>
      </form>
    </Modal>
  );
}
