import { useState, useRef } from 'react';
import type { Attachment } from '@chat-app/shared';
import { uploads } from '../../services/api';
import styles from './FileUpload.module.css';

interface FileUploadProps {
  onUpload: (attachment: Attachment) => void;
  disabled?: boolean;
}

export function FileUpload({ onUpload, disabled }: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setIsUploading(true);

    try {
      const attachment = await uploads.uploadFile(file);
      onUpload(attachment);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  };

  return (
    <div className={styles.container}>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp,application/pdf,text/plain"
        onChange={handleFileSelect}
        className={styles.hiddenInput}
        disabled={disabled || isUploading}
      />

      <button
        type="button"
        className={styles.button}
        onClick={() => inputRef.current?.click()}
        disabled={disabled || isUploading}
        title="Attach file"
      >
        {isUploading ? (
          <div className={styles.spinner} />
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
          </svg>
        )}
      </button>

      {error && <span className={styles.error}>{error}</span>}
    </div>
  );
}
