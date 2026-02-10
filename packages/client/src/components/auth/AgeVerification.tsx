import { MIN_AGE } from '@chat-app/shared';
import { Button } from '../common/Button';
import styles from './AgeVerification.module.css';

interface AgeVerificationProps {
  onVerified: () => void;
  onDeclined: () => void;
}

export function AgeVerification({ onVerified, onDeclined }: AgeVerificationProps) {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2 className={styles.title}>Age Verification Required</h2>
        <p className={styles.message}>
          This chat application requires users to be at least {MIN_AGE} years old.
        </p>
        <p className={styles.question}>Are you {MIN_AGE} years of age or older?</p>
        <div className={styles.buttons}>
          <Button onClick={onVerified}>
            Yes, I am {MIN_AGE} or older
          </Button>
          <Button variant="outline" onClick={onDeclined}>
            No, I am under {MIN_AGE}
          </Button>
        </div>
      </div>
    </div>
  );
}
