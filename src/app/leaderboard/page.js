'use client';

import { UserButton } from '@clerk/nextjs';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './leaderboard.module.css';

export default function LeaderboardPage() {
  const [timeFilter, setTimeFilter] = useState('all-time');
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [currentUserRank, setCurrentUserRank] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch leaderboard data from API
  useEffect(() => {
    async function fetchLeaderboard() {
      setLoading(true);
      try {
        const response = await fetch(`/api/leaderboard?filter=${timeFilter}`);
        const data = await response.json();

        // Show ALL users, including those with 0 exercises
        // Users with 0 exercises get a "-" rank indicator
        setLeaderboardData(data.leaderboard);
        setCurrentUserRank(data.currentUserRank);
      } catch (error) {
        console.error('Failed to fetch leaderboard:', error);
        setLeaderboardData([]);
      } finally {
        setLoading(false);
      }
    }

    fetchLeaderboard();
  }, [timeFilter]);

  // Use real data from database - NO MOCK DATA
  const currentLeaderboard = leaderboardData;

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
        {timeFilter === 'all-time' && !loading && currentLeaderboard.length >= 3 && (
          <div className={styles.podium}>
            {/* 2nd Place */}
            <div className={`${styles.podiumPlace} ${styles.secondPlace}`}>
              <div className={styles.podiumAvatar}>
                {currentLeaderboard[1]?.avatarUrl ? (
                  <Image src={currentLeaderboard[1].avatarUrl} alt={currentLeaderboard[1]?.username || 'User'} width={60} height={60} style={{ borderRadius: '50%' }} />
                ) : (
                  '👤'
                )}
              </div>
              <div className={styles.podiumRank}>
                <span className={styles.medal}>🥈</span>
              </div>
              <div className={styles.podiumName}>{currentLeaderboard[1]?.username || currentLeaderboard[1]?.fullName || 'Anonymous'}</div>
              <div className={styles.podiumScore}>{currentLeaderboard[1]?.exercisesCompleted || 0} exercises</div>
              <div className={styles.podiumBadge}>Expert</div>
            </div>

            {/* 1st Place */}
            <div className={`${styles.podiumPlace} ${styles.firstPlace}`}>
              <div className={styles.crownContainer}>
                <span className={styles.crown}>👑</span>
              </div>
              <div className={styles.podiumAvatar}>
                {currentLeaderboard[0]?.avatarUrl ? (
                  <Image src={currentLeaderboard[0].avatarUrl} alt={currentLeaderboard[0]?.username || 'User'} width={80} height={80} style={{ borderRadius: '50%' }} />
                ) : (
                  '👤'
                )}
              </div>
              <div className={styles.podiumRank}>
                <span className={styles.medal}>🥇</span>
              </div>
              <div className={styles.podiumName}>{currentLeaderboard[0]?.username || currentLeaderboard[0]?.fullName || 'Anonymous'}</div>
              <div className={styles.podiumScore}>{currentLeaderboard[0]?.exercisesCompleted || 0} exercises</div>
              <div className={styles.podiumBadge}>Master</div>
            </div>

            {/* 3rd Place */}
            <div className={`${styles.podiumPlace} ${styles.thirdPlace}`}>
              <div className={styles.podiumAvatar}>
                {currentLeaderboard[2]?.avatarUrl ? (
                  <Image src={currentLeaderboard[2].avatarUrl} alt={currentLeaderboard[2]?.username || 'User'} width={60} height={60} style={{ borderRadius: '50%' }} />
                ) : (
                  '👤'
                )}
              </div>
              <div className={styles.podiumRank}>
                <span className={styles.medal}>🥉</span>
              </div>
              <div className={styles.podiumName}>{currentLeaderboard[2]?.username || currentLeaderboard[2]?.fullName || 'Anonymous'}</div>
              <div className={styles.podiumScore}>{currentLeaderboard[2]?.exercisesCompleted || 0} exercises</div>
              <div className={styles.podiumBadge}>Expert</div>
            </div>
          </div>
        )}

        {/* Leaderboard Table */}
        <div className={styles.leaderboardSection}>
          {loading ? (
            <div className={styles.loading}>Loading leaderboard...</div>
          ) : currentLeaderboard.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>🎯</div>
              <h3 className={styles.emptyTitle}>No Rankings Yet</h3>
              <p className={styles.emptyText}>
                Be the first to complete a challenge and claim the top spot!
              </p>
              <Link href="/home" className={styles.emptyButton}>
                Start Solving Challenges
              </Link>
            </div>
          ) : (
            <div className={styles.leaderboardList}>
              {currentLeaderboard.map((user) => {
                const exercisesCount = user.exercisesCompleted || user.exercisesCompletedThisMonth || user.exercisesCompletedThisWeek || user.exercises || 0;
                const points = user.totalPoints || user.pointsThisMonth || user.pointsThisWeek || 0;
                const displayName = user.username || user.fullName || user.name || 'Anonymous';
                const hasNoExercises = exercisesCount === 0;

                return (
                  <Link
                    key={user.userId || user.rank}
                    href={user.userId ? `/profile/${user.userId}` : '#'}
                    className={`${styles.leaderboardItem} ${
                      hasNoExercises ? styles.unranked : user.rank === 1 ? styles.firstRank : user.rank === 2 ? styles.secondRank : user.rank === 3 ? styles.thirdRank : ''
                    }`}
                  >
                    <div className={styles.rankColumn}>
                      {hasNoExercises ? (
                        <span className={styles.rankNumber} style={{ color: '#6b7280' }}>-</span>
                      ) : user.rank <= 3 ? (
                        <span className={styles.medalIcon}>
                          {user.rank === 1 ? '🥇' : user.rank === 2 ? '🥈' : '🥉'}
                        </span>
                      ) : (
                        <span className={styles.rankNumber}>{user.rank}</span>
                      )}
                    </div>

                    <div className={styles.userColumn}>
                      <div className={styles.userAvatar}>
                        {user.avatarUrl ? (
                          <Image src={user.avatarUrl} alt={displayName} width={40} height={40} style={{ borderRadius: '50%' }} />
                        ) : (
                          '👤'
                        )}
                      </div>
                      <div className={styles.userInfo}>
                        <div className={styles.userName}>{displayName}</div>
                        <div className={styles.userStats}>
                          <span className={styles.statItem}>
                            <span className={styles.statIcon}>✨</span>
                            {exercisesCount} exercises
                          </span>
                          <span className={styles.statItem}>
                            <span className={styles.statIcon}>🔥</span>
                            {user.currentStreak || user.streak || 0} day streak
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className={styles.scoreColumn}>
                      <div className={styles.totalPoints}>{points.toLocaleString()}</div>
                      <div className={styles.pointsLabel}>points</div>
                    </div>

                    <div className={styles.badgeColumn}>
                      <div className={styles.userBadge}>{user.badge || (exercisesCount > 30 ? 'Master' : exercisesCount > 20 ? 'Expert' : exercisesCount > 10 ? 'Advanced' : 'Beginner')}</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Your Rank Card */}
        <div className={styles.yourRankCard}>
          <div className={styles.yourRankContent}>
            <div className={styles.yourRankIcon}>🎯</div>
            <div className={styles.yourRankInfo}>
              <div className={styles.yourRankLabel}>Your Current Rank</div>
              {currentUserRank ? (
                currentUserRank.exercisesCompleted > 0 ? (
                  <>
                    <div className={styles.yourRankNumber}>#{currentUserRank.rank}</div>
                    <div className={styles.yourRankHint}>
                      {currentUserRank.exercisesCompleted} exercises completed | {currentUserRank.totalPoints || 0} points
                    </div>
                  </>
                ) : (
                  <>
                    <div className={styles.yourRankNumber}>-</div>
                    <div className={styles.yourRankHint}>
                      0 problems solved - Complete your first exercise to get ranked!
                    </div>
                  </>
                )
              ) : (
                <>
                  <div className={styles.yourRankNumber}>Not Registered</div>
                  <div className={styles.yourRankHint}>Sign in to track your progress!</div>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
