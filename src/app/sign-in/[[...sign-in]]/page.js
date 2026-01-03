import { SignIn } from '@clerk/nextjs';
import styles from './signin.module.css';

export default function SignInPage() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>Welcome to ML Outliers</h1>
        <p className={styles.subtitle}>Sign in to start your journey</p>
        <SignIn
          appearance={{
            elements: {
              formButtonPrimary: {
                backgroundColor: '#f97316',
                '&:hover': {
                  backgroundColor: '#ea580c'
                }
              }
            }
          }}
        />
      </div>
    </div>
  );
}
