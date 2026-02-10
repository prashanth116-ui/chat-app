import { useTheme } from '../../context/ThemeContext';
import styles from './ThemeToggle.module.css';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className={styles.toggle}>
      <button
        className={`${styles.option} ${theme === 'light' ? styles.active : ''}`}
        onClick={() => setTheme('light')}
        title="Light mode"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="5" />
          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
        </svg>
      </button>
      <button
        className={`${styles.option} ${theme === 'dark' ? styles.active : ''}`}
        onClick={() => setTheme('dark')}
        title="Dark mode"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
        </svg>
      </button>
      <button
        className={`${styles.option} ${theme === 'system' ? styles.active : ''}`}
        onClick={() => setTheme('system')}
        title="System preference"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
          <path d="M8 21h8M12 17v4" />
        </svg>
      </button>
    </div>
  );
}
