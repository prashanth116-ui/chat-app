import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/common/Button';
import styles from './Home.module.css';

export function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className={styles.container}>
      <div className={styles.hero}>
        <h1 className={styles.title}>Welcome to Chat App</h1>
        <p className={styles.subtitle}>
          Connect with people from around the world in real-time chat rooms
        </p>

        <div className={styles.actions}>
          {isAuthenticated ? (
            <Link to="/rooms">
              <Button size="lg">Browse Rooms</Button>
            </Link>
          ) : (
            <>
              <Link to="/login">
                <Button size="lg">Sign In</Button>
              </Link>
              <Link to="/register">
                <Button variant="outline" size="lg">
                  Create Account
                </Button>
              </Link>
            </>
          )}
        </div>

        <div className={styles.features}>
          <div className={styles.feature}>
            <div className={styles.featureIcon}>🌍</div>
            <h3>Geographic Rooms</h3>
            <p>Join chat rooms organized by country and region</p>
          </div>
          <div className={styles.feature}>
            <div className={styles.featureIcon}>⚡</div>
            <h3>Real-time Chat</h3>
            <p>Instant messaging with typing indicators</p>
          </div>
          <div className={styles.feature}>
            <div className={styles.featureIcon}>📱</div>
            <h3>Works Everywhere</h3>
            <p>Use on desktop, tablet, or mobile</p>
          </div>
        </div>
      </div>
    </div>
  );
}
