import { useState, useRef } from 'react';
import { uploads } from '../../services/api';
import { UserAvatar } from './UserAvatar';
import { Button } from '../common/Button';
import styles from './AvatarUpload.module.css';

interface AvatarUploadProps {
  username: string;
  currentAvatarUrl: string | null;
  onUpload: (url: string) => void;
}

export function AvatarUpload({ username, currentAvatarUrl, onUpload }: AvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload
    setError(null);
    setIsUploading(true);

    try {
      const result = await uploads.uploadAvatar(file);
      onUpload(result.url);
      setPreviewUrl(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.avatarWrapper}>
        <UserAvatar
          username={username}
          avatarUrl={previewUrl || currentAvatarUrl}
          size="lg"
        />
        {isUploading && (
          <div className={styles.uploadingOverlay}>
            <div className={styles.spinner} />
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        onChange={handleFileSelect}
        className={styles.hiddenInput}
        disabled={isUploading}
      />

      <Button
        variant="outline"
        size="sm"
        onClick={() => inputRef.current?.click()}
        disabled={isUploading}
      >
        {isUploading ? 'Uploading...' : 'Change Avatar'}
      </Button>

      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
}
