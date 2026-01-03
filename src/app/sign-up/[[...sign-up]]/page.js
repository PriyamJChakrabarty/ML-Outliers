import { SignUp } from '@clerk/nextjs';
import styles from './signup.module.css';

export default function SignUpPage() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>Join ML Outliers</h1>
        <p className={styles.subtitle}>Create your account and start learning</p>
        <SignUp
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
