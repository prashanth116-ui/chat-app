import { useState } from 'react';
import { Link } from 'react-router-dom';
import { calculateAge } from '@chat-app/shared';
import { useAuth } from '../hooks/useAuth';
import { useCountries, useStates } from '../hooks/useRooms';
import { GenderIcon } from '../components/user/GenderIcon';
import { UserAvatar } from '../components/user/UserAvatar';
import { EditProfileForm } from '../components/user/EditProfileForm';
import { Button } from '../components/common/Button';
import styles from './Profile.module.css';

export function Profile() {
  const { user, updateUser } = useAuth();
  const { countries } = useCountries();
  const { states } = useStates(user?.countryId ?? undefined);
  const [isEditing, setIsEditing] = useState(false);

  if (!user) {
    return <div className={styles.container}>Loading...</div>;
  }

  const age = calculateAge(user.dateOfBirth);
  const country = countries.find((c) => c.id === user.countryId);
  const state = states.find((s) => s.id === user.stateId);
  const memberSince = new Date(user.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const isGuest = user.email.endsWith('@guest.local');

  if (isEditing) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <h1 className={styles.editTitle}>Edit Profile</h1>
          <EditProfileForm
            user={user}
            onSave={(updatedUser) => {
              updateUser(updatedUser);
              setIsEditing(false);
            }}
            onCancel={() => setIsEditing(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <UserAvatar username={user.username} avatarUrl={user.avatarUrl} size="lg" />
          <div className={styles.headerInfo}>
            <h1 className={styles.username}>
              <GenderIcon gender={user.gender} size="lg" />
              {user.username}
            </h1>
            {isGuest && <span className={styles.guestBadge}>Guest</span>}
          </div>
        </div>

        <div className={styles.details}>
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Personal Info</h2>
            <div className={styles.grid}>
              <div className={styles.field}>
                <span className={styles.label}>Age</span>
                <span className={styles.value}>{age} years old</span>
              </div>
              <div className={styles.field}>
                <span className={styles.label}>Gender</span>
                <span className={styles.value}>
                  {user.gender.charAt(0).toUpperCase() + user.gender.slice(1)}
                </span>
              </div>
              {!isGuest && (
                <div className={styles.field}>
                  <span className={styles.label}>Email</span>
                  <span className={styles.value}>{user.email}</span>
                </div>
              )}
            </div>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Location</h2>
            <div className={styles.grid}>
              <div className={styles.field}>
                <span className={styles.label}>Country</span>
                <span className={styles.value}>
                  {country ? (
                    <>
                      {country.flagEmoji} {country.name}
                    </>
                  ) : (
                    'Not specified'
                  )}
                </span>
              </div>
              {state && (
                <div className={styles.field}>
                  <span className={styles.label}>State/Region</span>
                  <span className={styles.value}>{state.name}</span>
                </div>
              )}
            </div>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Account</h2>
            <div className={styles.grid}>
              <div className={styles.field}>
                <span className={styles.label}>Member Since</span>
                <span className={styles.value}>{memberSince}</span>
              </div>
              <div className={styles.field}>
                <span className={styles.label}>Account Type</span>
                <span className={styles.value}>{isGuest ? 'Guest' : 'Registered'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.actions}>
          <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
          {!isGuest && (
            <Link to="/settings">
              <Button variant="outline">Settings</Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
