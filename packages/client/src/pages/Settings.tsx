import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { users } from '../services/api';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { ThemeToggle } from '../components/common/ThemeToggle';
import styles from './Settings.module.css';

export function Settings() {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Deletion state
  const [deletionStatus, setDeletionStatus] = useState<{
    isScheduled: boolean;
    scheduledAt: string | null;
  } | null>(null);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const isGuest = user?.email.endsWith('@guest.local');

  useEffect(() => {
    if (!isGuest) {
      users.getDeletionStatus().then(setDeletionStatus).catch(() => {});
    }
  }, [isGuest]);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters');
      return;
    }

    setIsLoading(true);

    try {
      await users.changePassword(currentPassword, newPassword);
      setSuccess('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to change password');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportData = async () => {
    try {
      const data = await users.exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'my-data.json';
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert('Failed to export data');
    }
  };

  const handleRequestDeletion = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeleteError(null);
    setIsDeleting(true);

    try {
      const result = await users.requestDeletion(deletePassword, deleteConfirmation);
      setDeletionStatus({ isScheduled: true, scheduledAt: result.scheduledAt });
      setDeletePassword('');
      setDeleteConfirmation('');
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Failed to request deletion');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDeletion = async () => {
    try {
      await users.cancelDeletion();
      setDeletionStatus({ isScheduled: false, scheduledAt: null });
    } catch {
      alert('Failed to cancel deletion');
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Settings</h1>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Appearance</h2>
        <div className={styles.card}>
          <div className={styles.setting}>
            <div className={styles.settingInfo}>
              <span className={styles.settingLabel}>Theme</span>
              <span className={styles.settingDescription}>
                Choose between light and dark mode
              </span>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </div>

      {!isGuest && (
        <>
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Security</h2>
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Change Password</h3>
              {error && <div className={styles.error}>{error}</div>}
              {success && <div className={styles.success}>{success}</div>}
              <form onSubmit={handleChangePassword} className={styles.form}>
                <Input
                  type="password"
                  label="Current Password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
                <Input
                  type="password"
                  label="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  minLength={8}
                  required
                />
                <Input
                  type="password"
                  label="Confirm New Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  minLength={8}
                  required
                />
                <Button type="submit" isLoading={isLoading}>
                  Change Password
                </Button>
              </form>
            </div>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Data & Privacy</h2>
            <div className={styles.card}>
              <div className={styles.setting}>
                <div className={styles.settingInfo}>
                  <span className={styles.settingLabel}>Export Your Data</span>
                  <span className={styles.settingDescription}>
                    Download a copy of all your data
                  </span>
                </div>
                <Button variant="outline" size="sm" onClick={handleExportData}>
                  Export
                </Button>
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Danger Zone</h2>
            <div className={`${styles.card} ${styles.danger}`}>
              {deletionStatus?.isScheduled ? (
                <div className={styles.deletionScheduled}>
                  <div className={styles.deletionWarning}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                      <line x1="12" y1="9" x2="12" y2="13" />
                      <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                    <div>
                      <p className={styles.deletionTitle}>Account deletion scheduled</p>
                      <p className={styles.deletionDate}>
                        Your account will be permanently deleted on{' '}
                        {new Date(deletionStatus.scheduledAt!).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" onClick={handleCancelDeletion}>
                    Cancel Deletion
                  </Button>
                </div>
              ) : (
                <>
                  <h3 className={styles.cardTitle}>Delete Account</h3>
                  <p className={styles.dangerText}>
                    Once you delete your account, there is no going back. Your account will be
                    scheduled for deletion with a 30-day grace period.
                  </p>
                  {deleteError && <div className={styles.error}>{deleteError}</div>}
                  <form onSubmit={handleRequestDeletion} className={styles.form}>
                    <Input
                      type="password"
                      label="Password"
                      value={deletePassword}
                      onChange={(e) => setDeletePassword(e.target.value)}
                      required
                    />
                    <Input
                      label='Type "DELETE MY ACCOUNT" to confirm'
                      value={deleteConfirmation}
                      onChange={(e) => setDeleteConfirmation(e.target.value)}
                      required
                    />
                    <Button
                      type="submit"
                      variant="outline"
                      isLoading={isDeleting}
                      disabled={deleteConfirmation !== 'DELETE MY ACCOUNT'}
                    >
                      Delete My Account
                    </Button>
                  </form>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
