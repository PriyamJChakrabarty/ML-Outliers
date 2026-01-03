'use client';

import { UserButton } from '@clerk/nextjs';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './home.module.css';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState('challenge');

  // Mock data - will be replaced with real data later
  const stats = {
    exercisesCompleted: 0,
    modulesCompleted: 0,
    totalExercises: 42,
    totalModules: 8
  };

  const modules = [
    {
      id: 1,
      name: 'Linear Regression',
      description: 'Master the fundamentals of linear regression and understand when to use it',
      completedExercises: 0,
      totalExercises: 6,
      locked: false
    },
    {
      id: 2,
      name: 'Logistic Regression',
      description: 'Learn classification techniques with logistic regression',
      completedExercises: 0,
      totalExercises: 5,
      locked: true
    },
    {
      id: 3,
      name: 'Decision Trees',
      description: 'Understand tree-based models and their applications',
      completedExercises: 0,
      totalExercises: 7,
      locked: true
    }
  ];

  return (
    <div className={styles.container}>
      <nav className={styles.nav}>
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
        {/* Tabs */}
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'challenge' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('challenge')}
          >
            <span className={styles.tabIcon}>🎯</span>
            Challenge
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'roadmap' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('roadmap')}
          >
            <span className={styles.tabIcon}>🗺️</span>
            Roadmap
          </button>
        </div>

        {/* Challenge Tab Content */}
        {activeTab === 'challenge' && (
          <div className={styles.tabContent}>
            {/* Overall Progress Hero */}
            <div className={styles.progressHero}>
              <Link href="/leaderboard" className={styles.leaderboardIconLink}>
                <div className={styles.leaderboardBadge}>
                  <span className={styles.leaderboardIcon}>🏅</span>
                  <span className={styles.leaderboardText}>Leaderboard</span>
                </div>
              </Link>
              <div className={styles.heroTextContent}>
                <h2 className={styles.heroTitle}>Your Learning Journey</h2>
                <p className={styles.heroSubtitle}>
                  {stats.exercisesCompleted} of {stats.totalExercises} exercises completed
                </p>
                <div className={styles.overallProgressContainer}>
                  <div className={styles.progressInfo}>
                    <span className={styles.progressPercent}>
                      {Math.round((stats.exercisesCompleted / stats.totalExercises) * 100)}%
                    </span>
                    <span className={styles.progressLabel}>Complete</span>
                  </div>
                  <div className={styles.overallProgressBar}>
                    <div
                      className={styles.overallProgressFill}
                      style={{ width: `${(stats.exercisesCompleted / stats.totalExercises) * 100}%` }}
                    >
                      <div className={styles.progressGlow}></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className={styles.heroAnimation}>
                <div className={styles.boyTrackerAnimation}>
                  <Image
                    src="/assets/tracker_animation/Boy-Tracker-1.png"
                    alt="Learning Progress"
                    width={250}
                    height={250}
                    className={`${styles.boyTrackerImage} ${styles.trackerFrame1}`}
                  />
                  <Image
                    src="/assets/tracker_animation/Boy-Tracker-2.png"
                    alt="Learning Progress"
                    width={250}
                    height={250}
                    className={`${styles.boyTrackerImage} ${styles.trackerFrame2}`}
                  />
                  <Image
                    src="/assets/tracker_animation/Boy-Tracker-3.png"
                    alt="Learning Progress"
                    width={250}
                    height={250}
                    className={`${styles.boyTrackerImage} ${styles.trackerFrame3}`}
                  />
                  <Image
                    src="/assets/tracker_animation/Boy-Tracker-4.png"
                    alt="Learning Progress"
                    width={250}
                    height={250}
                    className={`${styles.boyTrackerImage} ${styles.trackerFrame4}`}
                  />
                </div>
              </div>
            </div>

            {/* Gamified Stats */}
            <div className={styles.statsSection}>
              <div className={`${styles.statCard} ${styles.statCardPurple}`}>
                <div className={styles.statBackground}>
                  <div className={styles.statCircle}></div>
                </div>
                <div className={styles.statIcon}>✨</div>
                <div className={styles.statInfo}>
                  <div className={styles.statValue}>{stats.exercisesCompleted}</div>
                  <div className={styles.statLabel}>Exercises Mastered</div>
                  <div className={styles.statProgress}>
                    <div className={styles.miniProgressBar}>
                      <div
                        className={styles.miniProgressFill}
                        style={{ width: `${(stats.exercisesCompleted / stats.totalExercises) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className={`${styles.statCard} ${styles.statCardOrange}`}>
                <div className={styles.statBackground}>
                  <div className={styles.statCircle}></div>
                </div>
                <div className={styles.statIcon}>🎓</div>
                <div className={styles.statInfo}>
                  <div className={styles.statValue}>{stats.modulesCompleted}<span className={styles.statMax}>/{stats.totalModules}</span></div>
                  <div className={styles.statLabel}>Modules Conquered</div>
                  <div className={styles.statProgress}>
                    <div className={styles.miniProgressBar}>
                      <div
                        className={styles.miniProgressFill}
                        style={{ width: `${(stats.modulesCompleted / stats.totalModules) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className={`${styles.statCard} ${styles.statCardGold}`}>
                <div className={styles.statBackground}>
                  <div className={styles.statCircle}></div>
                </div>
                <div className={styles.statBadge}>
                  <div className={styles.badgeGlow}></div>
                  <span className={styles.badgeEmoji}>🏆</span>
                </div>
                <div className={styles.statInfo}>
                  <div className={styles.statValue}>Beginner</div>
                  <div className={styles.statLabel}>Current Rank</div>
                  <div className={styles.nextBadge}>Next: Apprentice (10 exercises)</div>
                </div>
              </div>
            </div>

            {/* Modules Section */}
            <div className={styles.modulesSection}>
              <h2 className={styles.sectionTitle}>Learning Modules</h2>

              <div className={styles.modulesList}>
                {modules.map((module) => (
                  <div
                    key={module.id}
                    className={`${styles.moduleCard} ${module.locked ? styles.moduleCardLocked : ''}`}
                  >
                    <div className={styles.moduleHeader}>
                      <h3 className={styles.moduleName}>
                        {module.locked && <span className={styles.lockIcon}>🔒</span>}
                        {module.name}
                      </h3>
                      <div className={styles.moduleProgress}>
                        {module.completedExercises}/{module.totalExercises}
                      </div>
                    </div>
                    <p className={styles.moduleDescription}>{module.description}</p>

                    {/* Progress Bar */}
                    <div className={styles.progressBarContainer}>
                      <div
                        className={styles.progressBar}
                        style={{ width: `${(module.completedExercises / module.totalExercises) * 100}%` }}
                      ></div>
                    </div>

                    {!module.locked && (
                      <button className={styles.moduleButton}>
                        {module.completedExercises === 0 ? 'Start Module' : 'Continue'}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Roadmap Tab Content */}
        {activeTab === 'roadmap' && (
          <div className={styles.tabContent}>
            <div className={styles.comingSoon}>
              <h2 className={styles.comingSoonTitle}>Roadmap Coming Soon</h2>
              <p className={styles.comingSoonText}>
                We're building a comprehensive ML learning roadmap with curated resources
                and a tickbox-style progression tracker. Stay tuned!
              </p>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
