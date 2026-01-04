'use client';

import { UserButton } from '@clerk/nextjs';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './leaderboard.module.css';

export default function LeaderboardPage() {
  const [timeFilter, setTimeFilter] = useState('all-time');

  // Mock data - will be replaced with real data from Supabase
  const leaderboardData = {
    'all-time': [
      { rank: 1, name: 'Alex Chen', exercises: 42, badge: 'Master', avatar: '👨‍💻', streak: 28, totalPoints: 4200 },
      { rank: 2, name: 'Sarah Kumar', exercises: 38, badge: 'Expert', avatar: '👩‍💻', streak: 21, totalPoints: 3800 },
      { rank: 3, name: 'Jordan Lee', exercises: 35, badge: 'Expert', avatar: '🧑‍💻', streak: 15, totalPoints: 3500 },
      { rank: 4, name: 'Maya Patel', exercises: 31, badge: 'Advanced', avatar: '👩‍🔬', streak: 12, totalPoints: 3100 },
      { rank: 5, name: 'Chris Wang', exercises: 28, badge: 'Advanced', avatar: '👨‍🔬', streak: 10, totalPoints: 2800 },
      { rank: 6, name: 'Emma Wilson', exercises: 25, badge: 'Intermediate', avatar: '👩‍💼', streak: 8, totalPoints: 2500 },
      { rank: 7, name: 'Liam Garcia', exercises: 22, badge: 'Intermediate', avatar: '👨‍🎓', streak: 7, totalPoints: 2200 },
      { rank: 8, name: 'Sophia Martinez', exercises: 19, badge: 'Beginner', avatar: '👩‍🎓', streak: 5, totalPoints: 1900 },
      { rank: 9, name: 'Noah Johnson', exercises: 16, badge: 'Beginner', avatar: '👨‍💻', streak: 4, totalPoints: 1600 },
      { rank: 10, name: 'Olivia Brown', exercises: 13, badge: 'Beginner', avatar: '👩‍💻', streak: 3, totalPoints: 1300 },
    ],
    'monthly': [
      { rank: 1, name: 'Sarah Kumar', exercises: 15, badge: 'Expert', avatar: '👩‍💻', streak: 21, totalPoints: 1500 },
      { rank: 2, name: 'Alex Chen', exercises: 12, badge: 'Master', avatar: '👨‍💻', streak: 28, totalPoints: 1200 },
      { rank: 3, name: 'Jordan Lee', exercises: 10, badge: 'Expert', avatar: '🧑‍💻', streak: 15, totalPoints: 1000 },
    ],
    'weekly': [
      { rank: 1, name: 'Maya Patel', exercises: 7, badge: 'Advanced', avatar: '👩‍🔬', streak: 12, totalPoints: 700 },
      { rank: 2, name: 'Alex Chen', exercises: 5, badge: 'Master', avatar: '👨‍💻', streak: 28, totalPoints: 500 },
      { rank: 3, name: 'Sarah Kumar', exercises: 4, badge: 'Expert', avatar: '👩‍💻', streak: 21, totalPoints: 400 },
    ],
  };

  const currentLeaderboard = leaderboardData[timeFilter];

  return (
    <div className={styles.container}>
      <nav className={styles.nav}>
        <Link href="/home" className={styles.backLink}>
          <span className={styles.backArrow}>←</span>
          <span>Back to Dashboard</span>
        </Link>
        <div className={styles.logoSection}>
          <Image
            src="/logo.png"
            alt="ML Outliers"
            width={150}
            height={30}
            className={styles.navLogo}
          />
        </div>
        <UserButton afterSignOutUrl="/" />
      </nav>

      <main className={styles.main}>
        <div className={styles.header}>
          <h1 className={styles.title}>
            <span className={styles.trophy}>🏆</span>
            Global Leaderboard
          </h1>
          <p className={styles.subtitle}>
            Compete with learners worldwide and climb the ranks
          </p>
        </div>

        {/* Time Filters */}
        <div className={styles.filters}>
          <button
            className={`${styles.filterButton} ${timeFilter === 'all-time' ? styles.filterActive : ''}`}
            onClick={() => setTimeFilter('all-time')}
          >
            All Time
          </button>
          <button
            className={`${styles.filterButton} ${timeFilter === 'monthly' ? styles.filterActive : ''}`}
            onClick={() => setTimeFilter('monthly')}
          >
            This Month
          </button>
          <button
            className={`${styles.filterButton} ${timeFilter === 'weekly' ? styles.filterActive : ''}`}
            onClick={() => setTimeFilter('weekly')}
          >
            This Week
          </button>
        </div>

        {/* Top 3 Podium */}
        {timeFilter === 'all-time' && (
          <div className={styles.podium}>
            {/* 2nd Place */}
            <div className={`${styles.podiumPlace} ${styles.secondPlace}`}>
              <div className={styles.podiumAvatar}>
                {currentLeaderboard[1]?.avatar}
              </div>
              <div className={styles.podiumRank}>
                <span className={styles.medal}>🥈</span>
              </div>
              <div className={styles.podiumName}>{currentLeaderboard[1]?.name}</div>
              <div className={styles.podiumScore}>{currentLeaderboard[1]?.exercises} exercises</div>
              <div className={styles.podiumBadge}>{currentLeaderboard[1]?.badge}</div>
            </div>

            {/* 1st Place */}
            <div className={`${styles.podiumPlace} ${styles.firstPlace}`}>
              <div className={styles.crownContainer}>
                <span className={styles.crown}>👑</span>
              </div>
              <div className={styles.podiumAvatar}>
                {currentLeaderboard[0]?.avatar}
              </div>
              <div className={styles.podiumRank}>
                <span className={styles.medal}>🥇</span>
              </div>
              <div className={styles.podiumName}>{currentLeaderboard[0]?.name}</div>
              <div className={styles.podiumScore}>{currentLeaderboard[0]?.exercises} exercises</div>
              <div className={styles.podiumBadge}>{currentLeaderboard[0]?.badge}</div>
            </div>

            {/* 3rd Place */}
            <div className={`${styles.podiumPlace} ${styles.thirdPlace}`}>
              <div className={styles.podiumAvatar}>
                {currentLeaderboard[2]?.avatar}
              </div>
              <div className={styles.podiumRank}>
                <span className={styles.medal}>🥉</span>
              </div>
              <div className={styles.podiumName}>{currentLeaderboard[2]?.name}</div>
              <div className={styles.podiumScore}>{currentLeaderboard[2]?.exercises} exercises</div>
              <div className={styles.podiumBadge}>{currentLeaderboard[2]?.badge}</div>
            </div>
          </div>
        )}

        {/* Leaderboard Table */}
        <div className={styles.leaderboardSection}>
          <div className={styles.leaderboardList}>
            {currentLeaderboard.map((user) => (
              <div
                key={user.rank}
                className={`${styles.leaderboardItem} ${
                  user.rank === 1 ? styles.firstRank : user.rank === 2 ? styles.secondRank : user.rank === 3 ? styles.thirdRank : ''
                }`}
              >
                <div className={styles.rankColumn}>
                  {user.rank <= 3 ? (
                    <span className={styles.medalIcon}>
                      {user.rank === 1 ? '🥇' : user.rank === 2 ? '🥈' : '🥉'}
                    </span>
                  ) : (
                    <span className={styles.rankNumber}>{user.rank}</span>
                  )}
                </div>

                <div className={styles.userColumn}>
                  <div className={styles.userAvatar}>{user.avatar}</div>
                  <div className={styles.userInfo}>
                    <div className={styles.userName}>{user.name}</div>
                    <div className={styles.userStats}>
                      <span className={styles.statItem}>
                        <span className={styles.statIcon}>✨</span>
                        {user.exercises} exercises
                      </span>
                      <span className={styles.statItem}>
                        <span className={styles.statIcon}>🔥</span>
                        {user.streak} day streak
                      </span>
                    </div>
                  </div>
                </div>

                <div className={styles.scoreColumn}>
                  <div className={styles.totalPoints}>{user.totalPoints.toLocaleString()}</div>
                  <div className={styles.pointsLabel}>points</div>
                </div>

                <div className={styles.badgeColumn}>
                  <div className={styles.userBadge}>{user.badge}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Your Rank Card */}
        <div className={styles.yourRankCard}>
          <div className={styles.yourRankContent}>
            <div className={styles.yourRankIcon}>🎯</div>
            <div className={styles.yourRankInfo}>
              <div className={styles.yourRankLabel}>Your Current Rank</div>
              <div className={styles.yourRankNumber}>Not Yet Ranked</div>
              <div className={styles.yourRankHint}>Complete your first exercise to join the leaderboard!</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
