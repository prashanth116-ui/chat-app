import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Gender } from '@chat-app/shared';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { useAuth } from '../../hooks/useAuth';
import { useCountries, useStates } from '../../hooks/useRooms';
import styles from './AuthForm.module.css';

export function LoginForm() {
  const { login, loginAsGuest } = useAuth();
  const { countries } = useCountries();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGuestLoading, setIsGuestLoading] = useState(false);

  // Guest setup state
  const [showGuestSetup, setShowGuestSetup] = useState(false);
  const [guestGender, setGuestGender] = useState<Gender | ''>('');
  const [guestCountryId, setGuestCountryId] = useState<number | undefined>();
  const [guestStateId, setGuestStateId] = useState<number | undefined>();
  const [guestError, setGuestError] = useState<string | null>(null);

  const { states } = useStates(guestCountryId);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleShowGuestSetup = () => {
    setShowGuestSetup(true);
    setGuestError(null);
  };

  const handleGuestLogin = async (e: FormEvent) => {
    e.preventDefault();
    setGuestError(null);

    if (!guestGender) {
      setGuestError('Please select your gender');
      return;
    }

    if (!guestCountryId) {
      setGuestError('Please select your country');
      return;
    }

    setIsGuestLoading(true);

    try {
      await loginAsGuest({
        gender: guestGender,
        countryId: guestCountryId,
        stateId: guestStateId,
      });
    } catch (err) {
      setGuestError(err instanceof Error ? err.message : 'Guest login failed');
    } finally {
      setIsGuestLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setShowGuestSetup(false);
    setGuestGender('');
    setGuestCountryId(undefined);
    setGuestStateId(undefined);
    setGuestError(null);
  };

  if (showGuestSetup) {
    return (
      <form className={styles.form} onSubmit={handleGuestLogin}>
        <h1 className={styles.title}>Guest Setup</h1>
        <p className={styles.subtitle}>Tell us a bit about yourself</p>

        {guestError && <div className={styles.error}>{guestError}</div>}

        <div className={styles.field}>
          <label htmlFor="guestGender" className={styles.label}>Gender *</label>
          <select
            id="guestGender"
            name="guestGender"
            className={styles.select}
            value={guestGender}
            onChange={(e) => setGuestGender(e.target.value as Gender)}
            required
          >
            <option value="">Select gender</option>
            <option value={Gender.MALE}>Male</option>
            <option value={Gender.FEMALE}>Female</option>
            <option value={Gender.OTHER}>Other</option>
          </select>
        </div>

        <div className={styles.field}>
          <label htmlFor="guestCountry" className={styles.label}>Country *</label>
          <select
            id="guestCountry"
            name="guestCountry"
            className={styles.select}
            value={guestCountryId ?? ''}
            onChange={(e) => {
              const value = e.target.value ? parseInt(e.target.value, 10) : undefined;
              setGuestCountryId(value);
              setGuestStateId(undefined);
            }}
            required
          >
            <option value="">Select country</option>
            {countries.map((country) => (
              <option key={country.id} value={country.id}>
                {country.flagEmoji} {country.name}
              </option>
            ))}
          </select>
        </div>

        {states.length > 0 && (
          <div className={styles.field}>
            <label htmlFor="guestState" className={styles.label}>State/Region</label>
            <select
              id="guestState"
              name="guestState"
              className={styles.select}
              value={guestStateId ?? ''}
              onChange={(e) => {
                const value = e.target.value ? parseInt(e.target.value, 10) : undefined;
                setGuestStateId(value);
              }}
            >
              <option value="">Select state (optional)</option>
              {states.map((state) => (
                <option key={state.id} value={state.id}>
                  {state.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <Button type="submit" isLoading={isGuestLoading} className={styles.submitButton}>
          Continue as Guest
        </Button>

        <Button
          type="button"
          variant="secondary"
          onClick={handleBackToLogin}
          className={styles.submitButton}
        >
          Back to Login
        </Button>
      </form>
    );
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h1 className={styles.title}>Welcome back</h1>
      <p className={styles.subtitle}>Sign in to continue chatting</p>

      {error && <div className={styles.error}>{error}</div>}

      <Input
        type="email"
        name="email"
        label="Email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        autoComplete="email"
      />

      <Input
        type="password"
        name="password"
        label="Password"
        placeholder="Your password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        autoComplete="current-password"
      />

      <Button type="submit" isLoading={isLoading} className={styles.submitButton}>
        Sign In
      </Button>

      <div className={styles.divider}>
        <span>or</span>
      </div>

      <Button
        type="button"
        variant="secondary"
        onClick={handleShowGuestSetup}
        className={styles.submitButton}
      >
        Continue as Guest
      </Button>

      <p className={styles.footer}>
        Don't have an account? <Link to="/register">Sign up</Link>
      </p>
    </form>
  );
}
