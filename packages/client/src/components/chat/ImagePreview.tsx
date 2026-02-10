import type { Attachment } from '@chat-app/shared';
import styles from './ImagePreview.module.css';

interface ImagePreviewProps {
  attachment: Attachment;
  onClick?: () => void;
}

export function ImagePreview({ attachment, onClick }: ImagePreviewProps) {
  const isImage = attachment.fileType.startsWith('image/');

  if (isImage) {
    return (
      <div className={styles.imageContainer} onClick={onClick}>
        <img src={attachment.url} alt={attachment.fileName} className={styles.image} />
      </div>
    );
  }

  return (
    <a
      href={attachment.url}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.fileLink}
    >
      <div className={styles.fileIcon}>
        {attachment.fileType === 'application/pdf' ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
            <polyline points="14,2 14,8 20,8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10,9 9,9 8,9" />
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
            <polyline points="14,2 14,8 20,8" />
          </svg>
        )}
      </div>
      <div className={styles.fileInfo}>
        <span className={styles.fileName}>{attachment.fileName}</span>
        <span className={styles.fileSize}>{formatFileSize(attachment.fileSize)}</span>
      </div>
    </a>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
