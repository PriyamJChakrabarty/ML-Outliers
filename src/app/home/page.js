'use client';

import { UserButton, useUser, useClerk } from '@clerk/nextjs';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getAllProblems, getProblemsByModule } from '@/problems/index.js';
import { getCompletions } from '@/lib/completionTracker';
import { migrateLocalStorageToDatabase } from '@/lib/migrateFromLocalStorage';
import styles from './home.module.css';

export default function HomePage() {
  const { user, isLoaded } = useUser();
  const { openUserProfile } = useClerk();
  const [activeTab, setActiveTab] = useState('challenge');
  const [migrationComplete, setMigrationComplete] = useState(false);
  const [registrationNotification, setRegistrationNotification] = useState(null);
  const [syncComplete, setSyncComplete] = useState(false);
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [showChangeUsernameModal, setShowChangeUsernameModal] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [usernameInput, setUsernameInput] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [isSubmittingUsername, setIsSubmittingUsername] = useState(false);
  const [currentUsername, setCurrentUsername] = useState(null);
  const [stats, setStats] = useState({
    exercisesCompleted: 0,
    modulesCompleted: 0,
    totalExercises: 42,
    totalModules: 8
  });
  const [modulesData, setModulesData] = useState([
    {
      id: 1,
      slug: 'LinearRegression',
      name: 'Linear Regression',
      description: 'Master the fundamentals of linear regression and understand when to use it',
      completedExercises: 0,
      totalExercises: 6,
      locked: false
    },
    {
      id: 2,
      slug: 'LogisticRegression',
      name: 'Logistic Regression',
      description: 'Learn classification techniques with logistic regression',
      completedExercises: 0,
      totalExercises: 5,
      locked: true
    },
    {
      id: 3,
      slug: 'DecisionTrees',
      name: 'Decision Trees',
      description: 'Understand tree-based models and their applications',
      completedExercises: 0,
      totalExercises: 7,
      locked: true
    }
  ]);

  // Load completion stats
  useEffect(() => {
    const calculateModuleStats = () => {
      const completions = getCompletions();
      const baseModules = [
        {
          id: 1,
          slug: 'LinearRegression',
          name: 'Linear Regression',
          description: 'Master the fundamentals of linear regression and understand when to use it',
          completedExercises: 0,
          totalExercises: 6,
          locked: false
        },
        {
          id: 2,
          slug: 'LogisticRegression',
          name: 'Logistic Regression',
          description: 'Learn classification techniques with logistic regression',
          completedExercises: 0,
          totalExercises: 5,
          locked: true
        },
        {
          id: 3,
          slug: 'DecisionTrees',
          name: 'Decision Trees',
          description: 'Understand tree-based models and their applications',
          completedExercises: 0,
          totalExercises: 7,
          locked: true
        }
      ];

      return baseModules.map(module => {
        const moduleProblems = getProblemsByModule(module.slug);
        const completedCount = moduleProblems.filter(problem => completions.has(problem.slug)).length;
        return {
          ...module,
          completedExercises: completedCount
        };
      });
    };

    const allProblems = getAllProblems();
    const completions = getCompletions();

    // Update modules data with completion counts
    const updatedModules = calculateModuleStats();
    setModulesData(updatedModules);

    setStats({
      exercisesCompleted: completions.size,
      modulesCompleted: 0, // TODO: Calculate based on module completion
      totalExercises: 42, // Total planned
      totalModules: 8
    });

    // Listen for completion updates
    const handleCompletionUpdate = () => {
      const updatedCompletions = getCompletions();
      const refreshedModules = calculateModuleStats();
      setModulesData(refreshedModules);
      setStats(prev => ({
        ...prev,
        exercisesCompleted: updatedCompletions.size
      }));
    };

    window.addEventListener('completion-updated', handleCompletionUpdate);
    return () => window.removeEventListener('completion-updated', handleCompletionUpdate);
  }, []);

  // Migrate localStorage data to database (one-time operation)
  useEffect(() => {
    async function handleMigration() {
      if (user && !migrationComplete) {
        const result = await migrateLocalStorageToDatabase(user.id);
        setMigrationComplete(true);

        if (result.success && result.migrated && result.migrated > 0) {
          console.log(`Migrated ${result.migrated} completions to database`);
          // Optionally refresh the page to show updated stats from database
          // window.location.reload();
        }
      }
    }

    handleMigration();
  }, [user, migrationComplete]);

  // Sync user to database and show registration notification
  useEffect(() => {
    async function syncUserToDatabase() {
      if (isLoaded && user && !syncComplete) {
        try {
          const response = await fetch('/api/sync-user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({}),
          });
          const data = await response.json();

          if (data.status === 'newly_registered') {
            setSyncComplete(true);
            setCurrentUsername(data.user?.username);
            setRegistrationNotification({
              type: 'success',
              message: `Registration successful! Welcome, ${data.user?.username}!`,
            });
            setTimeout(() => setRegistrationNotification(null), 5000);
          } else if (data.status === 'needs_username') {
            // User needs to set a username - show modal
            setShowUsernameModal(true);
          } else if (data.status === 'already_registered') {
            setSyncComplete(true);
            setCurrentUsername(data.user?.username);
            console.log('User already registered:', data.user?.username);
          } else if (data.status === 'error') {
            setSyncComplete(true);
            setRegistrationNotification({
              type: 'error',
              message: 'Registration failed. Please try refreshing the page.',
            });
            setTimeout(() => setRegistrationNotification(null), 5000);
          }
        } catch (error) {
          console.error('Failed to sync user:', error);
          setSyncComplete(true);
          setRegistrationNotification({
            type: 'error',
            message: 'Could not sync user data. Please refresh.',
          });
          setTimeout(() => setRegistrationNotification(null), 5000);
        }
      }
    }

    syncUserToDatabase();
  }, [isLoaded, user, syncComplete]);

  // Handle username submission
  const handleUsernameSubmit = async (e) => {
    e.preventDefault();

    const trimmedUsername = usernameInput.trim();

    // Validate username
    if (trimmedUsername.length < 3) {
      setUsernameError('Username must be at least 3 characters');
      return;
    }
    if (trimmedUsername.length > 20) {
      setUsernameError('Username must be 20 characters or less');
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(trimmedUsername)) {
      setUsernameError('Username can only contain letters, numbers, and underscores');
      return;
    }

    setIsSubmittingUsername(true);
    setUsernameError('');

    try {
      const response = await fetch('/api/sync-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: trimmedUsername }),
      });
      const data = await response.json();

      if (data.status === 'username_taken') {
        setUsernameError('This username is already taken. Please choose another.');
        setIsSubmittingUsername(false);
        return;
      }

      if (data.status === 'username_set' || data.status === 'newly_registered') {
        setShowUsernameModal(false);
        setSyncComplete(true);
        setCurrentUsername(trimmedUsername);
        setRegistrationNotification({
          type: 'success',
          message: `Registration successful! Welcome, ${trimmedUsername}!`,
        });
        setTimeout(() => setRegistrationNotification(null), 5000);
      }
    } catch (error) {
      console.error('Failed to set username:', error);
      setUsernameError('Failed to set username. Please try again.');
    } finally {
      setIsSubmittingUsername(false);
    }
  };

  // Handle username change (for existing users)
  const handleChangeUsername = async (e) => {
    e.preventDefault();

    const trimmedUsername = usernameInput.trim();

    // Validate username
    if (trimmedUsername.length < 3) {
      setUsernameError('Username must be at least 3 characters');
      return;
    }
    if (trimmedUsername.length > 20) {
      setUsernameError('Username must be 20 characters or less');
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(trimmedUsername)) {
      setUsernameError('Username can only contain letters, numbers, and underscores');
      return;
    }
    if (trimmedUsername === currentUsername) {
      setUsernameError('This is already your current username');
      return;
    }

    setIsSubmittingUsername(true);
    setUsernameError('');

    try {
      const response = await fetch('/api/update-username', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: trimmedUsername }),
      });
      const data = await response.json();

      if (data.status === 'username_taken') {
        setUsernameError('This username is already taken. Please choose another.');
        setIsSubmittingUsername(false);
        return;
      }

      if (data.status === 'success') {
        setShowChangeUsernameModal(false);
        setCurrentUsername(trimmedUsername);
        setUsernameInput('');
        setRegistrationNotification({
          type: 'success',
          message: `Username changed successfully to ${trimmedUsername}!`,
        });
        setTimeout(() => setRegistrationNotification(null), 5000);
      }
    } catch (error) {
      console.error('Failed to change username:', error);
      setUsernameError('Failed to change username. Please try again.');
    } finally {
      setIsSubmittingUsername(false);
    }
  };

  // Open change username modal
  const openChangeUsernameModal = () => {
    setShowSettingsDialog(false);
    setUsernameInput(currentUsername || '');
    setUsernameError('');
    setShowChangeUsernameModal(true);
  };

  // Open Clerk profile for image change
  const openProfileImageChange = () => {
    setShowSettingsDialog(false);
    openUserProfile();
  };

  return (
    <div className={styles.container}>
      {/* Registration Notification Banner */}
      {registrationNotification && (
        <div
          className={`${styles.notificationBanner} ${
            registrationNotification.type === 'success'
              ? styles.notificationSuccess
              : styles.notificationError
          }`}
        >
          <span className={styles.notificationIcon}>
            {registrationNotification.type === 'success' ? '✓' : '!'}
          </span>
          <span className={styles.notificationMessage}>
            {registrationNotification.message}
          </span>
          <button
            className={styles.notificationClose}
            onClick={() => setRegistrationNotification(null)}
          >
            ×
          </button>
        </div>
      )}

      {/* Username Modal (First-time registration) */}
      {showUsernameModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Choose Your Username</h2>
              <p className={styles.modalSubtitle}>
                This will be your unique identity on the leaderboard!
              </p>
            </div>
            <form onSubmit={handleUsernameSubmit} className={styles.modalForm}>
              <div className={styles.inputGroup}>
                <label htmlFor="username" className={styles.inputLabel}>
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  placeholder="Enter a unique username..."
                  className={`${styles.usernameInput} ${usernameError ? styles.inputError : ''}`}
                  autoFocus
                  maxLength={20}
                />
                <p className={styles.inputHint}>
                  3-20 characters, letters, numbers, and underscores only
                </p>
                {usernameError && (
                  <p className={styles.errorMessage}>{usernameError}</p>
                )}
              </div>
              <button
                type="submit"
                className={styles.submitButton}
                disabled={isSubmittingUsername || usernameInput.trim().length < 3}
              >
                {isSubmittingUsername ? 'Setting username...' : 'Continue'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Settings Dialog */}
      {showSettingsDialog && (
        <div className={styles.modalOverlay} onClick={() => setShowSettingsDialog(false)}>
          <div className={styles.settingsDialog} onClick={(e) => e.stopPropagation()}>
            <div className={styles.settingsHeader}>
              <h2 className={styles.settingsTitle}>Profile Settings</h2>
              <button
                className={styles.closeButton}
                onClick={() => setShowSettingsDialog(false)}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <div className={styles.settingsOptions}>
              <button
                className={styles.settingsOption}
                onClick={openProfileImageChange}
              >
                <span className={styles.optionIcon}>📷</span>
                <div className={styles.optionContent}>
                  <span className={styles.optionTitle}>Change Profile Photo</span>
                  <span className={styles.optionDescription}>Update your avatar image</span>
                </div>
                <span className={styles.optionArrow}>→</span>
              </button>
              <button
                className={styles.settingsOption}
                onClick={openChangeUsernameModal}
              >
                <span className={styles.optionIcon}>✍️</span>
                <div className={styles.optionContent}>
                  <span className={styles.optionTitle}>Change Username</span>
                  <span className={styles.optionDescription}>
                    Current: {currentUsername || 'Not set'}
                  </span>
                </div>
                <span className={styles.optionArrow}>→</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Username Modal */}
      {showChangeUsernameModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <button
                className={styles.modalBackButton}
                onClick={() => {
                  setShowChangeUsernameModal(false);
                  setUsernameError('');
                }}
                aria-label="Close"
              >
                ×
              </button>
              <h2 className={styles.modalTitle}>Change Username</h2>
              <p className={styles.modalSubtitle}>
                Choose a new unique username for the leaderboard
              </p>
            </div>
            <form onSubmit={handleChangeUsername} className={styles.modalForm}>
              <div className={styles.inputGroup}>
                <label htmlFor="newUsername" className={styles.inputLabel}>
                  New Username
                </label>
                <input
                  type="text"
                  id="newUsername"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  placeholder="Enter a new username..."
                  className={`${styles.usernameInput} ${usernameError ? styles.inputError : ''}`}
                  autoFocus
                  maxLength={20}
                />
                <p className={styles.inputHint}>
                  3-20 characters, letters, numbers, and underscores only
                </p>
                {usernameError && (
                  <p className={styles.errorMessage}>{usernameError}</p>
                )}
              </div>
              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={() => {
                    setShowChangeUsernameModal(false);
                    setUsernameError('');
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={styles.submitButton}
                  disabled={isSubmittingUsername || usernameInput.trim().length < 3}
                >
                  {isSubmittingUsername ? 'Updating...' : 'Update Username'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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

        {/* Profile Section */}
        <div className={styles.profileSection}>
          {isLoaded && user && (
            <>
              <span className={styles.profileUsername}>
                {currentUsername || user.username || user.firstName || 'User'}
              </span>
              <button
                className={styles.settingsButton}
                onClick={() => setShowSettingsDialog(true)}
                title="Profile Settings"
                aria-label="Profile Settings"
              >
                <span className={styles.settingsIcon}>✏️</span>
              </button>
            </>
          )}
          <UserButton afterSignOutUrl="/" />
        </div>
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
                <h2 className={styles.heroTitle}>
                  {currentUsername ? `Welcome, ${currentUsername}!` : 'Your Learning Journey'}
                </h2>
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
                {modulesData.map((module) => (
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
                      <Link href={`/module/${module.slug}`} className={styles.moduleButton}>
                        {module.completedExercises === 0 ? 'Start Module' : 'Continue'}
                      </Link>
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
