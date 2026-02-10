import { useState } from 'react';
import type { User, UpdateProfileRequest } from '@chat-app/shared';
import { useCountries, useStates } from '../../hooks/useRooms';
import { users } from '../../services/api';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import styles from './EditProfileForm.module.css';

interface EditProfileFormProps {
  user: User;
  onSave: (user: User) => void;
  onCancel: () => void;
}

export function EditProfileForm({ user, onSave, onCancel }: EditProfileFormProps) {
  const [username, setUsername] = useState(user.username);
  const [countryId, setCountryId] = useState<number | null>(user.countryId);
  const [stateId, setStateId] = useState<number | null>(user.stateId);
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
      const data: UpdateProfileRequest = {};

      if (username !== user.username) {
        data.username = username;
      }
      if (countryId !== user.countryId) {
        data.countryId = countryId ?? undefined;
      }
      if (stateId !== user.stateId) {
        data.stateId = stateId ?? undefined;
      }

      const updatedUser = await users.updateProfile(data);
      onSave(updatedUser);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to update profile');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {error && <div className={styles.error}>{error}</div>}

      <Input
        label="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        minLength={3}
        maxLength={50}
        pattern="^[a-zA-Z0-9_]+$"
        required
      />

      <div className={styles.field}>
        <label className={styles.label}>Country</label>
        <select
          value={countryId ?? ''}
          onChange={handleCountryChange}
          className={styles.select}
        >
          <option value="">Select country</option>
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
            <option value="">Select state/region</option>
            {states.map((state) => (
              <option key={state.id} value={state.id}>
                {state.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className={styles.actions}>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isLoading}>
          Save Changes
        </Button>
      </div>
    </form>
  );
}
