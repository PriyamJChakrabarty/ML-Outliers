'use client';

import { use, useState, useEffect } from 'react';
import { UserButton } from '@clerk/nextjs';
import Image from 'next/image';
import Link from 'next/link';
import styles from './profile.module.css';

/**
 * PROFILE PAGE
 *
 * Shows user's stats and profile information
 * Clean, focused view without completed challenges list
 *
 * SCALABILITY: Fetches data via API
 * MODULARITY: Dedicated styles for profile page
 * USER EXPERIENCE: Public profiles for all users
 */

export default function ProfilePage({ params }) {
  const { userId } = use(params);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const response = await fetch(`/api/profile/${userId}`);

        if (response.ok) {
          const data = await response.json();
          setProfile(data);
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [userId]);

  if (loading) {
    return (
      <div className={styles.container}>
        <nav className={styles.nav}>
          <div className={styles.logoSection}>
            <Image src="/logo.png" alt="ML Outliers" width={150} height={30} />
          </div>
          <UserButton afterSignOutUrl="/" />
        </nav>
        <main className={styles.main}>
          <div className={styles.loading}>Loading profile...</div>
        </main>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className={styles.container}>
        <nav className={styles.nav}>
          <Link href="/leaderboard" className={styles.backButton}>
            <span className={styles.backArrow}>←</span>
            <span>Back to Leaderboard</span>
          </Link>
          <div className={styles.logoSection}>
            <Image src="/logo.png" alt="ML Outliers" width={150} height={30} />
          </div>
          <UserButton afterSignOutUrl="/" />
        </nav>
        <main className={styles.main}>
          <div className={styles.errorCard}>
            <h1>User Not Found</h1>
            <p>This user profile does not exist or has been removed.</p>
            <Link href="/leaderboard">Back to Leaderboard</Link>
          </div>
        </main>
      </div>
    );
  }

  const { user, stats } = profile;

  // Calculate badge based on exercises
  const getBadge = (count) => {
    if (count >= 30) return 'Master';
    if (count >= 20) return 'Expert';
    if (count >= 10) return 'Advanced';
    if (count >= 5) return 'Intermediate';
    return 'Beginner';
  };

  return (
    <div className={styles.container}>
      {/* Navigation */}
      <nav className={styles.nav}>
        <Link href="/leaderboard" className={styles.backButton}>
          <span className={styles.backArrow}>←</span>
          <span>Back to Leaderboard</span>
        </Link>
        <div className={styles.logoSection}>
          <Image src="/logo.png" alt="ML Outliers" width={150} height={30} />
        </div>
        <UserButton afterSignOutUrl="/" />
      </nav>

      <main className={styles.main}>
        {/* User Profile Header */}
        <div className={styles.profileHeader}>
          <div className={styles.profileAvatar}>
            {user.avatarUrl ? (
              <Image
                src={user.avatarUrl}
                alt={user.username || 'User'}
                width={100}
                height={100}
                className={styles.avatarImage}
              />
            ) : (
              <div className={styles.avatarPlaceholder}>👤</div>
            )}
          </div>
          <div className={styles.profileInfo}>
            <h1 className={styles.profileName}>
              {user.username || user.fullName || 'Anonymous User'}
            </h1>
            <p className={styles.profileBadge}>{getBadge(stats.exercisesCompleted)}</p>
          </div>
        </div>

        {/* Stats Section */}
        <div className={styles.statsSection}>
          <div className={`${styles.statCard} ${styles.statCardPurple}`}>
            <div className={styles.statIcon}>✨</div>
            <div className={styles.statInfo}>
              <div className={styles.statValue}>{stats.exercisesCompleted}</div>
              <div className={styles.statLabel}>Exercises Mastered</div>
            </div>
          </div>

          <div className={`${styles.statCard} ${styles.statCardOrange}`}>
            <div className={styles.statIcon}>🔥</div>
            <div className={styles.statInfo}>
              <div className={styles.statValue}>{stats.currentStreak}</div>
              <div className={styles.statLabel}>Current Streak</div>
            </div>
          </div>

          <div className={`${styles.statCard} ${styles.statCardGold}`}>
            <div className={styles.statIcon}>🏆</div>
            <div className={styles.statInfo}>
              <div className={styles.statValue}>{stats.totalPoints}</div>
              <div className={styles.statLabel}>Total Points</div>
            </div>
          </div>

          <div className={`${styles.statCard} ${styles.statCardGreen}`}>
            <div className={styles.statIcon}>📈</div>
            <div className={styles.statInfo}>
              <div className={styles.statValue}>{stats.longestStreak}</div>
              <div className={styles.statLabel}>Longest Streak</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
