import type { Gender } from '@chat-app/shared';
import styles from './GenderIcon.module.css';

interface GenderIconProps {
  gender: Gender;
  size?: 'sm' | 'md' | 'lg';
}

const ICONS: Record<Gender, string> = {
  male: '\u2642',
  female: '\u2640',
  other: '\u26AA',
};

const COLORS: Record<Gender, string> = {
  male: '#3b82f6',
  female: '#ec4899',
  other: '#8b5cf6',
};

export function GenderIcon({ gender, size = 'md' }: GenderIconProps) {
  return (
    <span
      className={`${styles.icon} ${styles[size]}`}
      style={{ color: COLORS[gender] }}
      title={gender.charAt(0).toUpperCase() + gender.slice(1)}
    >
      {ICONS[gender]}
    </span>
  );
}
