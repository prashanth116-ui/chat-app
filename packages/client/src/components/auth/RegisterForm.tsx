import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Gender, MIN_AGE, calculateAge } from '@chat-app/shared';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { useAuth } from '../../hooks/useAuth';
import { useCountries, useStates } from '../../hooks/useRooms';
import styles from './AuthForm.module.css';

export function RegisterForm() {
  const { register } = useAuth();
  const { countries } = useCountries();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
    gender: '' as Gender | '',
    dateOfBirth: '',
    countryId: undefined as number | undefined,
    stateId: undefined as number | undefined,
  });
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const { states } = useStates(formData.countryId);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.email) {
      errors.email = 'Email is required';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.username) {
      errors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      errors.username = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      errors.username = 'Username can only contain letters, numbers, and underscores';
    }

    if (!formData.gender) {
      errors.gender = 'Please select your gender';
    }

    if (!formData.dateOfBirth) {
      errors.dateOfBirth = 'Date of birth is required';
    } else {
      const age = calculateAge(formData.dateOfBirth);
      if (age < MIN_AGE) {
        errors.dateOfBirth = `You must be at least ${MIN_AGE} years old to register`;
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      await register({
        email: formData.email,
        password: formData.password,
        username: formData.username,
        gender: formData.gender as Gender,
        dateOfBirth: formData.dateOfBirth,
        countryId: formData.countryId,
        stateId: formData.stateId,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const updateField = (field: string, value: string | number | undefined) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => ({ ...prev, [field]: '' }));
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h1 className={styles.title}>Create an account</h1>
      <p className={styles.subtitle}>Join the conversation</p>

      {error && <div className={styles.error}>{error}</div>}

      <Input
        type="email"
        name="email"
        label="Email"
        placeholder="you@example.com"
        value={formData.email}
        onChange={(e) => updateField('email', e.target.value)}
        error={fieldErrors.email}
        required
        autoComplete="email"
      />

      <Input
        type="text"
        name="username"
        label="Username"
        placeholder="Choose a username"
        value={formData.username}
        onChange={(e) => updateField('username', e.target.value)}
        error={fieldErrors.username}
        required
        autoComplete="username"
      />

      <div className={styles.row}>
        <Input
          type="password"
          name="password"
          label="Password"
          placeholder="At least 8 characters"
          value={formData.password}
          onChange={(e) => updateField('password', e.target.value)}
          error={fieldErrors.password}
          required
          autoComplete="new-password"
        />

        <Input
          type="password"
          name="confirmPassword"
          label="Confirm Password"
          placeholder="Confirm password"
          value={formData.confirmPassword}
          onChange={(e) => updateField('confirmPassword', e.target.value)}
          error={fieldErrors.confirmPassword}
          required
          autoComplete="new-password"
        />
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor="gender" className={styles.label}>Gender</label>
          <select
            id="gender"
            name="gender"
            className={`${styles.select} ${fieldErrors.gender ? styles.selectError : ''}`}
            value={formData.gender}
            onChange={(e) => updateField('gender', e.target.value)}
            required
          >
            <option value="">Select gender</option>
            <option value={Gender.MALE}>Male</option>
            <option value={Gender.FEMALE}>Female</option>
            <option value={Gender.OTHER}>Other</option>
          </select>
          {fieldErrors.gender && <span className={styles.fieldError}>{fieldErrors.gender}</span>}
        </div>

        <Input
          type="date"
          name="dateOfBirth"
          label="Date of Birth"
          value={formData.dateOfBirth}
          onChange={(e) => updateField('dateOfBirth', e.target.value)}
          error={fieldErrors.dateOfBirth}
          required
          max={new Date().toISOString().split('T')[0]}
        />
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor="country" className={styles.label}>Country (optional)</label>
          <select
            id="country"
            name="country"
            className={styles.select}
            value={formData.countryId ?? ''}
            onChange={(e) => {
              const value = e.target.value ? parseInt(e.target.value, 10) : undefined;
              updateField('countryId', value);
              updateField('stateId', undefined);
            }}
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
            <label htmlFor="state" className={styles.label}>State/Region</label>
            <select
              id="state"
              name="state"
              className={styles.select}
              value={formData.stateId ?? ''}
              onChange={(e) => {
                const value = e.target.value ? parseInt(e.target.value, 10) : undefined;
                updateField('stateId', value);
              }}
            >
              <option value="">Select state</option>
              {states.map((state) => (
                <option key={state.id} value={state.id}>
                  {state.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <Button type="submit" isLoading={isLoading} className={styles.submitButton}>
        Create Account
      </Button>

      <p className={styles.footer}>
        Already have an account? <Link to="/login">Sign in</Link>
      </p>

      <p className={styles.ageNotice}>
        You must be at least {MIN_AGE} years old to create an account.
      </p>
    </form>
  );
}
