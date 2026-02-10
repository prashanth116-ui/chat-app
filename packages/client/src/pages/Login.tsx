import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginForm } from '../components/auth/LoginForm';
import { useAuth } from '../hooks/useAuth';
import styles from './AuthPage.module.css';

export function Login() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/rooms');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className={styles.container}>
      <LoginForm />
    </div>
  );
}
