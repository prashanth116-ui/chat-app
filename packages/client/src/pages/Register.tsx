import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RegisterForm } from '../components/auth/RegisterForm';
import { useAuth } from '../hooks/useAuth';
import styles from './AuthPage.module.css';

export function Register() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/rooms');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className={styles.container}>
      <RegisterForm />
    </div>
  );
}
