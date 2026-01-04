'use client';

import { use, useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getProblemsByModule } from '@/problems/index.js';
import { getCompletions } from '@/lib/completionTracker';
import styles from './module.module.css';

// Module metadata
const MODULES = {
  'LinearRegression': {
    name: 'Linear Regression',
    description: 'Master the fundamentals of linear regression and understand when to use it',
    icon: '📈',
    totalExercises: 6, // Total planned exercises
  },
  'LogisticRegression': {
    name: 'Logistic Regression',
    description: 'Learn classification techniques with logistic regression',
    icon: '🎯',
    totalExercises: 5,
  },
  'DecisionTrees': {
    name: 'Decision Trees',
    description: 'Understand tree-based models and their applications',
    icon: '🌳',
    totalExercises: 7,
  },
};

export default function ModulePage({ params }) {
  const { id } = use(params);
  const [completedExercises, setCompletedExercises] = useState([]);

  // Get module info
  const moduleInfo = MODULES[id];

  // Get exercises for this module
  const exercises = moduleInfo ? getProblemsByModule(id) : [];

  // Load completions from localStorage
  useEffect(() => {
    const completions = getCompletions();
    const completed = exercises
      .map(ex => ex.slug)
      .filter(slug => completions.has(slug));
    setCompletedExercises(completed);

    // Listen for completion updates
    const handleCompletionUpdate = () => {
      const updatedCompletions = getCompletions();
      const updated = exercises
        .map(ex => ex.slug)
        .filter(slug => updatedCompletions.has(slug));
      setCompletedExercises(updated);
    };

    window.addEventListener('completion-updated', handleCompletionUpdate);
    return () => window.removeEventListener('completion-updated', handleCompletionUpdate);
  }, [exercises]);

  if (!moduleInfo) {
    return (
      <div className={styles.container}>
        <nav className={styles.nav}>
          <Link href="/home" className={styles.backLink}>
            <span className={styles.backArrow}>←</span>
            <span>Back to Home</span>
          </Link>
          <Image src="/logo.png" alt="ML Outliers" width={150} height={30} />
        </nav>

        <main className={styles.main}>
          <div className={styles.errorCard}>
            <h1 className={styles.errorTitle}>Module Not Found</h1>
            <p className={styles.errorText}>
              The module "{id}" doesn't exist.
            </p>
            <Link href="/home" className={styles.homeButton}>
              Go Back Home
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Navigation */}
      <nav className={styles.nav}>
        <Link href="/home" className={styles.backLink}>
          <span className={styles.backArrow}>←</span>
          <span>Back to Home</span>
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
      </nav>

      <main className={styles.main}>
        {/* Module Header */}
        <div className={styles.moduleHeader}>
          <div className={styles.moduleIcon}>{moduleInfo.icon}</div>
          <div className={styles.moduleInfo}>
            <h1 className={styles.moduleTitle}>{moduleInfo.name}</h1>
            <p className={styles.moduleDescription}>{moduleInfo.description}</p>
          </div>
        </div>

        {/* Progress Overview */}
        <div className={styles.progressCard}>
          <div className={styles.progressInfo}>
            <div className={styles.progressStat}>
              <span className={styles.statValue}>{completedExercises.length}</span>
              <span className={styles.statLabel}>Completed</span>
            </div>
            <div className={styles.progressStat}>
              <span className={styles.statValue}>{exercises.length}</span>
              <span className={styles.statLabel}>Available</span>
            </div>
            <div className={styles.progressStat}>
              <span className={styles.statValue}>{moduleInfo.totalExercises}</span>
              <span className={styles.statLabel}>Total</span>
            </div>
          </div>
          <div className={styles.progressBarContainer}>
            <div
              className={styles.progressBar}
              style={{ width: `${(completedExercises.length / moduleInfo.totalExercises) * 100}%` }}
            />
          </div>
        </div>

        {/* Exercises List */}
        <div className={styles.exercisesSection}>
          <h2 className={styles.sectionTitle}>Exercises</h2>

          <div className={styles.exercisesList}>
            {exercises.map((exercise, index) => {
              const isCompleted = completedExercises.includes(exercise.slug);
              const isLocked = index > 0 && !completedExercises.includes(exercises[index - 1].slug);

              return (
                <div
                  key={exercise.slug}
                  className={`${styles.exerciseCard} ${isLocked ? styles.locked : ''} ${isCompleted ? styles.completed : ''}`}
                >
                  <div className={styles.exerciseNumber}>
                    {isCompleted ? (
                      <span className={styles.checkmark}>✓</span>
                    ) : isLocked ? (
                      <span className={styles.lockIcon}>🔒</span>
                    ) : (
                      <span className={styles.number}>{index + 1}</span>
                    )}
                  </div>

                  <div className={styles.exerciseContent}>
                    <div className={styles.exerciseHeader}>
                      <h3 className={styles.exerciseTitle}>
                        {exercise.title}
                      </h3>
                      <span className={`${styles.difficultyBadge} ${styles[exercise.difficulty]}`}>
                        {exercise.difficulty}
                      </span>
                    </div>

                    <p className={styles.exercisePrompt}>
                      {exercise.prompt.heading}
                    </p>

                    <div className={styles.exerciseMeta}>
                      <span className={styles.metaItem}>
                        <span className={styles.metaIcon}>⭐</span>
                        {exercise.scoring.basePoints} points
                      </span>
                      {exercise.scoring.timeBonusPoints > 0 && (
                        <span className={styles.metaItem}>
                          <span className={styles.metaIcon}>⚡</span>
                          +{exercise.scoring.timeBonusPoints} bonus
                        </span>
                      )}
                    </div>
                  </div>

                  <div className={styles.exerciseAction}>
                    {!isLocked ? (
                      <Link href={`/solve/${exercise.slug}`} className={styles.startButton}>
                        {isCompleted ? 'Retry' : 'Start'}
                      </Link>
                    ) : (
                      <div className={styles.lockedMessage}>
                        Complete previous exercise to unlock
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Coming Soon Exercises */}
            {Array.from({ length: moduleInfo.totalExercises - exercises.length }).map((_, index) => (
              <div key={`coming-${index}`} className={`${styles.exerciseCard} ${styles.comingSoon}`}>
                <div className={styles.exerciseNumber}>
                  <span className={styles.number}>{exercises.length + index + 1}</span>
                </div>

                <div className={styles.exerciseContent}>
                  <div className={styles.exerciseHeader}>
                    <h3 className={styles.exerciseTitle}>
                      Coming Soon...
                    </h3>
                  </div>
                  <p className={styles.exercisePrompt}>
                    More exercises are being prepared for this module
                  </p>
                </div>

                <div className={styles.exerciseAction}>
                  <div className={styles.comingSoonBadge}>
                    🚧 In Development
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
