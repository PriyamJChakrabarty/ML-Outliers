'use client';

import { UserButton, useUser, useClerk } from '@clerk/nextjs';
import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getAllProblems, getProblemsByModule } from '@/problems/index.js';
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
  const [usernameJustChanged, setUsernameJustChanged] = useState(false);
  const [usernameUpdatedAt, setUsernameUpdatedAt] = useState(null);
  const [usernameCooldownMessage, setUsernameCooldownMessage] = useState(null);

  // Structured username fallback state
  const [showStructuredFallback, setShowStructuredFallback] = useState(false);
  const [showChangeStructuredFallback, setShowChangeStructuredFallback] = useState(false);
  const [structuredPrefix, setStructuredPrefix] = useState('IIT');
  const [structuredYear, setStructuredYear] = useState(2024);
  const [structuredNumber, setStructuredNumber] = useState(1);

  const [stats, setStats] = useState({
    exercisesCompleted: 0,
    modulesCompleted: 0,
    totalExercises: 6,
    totalModules: 1,
    totalPoints: 0
  });

  // Roadmap state
  const [roadmapLanguage, setRoadmapLanguage] = useState('english'); // 'english' | 'hindi' - default to english
  const [roadmapCompletions, setRoadmapCompletions] = useState({});
  const [expandedSections, setExpandedSections] = useState({
    ml: true, // Traditional Machine Learning dropdown
    dl: false, // Deep Learning dropdown
  });
  const [roadmapLoading, setRoadmapLoading] = useState(true);

  // Roadmap content data - Machine Learning
  const mlRoadmapContent = {
    english: {
      playlistUrl: 'https://youtube.com/playlist?list=PLZoTAELRMXVPBTrWtJkn3wWQxZkmTXGwe&si=iMTx4HEj7lgMS5PI',
      topics: [
        { id: 'en-ml-basics', title: 'Basics (ML & Python Intro and Environment Setup)', videos: '1 - 6' },
        { id: 'en-ml-numpy-pandas', title: 'NumPy, Pandas, Seaborn, Matplotlib', videos: '7 - 13' },
        { id: 'en-ml-python', title: 'More on Python', videos: '16 - 28' },
        { id: 'en-ml-eda', title: 'EDA', videos: '14, 29 - 33' },
        { id: 'en-ml-linear-reg', title: 'Linear Regression, Ridge & Lasso', videos: '34 - 40' },
        { id: 'en-ml-feature-sel', title: 'Feature Selection', videos: '41 - 45' },
        { id: 'en-ml-logistic-reg', title: 'Logistic Regression', videos: '46 - 49' },
        { id: 'en-ml-decision-tree', title: 'Decision Tree', videos: '50 - 53' },
        { id: 'en-ml-adv-eda', title: 'Advanced EDA & Feature Engineering', videos: '54 - 58' },
        { id: 'en-ml-metrics', title: 'Important Performance Metrics', videos: '59 - 60' },
        { id: 'en-ml-knn', title: 'KNN', videos: '61 - 62' },
        { id: 'en-ml-ensemble', title: 'Ensemble Learning & Random Forest', videos: '63 - 66' },
        { id: 'en-ml-boosting', title: 'Boosting Techniques', videos: '67 - 68' },
        { id: 'en-ml-clustering', title: 'Clustering Techniques', videos: '70 - 74' },
        { id: 'en-ml-dim-red', title: 'Dimensionality Reduction', videos: '75 - 77' },
        { id: 'en-ml-cross-val', title: 'Cross Validation & Optimal Threshold', videos: '78 - 79' },
        { id: 'en-ml-naive-bayes', title: 'Naive Bayes', videos: '80 - 82' },
        { id: 'en-ml-svm', title: 'SVM', videos: '83 - 86' },
        { id: 'en-ml-grad-boost', title: 'More about Gradient Boosting', videos: '87 - 88' },
        { id: 'en-ml-xgboost', title: 'Xgboost', videos: '89 - 90' },
      ],
      completionNote: 'You have covered up the core ML concepts, you can continue the playlist to learn the nitty gritties of ML Techniques and Model Training!'
    },
    hindi: {
      playlistUrl: 'https://youtube.com/playlist?list=PLKnIA16_Rmvbr7zKYQuBfsVkjoLcJgxHH&si=7gZKmeITReFQEF1U',
      topics: [
        { id: 'hi-ml-basics', title: 'Basics', videos: '1 - 10' },
        { id: 'hi-ml-setup', title: 'Setup', videos: '11 - 18' },
        { id: 'hi-ml-data-analysis', title: 'Data Analysis', videos: '19 - 22' },
        { id: 'hi-ml-feature-eng', title: 'Feature Engineering & Transformation', videos: '23 - 32' },
        { id: 'hi-ml-handling-data', title: 'Handling Data', videos: '33 - 45' },
        { id: 'hi-ml-dim-red', title: 'Dimensionality Reduction & PCA', videos: '46 - 49' },
        { id: 'hi-ml-linear-reg', title: 'Linear Regression', videos: '50 - 61' },
        { id: 'hi-ml-ridge-lasso', title: 'Ridge & Lasso Regression', videos: '62 - 68' },
        { id: 'hi-ml-logistic-reg', title: 'Logistic Regression', videos: '69 - 79' },
        { id: 'hi-ml-decision-tree', title: 'Decision Trees', videos: '80 - 83' },
        { id: 'hi-ml-ensemble', title: 'Ensemble Learning', videos: '84 - 90' },
        { id: 'hi-ml-random-forest', title: 'Random Forest', videos: '91 - 97' },
        { id: 'hi-ml-boosting', title: 'Boosting Algorithms', videos: '98 - 102' },
        { id: 'hi-ml-kmeans', title: 'K Means Clustering', videos: '103 - 105, 110' },
        { id: 'hi-ml-more-boosting', title: 'More Boosting Algo', videos: '106 - 109, 127 - 130' },
        { id: 'hi-ml-knn', title: 'KNN', videos: '111' },
        { id: 'hi-ml-svm', title: 'SVM', videos: '113 - 117' },
        { id: 'hi-ml-naive-bayes', title: 'Naive Bayes', videos: '118 - 126' },
        { id: 'hi-ml-misc', title: 'Miscellaneous', videos: '131 - 134' },
      ],
      completionNote: ''
    }
  };

  // Roadmap content data - Deep Learning
  const dlRoadmapContent = {
    english: {
      playlistUrl: 'https://youtube.com/playlist?list=PLZoTAELRMXVPGU70ZGsckrMdr0FteeRUi&si=32delBv3jh6FrP26',
      topics: [
        { id: 'en-dl-intro', title: 'Introduction', videos: '1 - 3' },
        { id: 'en-dl-nn-basics', title: 'Neural Network Basics', videos: '4 - 18' },
        { id: 'en-dl-optimizers', title: 'Optimizers', videos: '19 - 21' },
        { id: 'en-dl-loss-hyper', title: 'Loss Function & Hyperparameter Tuning', videos: '22 - 26' },
        { id: 'en-dl-cnn', title: 'CNN', videos: '27 - 35' },
        { id: 'en-dl-rnn', title: 'RNN', videos: '36 - 40' },
        { id: 'en-dl-lstm', title: 'LSTM', videos: '41 - 46' },
        { id: 'en-dl-more-rnn', title: 'More on RNN', videos: '47 - 50' },
        { id: 'en-dl-encoder-decoder', title: 'Encoder Decoder Architecture', videos: '51 - 54' },
        { id: 'en-dl-transformers', title: 'Transformers', videos: '55 - 60' },
        { id: 'en-dl-cost-sensitive', title: 'Cost Sensitive Neural Network', videos: '63' },
        { id: 'en-dl-object-detection', title: 'Object Localization vs Detection & Segmentation', videos: '67, 70, 80 - 82' },
        { id: 'en-dl-audio', title: 'Audio Task', videos: '71 - 75' },
        { id: 'en-dl-text-gen', title: 'Text Generation', videos: '79' },
      ],
      completionNote: 'Some videos have not been mentioned as this roadmap covers only the most fundamental concepts. Be sure to watch the rest of the videos for in depth exploration!'
    },
    hindi: {
      playlistUrl: 'https://youtube.com/playlist?list=PLKnIA16_RmvYuZauWaPlRTC54KxSNLtNn&si=wbrWv_opEAv1NElv',
      topics: [
        { id: 'hi-dl-intro', title: 'Introduction', videos: '1 - 3' },
        { id: 'hi-dl-nn-part1', title: 'Neural Network Part I', videos: '4 - 14' },
        { id: 'hi-dl-nn-part2', title: 'Neural Network Part II', videos: '15 - 31' },
        { id: 'hi-dl-optimizers', title: 'Optimizers', videos: '32 - 39' },
        { id: 'hi-dl-cnn', title: 'CNN', videos: '40 - 52' },
        { id: 'hi-dl-transfer', title: 'Transfer Learning', videos: '53 - 54' },
        { id: 'hi-dl-rnn', title: 'RNN', videos: '55 - 60' },
        { id: 'hi-dl-lstm', title: 'LSTM', videos: '61 - 63' },
        { id: 'hi-dl-more-rnn', title: 'More on RNN', videos: '64 - 66' },
        { id: 'hi-dl-encoder-attention', title: 'Introduction to Encoder - Decoder & Attention', videos: '67 - 70' },
        { id: 'hi-dl-transformers', title: 'Transformers', videos: '71 - 82' },
      ],
      completionNote: ''
    }
  };

  // Load roadmap completions and language from database
  useEffect(() => {
    async function fetchRoadmapProgress() {
      setRoadmapLoading(true);
      try {
        const response = await fetch('/api/roadmap-progress');
        const data = await response.json();
        if (data.status === 'success' && data.completions) {
          setRoadmapCompletions(data.completions);
        }
        if (data.language) {
          setRoadmapLanguage(data.language);
        }
      } catch (error) {
        console.error('Failed to fetch roadmap progress:', error);
        // Fallback to localStorage
        const savedCompletions = localStorage.getItem('roadmapCompletions');
        const savedLanguage = localStorage.getItem('roadmapLanguage');
        if (savedCompletions) {
          setRoadmapCompletions(JSON.parse(savedCompletions));
        }
        if (savedLanguage) {
          setRoadmapLanguage(savedLanguage);
        }
      } finally {
        setRoadmapLoading(false);
      }
    }

    if (isLoaded && user) {
      fetchRoadmapProgress();
    } else {
      // Not logged in - use localStorage
      const savedCompletions = localStorage.getItem('roadmapCompletions');
      const savedLanguage = localStorage.getItem('roadmapLanguage');
      if (savedCompletions) {
        setRoadmapCompletions(JSON.parse(savedCompletions));
      }
      if (savedLanguage) {
        setRoadmapLanguage(savedLanguage);
      }
      setRoadmapLoading(false);
    }
  }, [isLoaded, user]);

  // Save roadmap completions to database (debounced)
  const saveRoadmapProgress = useCallback(async (completions, language) => {
    if (!user) {
      // Save to localStorage for non-logged in users
      localStorage.setItem('roadmapCompletions', JSON.stringify(completions));
      localStorage.setItem('roadmapLanguage', language);
      return;
    }

    try {
      await fetch('/api/roadmap-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completions, language }),
      });
    } catch (error) {
      console.error('Failed to save roadmap progress:', error);
      // Fallback to localStorage
      localStorage.setItem('roadmapCompletions', JSON.stringify(completions));
      localStorage.setItem('roadmapLanguage', language);
    }
  }, [user]);

  // Toggle topic completion
  const toggleTopicCompletion = (topicId) => {
    const newCompletions = {
      ...roadmapCompletions,
      [topicId]: !roadmapCompletions[topicId]
    };
    setRoadmapCompletions(newCompletions);
    saveRoadmapProgress(newCompletions, roadmapLanguage);
  };

  // Toggle section expansion
  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  // Handle language change and save
  const handleLanguageChange = (lang) => {
    setRoadmapLanguage(lang);
    saveRoadmapProgress(roadmapCompletions, lang);
  };

  // Calculate ML roadmap stats for selected language
  const getMLRoadmapStats = () => {
    if (!roadmapLanguage) return { completed: 0, total: 0 };
    const topics = mlRoadmapContent[roadmapLanguage]?.topics || [];
    const total = topics.length;
    const completed = topics.filter(t => roadmapCompletions[t.id]).length;
    return { completed, total };
  };

  // Calculate DL roadmap stats for selected language
  const getDLRoadmapStats = () => {
    if (!roadmapLanguage) return { completed: 0, total: 0 };
    const topics = dlRoadmapContent[roadmapLanguage]?.topics || [];
    const total = topics.length;
    const completed = topics.filter(t => roadmapCompletions[t.id]).length;
    return { completed, total };
  };

  // Calculate overall roadmap stats
  const getOverallRoadmapStats = () => {
    const ml = getMLRoadmapStats();
    const dl = getDLRoadmapStats();
    return {
      completed: ml.completed + dl.completed,
      total: ml.total + dl.total
    };
  };
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [modulesData, setModulesData] = useState([
    {
      id: 1,
      slug: 'LinearRegression',
      name: 'Linear Regression',
      description: 'Master the fundamentals of linear regression and understand when to use it',
      completedExercises: 0,
      totalExercises: 6,
      locked: false,
      comingSoon: false
    },
    {
      id: 2,
      slug: 'LogisticRegression',
      name: 'Logistic Regression',
      description: 'Learn classification techniques with logistic regression',
      completedExercises: 0,
      totalExercises: 5,
      locked: true,
      comingSoon: true
    },
    {
      id: 3,
      slug: 'DecisionTrees',
      name: 'Decision Trees',
      description: 'Understand tree-based models and their applications',
      completedExercises: 0,
      totalExercises: 7,
      locked: true,
      comingSoon: true
    }
  ]);

  // Function to calculate module stats from completions
  const calculateModuleStats = useCallback((completedSlugs) => {
    const completionsSet = new Set(completedSlugs);
    const baseModules = [
      {
        id: 1,
        slug: 'LinearRegression',
        name: 'Linear Regression',
        description: 'Master the fundamentals of linear regression and understand when to use it',
        completedExercises: 0,
        totalExercises: 6,
        locked: false,
        comingSoon: false
      },
      {
        id: 2,
        slug: 'LogisticRegression',
        name: 'Logistic Regression',
        description: 'Learn classification techniques with logistic regression',
        completedExercises: 0,
        totalExercises: 5,
        locked: true,
        comingSoon: true
      },
      {
        id: 3,
        slug: 'DecisionTrees',
        name: 'Decision Trees',
        description: 'Understand tree-based models and their applications',
        completedExercises: 0,
        totalExercises: 7,
        locked: true,
        comingSoon: true
      }
    ];

    return baseModules.map(module => {
      const moduleProblems = getProblemsByModule(module.slug);
      const completedCount = moduleProblems.filter(problem => completionsSet.has(problem.slug)).length;
      return {
        ...module,
        completedExercises: completedCount
      };
    });
  }, []);

  // Fetch completions from database
  const fetchCompletions = useCallback(async () => {
    setIsLoadingData(true);
    try {
      const response = await fetch('/api/user-completions');
      const data = await response.json();

      if (data.status === 'success') {
        const completedSlugs = data.completedSlugs || [];
        const updatedModules = calculateModuleStats(completedSlugs);
        setModulesData(updatedModules);
        // Calculate if module is completed (all 6 exercises done)
        const modulesCompleted = (data.exercisesCompleted || 0) >= 6 ? 1 : 0;
        setStats({
          exercisesCompleted: data.exercisesCompleted || 0,
          modulesCompleted: modulesCompleted,
          totalExercises: 6,
          totalModules: 1,
          totalPoints: data.totalPoints || 0
        });
      }
    } catch (error) {
      console.error('Failed to fetch completions:', error);
    } finally {
      setIsLoadingData(false);
    }
  }, [calculateModuleStats]);

  // Load completion stats from database
  useEffect(() => {
    if (isLoaded && user) {
      fetchCompletions();
    }

    const handleCompletionUpdate = () => {
      fetchCompletions();
    };

    window.addEventListener('completion-updated', handleCompletionUpdate);
    return () => window.removeEventListener('completion-updated', handleCompletionUpdate);
  }, [isLoaded, user, fetchCompletions]);

  // Migrate localStorage data to database
  useEffect(() => {
    async function handleMigration() {
      if (user && !migrationComplete) {
        try {
          const migrated = await migrateLocalStorageToDatabase();
          if (migrated) {
            console.log('Migration completed successfully');
            fetchCompletions();
          }
          setMigrationComplete(true);
        } catch (error) {
          console.error('Migration failed:', error);
          setMigrationComplete(true);
        }
      }
    }

    handleMigration();
  }, [user, migrationComplete, fetchCompletions]);

  // Sync user to database
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
            // User needs to set a username - show modal directly
            setShowUsernameModal(true);
          } else if (data.status === 'already_registered') {
            setSyncComplete(true);
            setCurrentUsername(data.user?.username);
            setUsernameUpdatedAt(data.user?.usernameUpdatedAt);
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

  // =============================================
  // HANDLE USERNAME SUBMIT (New User)
  // =============================================
  const handleUsernameSubmit = async (e) => {
    e.preventDefault();

    const trimmedUsername = usernameInput.trim();

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
      // Check for profanity via Gemini API
      console.log('[Username Submit] Checking profanity for:', trimmedUsername);
      const checkResponse = await fetch('/api/check-username', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: trimmedUsername }),
      });

      let checkData;
      try {
        checkData = await checkResponse.json();
        console.log('[Username Submit] Profanity check result:', checkData);
      } catch (parseError) {
        // JSON parse failed - API crisis, show fallback
        console.log('[Username Submit] Failed to parse response, showing IIT fallback');
        setShowStructuredFallback(true);
        setUsernameError('');
        setIsSubmittingUsername(false);
        return;
      }

      // If user has exceeded obscene attempts (3+), force fallback
      if (checkData.status === 'force_fallback') {
        console.log('[Username Submit] Force fallback - too many obscene attempts');
        setShowStructuredFallback(true);
        setUsernameError('Too many inappropriate username attempts. Please use the ID format.');
        setIsSubmittingUsername(false);
        return;
      }

      // If username is obscene, show error with remaining attempts info
      if (checkData.status === 'obscene') {
        const remainingAttempts = checkData.remainingAttempts;
        if (remainingAttempts !== undefined && remainingAttempts > 0) {
          setUsernameError(`Please choose a different username (${remainingAttempts} attempt${remainingAttempts === 1 ? '' : 's'} remaining)`);
        } else {
          setUsernameError('Please choose a different username');
        }
        setIsSubmittingUsername(false);
        return;
      }

      // If API crisis (failed, exhausted, server error), show IIT fallback
      if (checkData.status === 'fallback_required' || checkData.status === 'error' || !checkResponse.ok) {
        console.log('[Username Submit] API crisis, showing IIT fallback');
        setShowStructuredFallback(true);
        setUsernameError('');
        setIsSubmittingUsername(false);
        return;
      }

      // Username passed profanity check, now save it
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

      if (data.status === 'invalid_username') {
        setUsernameError(data.message || 'Please choose another username');
        setIsSubmittingUsername(false);
        return;
      }

      if (data.status === 'username_set' || data.status === 'newly_registered') {
        setShowUsernameModal(false);
        setShowStructuredFallback(false);
        setSyncComplete(true);
        setCurrentUsername(trimmedUsername);
        setUsernameJustChanged(true);
        setTimeout(() => setUsernameJustChanged(false), 5000);
        setRegistrationNotification({
          type: 'success',
          message: `Registration successful! Welcome, ${trimmedUsername}!`,
        });
        setTimeout(() => setRegistrationNotification(null), 5000);
      }
    } catch (error) {
      // On any error, fall back to IIT format
      console.error('Failed to check username, falling back to structured format:', error);
      setShowStructuredFallback(true);
      setUsernameError('');
    } finally {
      setIsSubmittingUsername(false);
    }
  };

  // =============================================
  // HANDLE STRUCTURED USERNAME SUBMIT (IIT Format)
  // =============================================
  const handleStructuredUsernameSubmit = async (e) => {
    e.preventDefault();
    setIsSubmittingUsername(true);
    setUsernameError('');

    try {
      const checkResponse = await fetch('/api/check-username', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isStructured: true,
          prefix: structuredPrefix,
          year: structuredYear,
          number: structuredNumber,
        }),
      });
      const checkData = await checkResponse.json();

      if (checkData.status === 'invalid') {
        setUsernameError(checkData.message);
        setIsSubmittingUsername(false);
        return;
      }

      const structuredUsername = checkData.username;

      const response = await fetch('/api/sync-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: structuredUsername }),
      });
      const data = await response.json();

      if (data.status === 'username_taken') {
        setUsernameError('This username is already taken. Try a different number.');
        setIsSubmittingUsername(false);
        return;
      }

      if (data.status === 'username_set' || data.status === 'newly_registered') {
        setShowUsernameModal(false);
        setShowStructuredFallback(false);
        setSyncComplete(true);
        setCurrentUsername(structuredUsername);
        setUsernameJustChanged(true);
        setTimeout(() => setUsernameJustChanged(false), 5000);
        setRegistrationNotification({
          type: 'success',
          message: `Registration successful! Welcome, ${structuredUsername}!`,
        });
        setTimeout(() => setRegistrationNotification(null), 5000);
      }
    } catch (error) {
      console.error('Failed to set structured username:', error);
      setUsernameError('Failed to set username. Please try again.');
    } finally {
      setIsSubmittingUsername(false);
    }
  };

  // =============================================
  // HANDLE USERNAME CHANGE (Existing User)
  // =============================================
  const handleChangeUsername = async (e) => {
    e.preventDefault();

    const trimmedUsername = usernameInput.trim();

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
      // Check for profanity via Gemini API
      console.log('[Username Change] Checking profanity for:', trimmedUsername);
      const checkResponse = await fetch('/api/check-username', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: trimmedUsername }),
      });

      let checkData;
      try {
        checkData = await checkResponse.json();
        console.log('[Username Change] Profanity check result:', checkData);
      } catch (parseError) {
        // JSON parse failed - API crisis, show fallback
        console.log('[Username Change] Failed to parse response, showing IIT fallback');
        setShowChangeStructuredFallback(true);
        setUsernameError('');
        setIsSubmittingUsername(false);
        return;
      }

      // If user has exceeded obscene attempts (3+), force fallback
      if (checkData.status === 'force_fallback') {
        console.log('[Username Change] Force fallback - too many obscene attempts');
        setShowChangeStructuredFallback(true);
        setUsernameError('Too many inappropriate username attempts. Please use the ID format.');
        setIsSubmittingUsername(false);
        return;
      }

      // If username is obscene, show error with remaining attempts info
      if (checkData.status === 'obscene') {
        const remainingAttempts = checkData.remainingAttempts;
        if (remainingAttempts !== undefined && remainingAttempts > 0) {
          setUsernameError(`Please choose a different username (${remainingAttempts} attempt${remainingAttempts === 1 ? '' : 's'} remaining)`);
        } else {
          setUsernameError('Please choose a different username');
        }
        setIsSubmittingUsername(false);
        return;
      }

      // If API crisis (failed, exhausted, server error), show IIT fallback
      if (checkData.status === 'fallback_required' || checkData.status === 'error' || !checkResponse.ok) {
        console.log('[Username Change] API crisis, showing IIT fallback');
        setShowChangeStructuredFallback(true);
        setUsernameError('');
        setIsSubmittingUsername(false);
        return;
      }

      // Username passed profanity check, now update it
      console.log('[Username Change] Updating username...');
      const response = await fetch('/api/update-username', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: trimmedUsername }),
      });
      const data = await response.json();
      console.log('[Username Change] Update result:', data);

      if (data.status === 'cooldown_active') {
        setUsernameError(data.message);
        setUsernameCooldownMessage({
          remainingDays: data.remainingDays,
          nextChangeDate: data.nextChangeDate,
        });
        setIsSubmittingUsername(false);
        return;
      }

      if (data.status === 'username_taken') {
        setUsernameError('This username is already taken. Please choose another.');
        setIsSubmittingUsername(false);
        return;
      }

      if (data.status === 'invalid_username') {
        setUsernameError(data.message || 'Please choose another username');
        setIsSubmittingUsername(false);
        return;
      }

      if (data.status === 'success') {
        setShowChangeUsernameModal(false);
        setCurrentUsername(trimmedUsername);
        setUsernameUpdatedAt(new Date().toISOString());
        setUsernameInput('');
        setUsernameJustChanged(true);
        setTimeout(() => setUsernameJustChanged(false), 5000);
        setRegistrationNotification({
          type: 'success',
          message: `Username changed successfully to ${trimmedUsername}!`,
        });
        setTimeout(() => setRegistrationNotification(null), 5000);
      }
    } catch (error) {
      // On any error, fall back to IIT format
      console.error('Failed to change username, falling back to structured format:', error);
      setShowChangeStructuredFallback(true);
      setUsernameError('');
    } finally {
      setIsSubmittingUsername(false);
    }
  };

  // =============================================
  // HANDLE STRUCTURED USERNAME CHANGE (IIT Format)
  // =============================================
  const handleStructuredUsernameChange = async (e) => {
    e.preventDefault();
    setIsSubmittingUsername(true);
    setUsernameError('');

    try {
      const checkResponse = await fetch('/api/check-username', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isStructured: true,
          prefix: structuredPrefix,
          year: structuredYear,
          number: structuredNumber,
        }),
      });
      const checkData = await checkResponse.json();

      if (checkData.status === 'invalid') {
        setUsernameError(checkData.message);
        setIsSubmittingUsername(false);
        return;
      }

      const structuredUsername = checkData.username;

      // Update username via update-username API
      const response = await fetch('/api/update-username', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: structuredUsername }),
      });
      const data = await response.json();

      if (data.status === 'cooldown_active') {
        setUsernameError(data.message);
        setUsernameCooldownMessage({
          remainingDays: data.remainingDays,
          nextChangeDate: data.nextChangeDate,
        });
        setIsSubmittingUsername(false);
        return;
      }

      if (data.status === 'username_taken') {
        setUsernameError('This username is already taken. Try a different number.');
        setIsSubmittingUsername(false);
        return;
      }

      if (data.status === 'success') {
        setShowChangeUsernameModal(false);
        setShowChangeStructuredFallback(false);
        setCurrentUsername(structuredUsername);
        setUsernameUpdatedAt(new Date().toISOString());
        setUsernameInput('');
        setUsernameJustChanged(true);
        setTimeout(() => setUsernameJustChanged(false), 5000);
        setRegistrationNotification({
          type: 'success',
          message: `Username changed successfully to ${structuredUsername}!`,
        });
        setTimeout(() => setRegistrationNotification(null), 5000);
      }
    } catch (error) {
      console.error('Failed to change structured username:', error);
      setUsernameError('Failed to change username. Please try again.');
    } finally {
      setIsSubmittingUsername(false);
    }
  };

  // Calculate if username change is on cooldown
  const getNextUsernameChangeDate = () => {
    if (!usernameUpdatedAt) return null;
    const updatedDate = new Date(usernameUpdatedAt);
    const nextChangeDate = new Date(updatedDate.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days
    return nextChangeDate;
  };

  const isUsernameCooldownActive = () => {
    const nextDate = getNextUsernameChangeDate();
    if (!nextDate) return false;
    return nextDate > new Date();
  };

  const getRemainingCooldownDays = () => {
    const nextDate = getNextUsernameChangeDate();
    if (!nextDate) return 0;
    const remaining = nextDate.getTime() - Date.now();
    return Math.ceil(remaining / (24 * 60 * 60 * 1000));
  };

  // Open change username modal directly
  const openChangeUsernameModal = () => {
    setShowSettingsDialog(false);
    setUsernameInput(currentUsername || '');
    setUsernameError('');
    setUsernameCooldownMessage(null);
    setShowChangeStructuredFallback(false);
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

      {/* ==================== USERNAME MODAL (New User) ==================== */}
      {showUsernameModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {showStructuredFallback ? 'Create Your ID' : 'Choose Your Username'}
              </h2>
              <p className={styles.modalSubtitle}>
                {showStructuredFallback
                  ? 'Use your institute ID format'
                  : 'This will be your unique identity on the leaderboard!'}
              </p>
            </div>

            {!showStructuredFallback ? (
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
            ) : (
              <form onSubmit={handleStructuredUsernameSubmit} className={styles.modalForm}>
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Institute</label>
                  <select
                    value={structuredPrefix}
                    onChange={(e) => setStructuredPrefix(e.target.value)}
                    className={styles.usernameInput}
                  >
                    <option value="IIT">IIT</option>
                    <option value="IIB">IIB</option>
                    <option value="IEC">IEC</option>
                  </select>
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Year</label>
                  <select
                    value={structuredYear}
                    onChange={(e) => setStructuredYear(parseInt(e.target.value))}
                    className={styles.usernameInput}
                  >
                    <option value={2023}>2023</option>
                    <option value={2024}>2024</option>
                    <option value={2025}>2025</option>
                  </select>
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Roll Number (1-500)</label>
                  <input
                    type="number"
                    min={1}
                    max={500}
                    value={structuredNumber}
                    onChange={(e) => setStructuredNumber(parseInt(e.target.value) || 1)}
                    className={styles.usernameInput}
                  />
                </div>

                <p className={styles.inputHint}>
                  Your username will be: <strong>{structuredPrefix}{structuredYear}{String(structuredNumber).padStart(3, '0')}</strong>
                </p>

                {usernameError && (
                  <p className={styles.errorMessage}>{usernameError}</p>
                )}

                <button
                  type="submit"
                  className={styles.submitButton}
                  disabled={isSubmittingUsername}
                >
                  {isSubmittingUsername ? 'Setting username...' : 'Continue'}
                </button>

                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={() => setShowStructuredFallback(false)}
                  style={{ marginTop: '10px' }}
                >
                  Back to custom username
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ==================== SETTINGS DIALOG ==================== */}
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
                disabled={isUsernameCooldownActive()}
                style={isUsernameCooldownActive() ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
              >
                <span className={styles.optionIcon}>✍️</span>
                <div className={styles.optionContent}>
                  <span className={styles.optionTitle}>Change Username</span>
                  <span className={styles.optionDescription}>
                    Current: {currentUsername || 'Not set'}
                    {usernameJustChanged && (
                      <span style={{
                        marginLeft: '8px',
                        color: '#10b981',
                        fontWeight: 'bold',
                        fontSize: '11px',
                        background: '#d1fae5',
                        padding: '2px 6px',
                        borderRadius: '4px'
                      }}>
                        ✓ changed
                      </span>
                    )}
                    {isUsernameCooldownActive() && (
                      <span style={{
                        display: 'block',
                        marginTop: '4px',
                        color: '#f97316',
                        fontWeight: '500',
                        fontSize: '11px'
                      }}>
                        Available in {getRemainingCooldownDays()} day{getRemainingCooldownDays() === 1 ? '' : 's'}
                      </span>
                    )}
                  </span>
                </div>
                {!isUsernameCooldownActive() && <span className={styles.optionArrow}>→</span>}
                {isUsernameCooldownActive() && <span style={{ color: '#f97316', fontSize: '1rem' }}>🔒</span>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== CHANGE USERNAME MODAL ==================== */}
      {showChangeUsernameModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <button
                className={styles.modalBackButton}
                onClick={() => {
                  setShowChangeUsernameModal(false);
                  setShowChangeStructuredFallback(false);
                  setUsernameError('');
                }}
                aria-label="Close"
              >
                ×
              </button>
              <h2 className={styles.modalTitle}>
                {showChangeStructuredFallback ? 'Change to ID Format' : 'Change Username'}
              </h2>
              <p className={styles.modalSubtitle}>
                {showChangeStructuredFallback
                  ? 'Use your institute ID format'
                  : `Current: ${currentUsername}`}
                {!showChangeStructuredFallback && usernameJustChanged && (
                  <span style={{
                    marginLeft: '8px',
                    color: '#10b981',
                    fontWeight: 'bold',
                    fontSize: '12px',
                    background: '#d1fae5',
                    padding: '2px 8px',
                    borderRadius: '4px'
                  }}>
                    ✓ changed
                  </span>
                )}
              </p>
            </div>

            {!showChangeStructuredFallback ? (
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
            ) : (
              <form onSubmit={handleStructuredUsernameChange} className={styles.modalForm}>
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Institute</label>
                  <select
                    value={structuredPrefix}
                    onChange={(e) => setStructuredPrefix(e.target.value)}
                    className={styles.usernameInput}
                  >
                    <option value="IIT">IIT</option>
                    <option value="IIB">IIB</option>
                    <option value="IEC">IEC</option>
                  </select>
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Year</label>
                  <select
                    value={structuredYear}
                    onChange={(e) => setStructuredYear(parseInt(e.target.value))}
                    className={styles.usernameInput}
                  >
                    <option value={2023}>2023</option>
                    <option value={2024}>2024</option>
                    <option value={2025}>2025</option>
                  </select>
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Roll Number (1-500)</label>
                  <input
                    type="number"
                    min={1}
                    max={500}
                    value={structuredNumber}
                    onChange={(e) => setStructuredNumber(parseInt(e.target.value) || 1)}
                    className={styles.usernameInput}
                  />
                </div>

                <p className={styles.inputHint}>
                  Your new username will be: <strong>{structuredPrefix}{structuredYear}{String(structuredNumber).padStart(3, '0')}</strong>
                </p>

                {usernameError && (
                  <p className={styles.errorMessage}>{usernameError}</p>
                )}

                <div className={styles.modalActions}>
                  <button
                    type="button"
                    className={styles.cancelButton}
                    onClick={() => setShowChangeStructuredFallback(false)}
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className={styles.submitButton}
                    disabled={isSubmittingUsername}
                  >
                    {isSubmittingUsername ? 'Updating...' : 'Update Username'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ==================== NAVIGATION ==================== */}
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
                {usernameJustChanged && (
                  <span style={{
                    marginLeft: '6px',
                    color: '#10b981',
                    fontWeight: 'bold',
                    fontSize: '10px',
                    background: '#d1fae5',
                    padding: '2px 5px',
                    borderRadius: '4px'
                  }}>
                    ✓
                  </span>
                )}
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

      {/* ==================== MAIN CONTENT ==================== */}
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
            {isLoadingData ? (
              <div className={styles.loadingContainer}>
                <div className={styles.loadingSpinner}></div>
                <p className={styles.loadingText}>
                  Loading your progress
                  <span className={styles.loadingDots}>
                    <span className={styles.loadingDot}></span>
                    <span className={styles.loadingDot}></span>
                    <span className={styles.loadingDot}></span>
                  </span>
                </p>
              </div>
            ) : (
            <>
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
                  {usernameJustChanged && (
                    <span style={{
                      marginLeft: '12px',
                      color: '#10b981',
                      fontWeight: 'bold',
                      fontSize: '14px',
                      background: '#d1fae5',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      verticalAlign: 'middle'
                    }}>
                      ✓ changed
                    </span>
                  )}
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

            {/* Gamified Stats Section */}
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
                  <div className={styles.statValue}>{stats.totalPoints}</div>
                  <div className={styles.statLabel}>Total Points</div>
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
                    className={`${styles.moduleCard} ${module.locked ? styles.moduleCardLocked : ''} ${module.comingSoon ? styles.moduleCardComingSoon : ''}`}
                  >
                    <div className={styles.moduleHeader}>
                      <h3 className={styles.moduleName}>
                        {module.comingSoon && <span className={styles.comingSoonIcon}>🚧</span>}
                        {module.name}
                      </h3>
                      {module.comingSoon ? (
                        <div className={styles.comingSoonBadge}>Coming Soon</div>
                      ) : (
                        <div className={styles.moduleProgress}>
                          {module.completedExercises}/{module.totalExercises}
                        </div>
                      )}
                    </div>
                    <p className={styles.moduleDescription}>{module.description}</p>

                    {/* Progress Bar */}
                    {!module.comingSoon && (
                      <div className={styles.progressBarContainer}>
                        <div
                          className={styles.progressBar}
                          style={{ width: `${(module.completedExercises / module.totalExercises) * 100}%` }}
                        ></div>
                      </div>
                    )}

                    {!module.locked && !module.comingSoon && (
                      <Link href={`/module/${module.slug}`} className={styles.moduleButton}>
                        {module.completedExercises === 0 ? 'Start Module' : 'Continue'}
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </div>
            </>
            )}
          </div>
        )}

        {/* Roadmap Tab Content */}
        {activeTab === 'roadmap' && (
          <div className={styles.tabContent}>
            {/* Hero Section - Intro Text (Left) + Animation (Right) */}
            <div className={styles.roadmapHero}>
              <div className={styles.roadmapHeroLeft}>
                <div className={styles.roadmapIntroText}>
                  <p>
                    The overall roadmap goes as follows - Initially you must learn the basics of python language followed by the important libraries of <strong>NumPy</strong>, <strong>Pandas</strong>, <strong>Matplotlib</strong>, <strong>Seaborn</strong>.
                  </p>
                  <p>
                    NumPy and Pandas handle the data cleaning and preprocessing, Matplotlib and Seaborn are the standard tools for visualisation.
                  </p>
                  <p>
                    Then we can move on to traditional ML Algorithms in sequence - <strong>Linear Regression</strong>, <strong>Logistic Regression</strong>, <strong>Naive Bayes</strong>, <strong>SVM</strong>, <strong>Decision Trees</strong>, Ensemble Models like <strong>Random Forest</strong> & <strong>XGBoost</strong>.
                  </p>
                  <p>
                    Then we can move on to Deep Learning & Neural Networks concepts like <strong>Perceptron & ANN</strong>, <strong>CNN</strong>, <strong>RNN</strong>, <strong>LSTM</strong>, <strong>GRU</strong>, <strong>Transformers</strong> etc.
                  </p>
                  <p className={styles.roadmapHighlight}>
                    This prepares a strong foundation for you to explore the amazing world of AI/ML with projects!
                  </p>
                </div>
              </div>
              <div className={styles.roadmapHeroRight}>
                <div className={styles.roadmapAnimationLarge}>
                  <Image
                    src="/assets/Roadmap/Intro/1.png?v=2"
                    alt="Roadmap Animation"
                    width={500}
                    height={500}
                    className={`${styles.roadmapAnimImage} ${styles.roadmapFrame1}`}
                    unoptimized
                  />
                  <Image
                    src="/assets/Roadmap/Intro/2.png?v=2"
                    alt="Roadmap Animation"
                    width={500}
                    height={500}
                    className={`${styles.roadmapAnimImage} ${styles.roadmapFrame2}`}
                    unoptimized
                  />
                  <Image
                    src="/assets/Roadmap/Intro/3.png?v=2"
                    alt="Roadmap Animation"
                    width={500}
                    height={500}
                    className={`${styles.roadmapAnimImage} ${styles.roadmapFrame3}`}
                    unoptimized
                  />
                  <Image
                    src="/assets/Roadmap/Intro/4.png?v=2"
                    alt="Roadmap Animation"
                    width={500}
                    height={500}
                    className={`${styles.roadmapAnimImage} ${styles.roadmapFrame4}`}
                    unoptimized
                  />
                  <Image
                    src="/assets/Roadmap/Intro/5.png?v=2"
                    alt="Roadmap Animation"
                    width={500}
                    height={500}
                    className={`${styles.roadmapAnimImage} ${styles.roadmapFrame5}`}
                    unoptimized
                  />
                  <Image
                    src="/assets/Roadmap/Intro/6.png?v=2"
                    alt="Roadmap Animation"
                    width={500}
                    height={500}
                    className={`${styles.roadmapAnimImage} ${styles.roadmapFrame6}`}
                    unoptimized
                  />
                  <Image
                    src="/assets/Roadmap/Intro/7.png?v=2"
                    alt="Roadmap Animation"
                    width={500}
                    height={500}
                    className={`${styles.roadmapAnimImage} ${styles.roadmapFrame7}`}
                    unoptimized
                  />
                  <Image
                    src="/assets/Roadmap/Intro/8.png?v=2"
                    alt="Roadmap Animation"
                    width={500}
                    height={500}
                    className={`${styles.roadmapAnimImage} ${styles.roadmapFrame8}`}
                    unoptimized
                  />
                </div>
              </div>
            </div>

            {/* Stats Section - Separate Progress Bars for ML and DL */}
            <div className={styles.roadmapStatsCompact}>
              {/* ML Progress */}
              <div className={styles.roadmapStatsCardMerged}>
                <div className={styles.roadmapStatsHeader}>
                  <div className={styles.roadmapStatsLeft}>
                    <Image
                      src="/assets/Roadmap/emoji/ML.png"
                      alt="ML"
                      width={48}
                      height={48}
                      className={styles.roadmapStatsIconImage}
                    />
                    <div className={styles.roadmapStatsInfo}>
                      <div className={styles.roadmapStatsValue}>
                        {getMLRoadmapStats().completed}<span className={styles.roadmapStatsMax}>/{getMLRoadmapStats().total}</span>
                      </div>
                      <div className={styles.roadmapStatsLabel}>Machine Learning</div>
                    </div>
                  </div>
                  <div className={styles.roadmapStatsRight}>
                    <div className={styles.roadmapStatsPercent}>
                      {getMLRoadmapStats().total > 0 ? Math.round((getMLRoadmapStats().completed / getMLRoadmapStats().total) * 100) : 0}%
                    </div>
                  </div>
                </div>
                <div className={styles.roadmapProgressBarLarge}>
                  <div
                    className={styles.roadmapProgressBarFill}
                    style={{ width: `${getMLRoadmapStats().total > 0 ? (getMLRoadmapStats().completed / getMLRoadmapStats().total) * 100 : 0}%` }}
                  >
                    <div className={styles.progressGlow}></div>
                  </div>
                </div>
              </div>

              {/* DL Progress */}
              <div className={`${styles.roadmapStatsCardMerged} ${styles.dlProgressCard}`}>
                <div className={styles.roadmapStatsHeader}>
                  <div className={styles.roadmapStatsLeft}>
                    <Image
                      src="/assets/Roadmap/emoji/DL.png"
                      alt="DL"
                      width={48}
                      height={48}
                      className={styles.roadmapStatsIconImage}
                    />
                    <div className={styles.roadmapStatsInfo}>
                      <div className={styles.roadmapStatsValue}>
                        {getDLRoadmapStats().completed}<span className={styles.roadmapStatsMax}>/{getDLRoadmapStats().total}</span>
                      </div>
                      <div className={styles.roadmapStatsLabel}>Deep Learning</div>
                    </div>
                  </div>
                  <div className={styles.roadmapStatsRight}>
                    <div className={`${styles.roadmapStatsPercent} ${styles.dlPercent}`}>
                      {getDLRoadmapStats().total > 0 ? Math.round((getDLRoadmapStats().completed / getDLRoadmapStats().total) * 100) : 0}%
                    </div>
                  </div>
                </div>
                <div className={styles.roadmapProgressBarLarge}>
                  <div
                    className={`${styles.roadmapProgressBarFill} ${styles.dlProgressFill}`}
                    style={{ width: `${getDLRoadmapStats().total > 0 ? (getDLRoadmapStats().completed / getDLRoadmapStats().total) * 100 : 0}%` }}
                  >
                    <div className={styles.progressGlow}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Language Toggle Buttons */}
            <div className={styles.languageToggleSection}>
              <div className={styles.languageToggleButtons}>
                <button
                  className={`${styles.languageToggleBtn} ${roadmapLanguage === 'english' ? styles.languageActive : ''}`}
                  onClick={() => handleLanguageChange('english')}
                >
                  <span className={styles.languageFlag}>🇬🇧</span>
                  <span>English</span>
                </button>
                <button
                  className={`${styles.languageToggleBtn} ${roadmapLanguage === 'hindi' ? styles.languageActive : ''}`}
                  onClick={() => handleLanguageChange('hindi')}
                >
                  <span className={styles.languageFlag}>🇮🇳</span>
                  <span>Hindi</span>
                </button>
              </div>
            </div>

            {/* Roadmap Content - Dropdowns */}
            <div className={styles.roadmapContent}>
              {/* Traditional Machine Learning Dropdown */}
              <div className={styles.roadmapDropdown}>
                <button
                  className={`${styles.roadmapDropdownHeader} ${expandedSections.ml ? styles.expanded : ''}`}
                  onClick={() => toggleSection('ml')}
                >
                  <div className={styles.dropdownHeaderLeft}>
                    <span className={styles.dropdownIcon}>{expandedSections.ml ? '▼' : '▶'}</span>
                    <span className={styles.dropdownTitle}>Traditional Machine Learning</span>
                  </div>
                  <div className={styles.dropdownHeaderRight}>
                    <span className={styles.dropdownProgress}>
                      {getMLRoadmapStats().completed}/{getMLRoadmapStats().total}
                    </span>
                    <a
                      href={mlRoadmapContent[roadmapLanguage]?.playlistUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.playlistLink}
                      onClick={(e) => e.stopPropagation()}
                    >
                      📺 Playlist
                    </a>
                  </div>
                </button>

                {expandedSections.ml && (
                  <div className={styles.roadmapDropdownContent}>
                    <div className={styles.playlistUrlDisplay}>
                      <span className={styles.playlistUrlLabel}>Playlist URL:</span>
                      <a
                        href={mlRoadmapContent[roadmapLanguage]?.playlistUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.playlistUrlLink}
                      >
                        {mlRoadmapContent[roadmapLanguage]?.playlistUrl}
                      </a>
                    </div>
                    {mlRoadmapContent[roadmapLanguage]?.topics.map((topic, index) => (
                      <div key={topic.id} className={styles.topicItem}>
                        <button
                          className={`${styles.topicCheckbox} ${roadmapCompletions[topic.id] ? styles.checked : ''}`}
                          onClick={() => toggleTopicCompletion(topic.id)}
                          aria-label={roadmapCompletions[topic.id] ? 'Mark as incomplete' : 'Mark as complete'}
                        >
                          {roadmapCompletions[topic.id] ? '✓' : ''}
                        </button>
                        <div className={styles.topicInfo}>
                          <span className={`${styles.topicTitle} ${roadmapCompletions[topic.id] ? styles.completed : ''}`}>
                            {index + 1}. {topic.title}
                          </span>
                          <span className={styles.topicVideos}>Videos: {topic.videos}</span>
                        </div>
                      </div>
                    ))}

                    {mlRoadmapContent[roadmapLanguage]?.completionNote && (
                      <div className={styles.completionNote}>
                        {mlRoadmapContent[roadmapLanguage].completionNote}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Deep Learning Dropdown */}
              <div className={`${styles.roadmapDropdown} ${styles.dlDropdown}`}>
                <button
                  className={`${styles.roadmapDropdownHeader} ${styles.dlHeader} ${expandedSections.dl ? styles.expanded : ''}`}
                  onClick={() => toggleSection('dl')}
                >
                  <div className={styles.dropdownHeaderLeft}>
                    <span className={styles.dropdownIcon}>{expandedSections.dl ? '▼' : '▶'}</span>
                    <span className={styles.dropdownTitle}>Deep Learning</span>
                  </div>
                  <div className={styles.dropdownHeaderRight}>
                    <span className={`${styles.dropdownProgress} ${styles.dlProgress}`}>
                      {getDLRoadmapStats().completed}/{getDLRoadmapStats().total}
                    </span>
                    <a
                      href={dlRoadmapContent[roadmapLanguage]?.playlistUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${styles.playlistLink} ${styles.dlPlaylistLink}`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      📺 Playlist
                    </a>
                  </div>
                </button>

                {expandedSections.dl && (
                  <div className={styles.roadmapDropdownContent}>
                    <div className={styles.playlistUrlDisplay}>
                      <span className={styles.playlistUrlLabel}>Playlist URL:</span>
                      <a
                        href={dlRoadmapContent[roadmapLanguage]?.playlistUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.playlistUrlLink}
                      >
                        {dlRoadmapContent[roadmapLanguage]?.playlistUrl}
                      </a>
                    </div>
                    {dlRoadmapContent[roadmapLanguage]?.topics.map((topic, index) => (
                      <div key={topic.id} className={styles.topicItem}>
                        <button
                          className={`${styles.topicCheckbox} ${roadmapCompletions[topic.id] ? styles.checked : ''}`}
                          onClick={() => toggleTopicCompletion(topic.id)}
                          aria-label={roadmapCompletions[topic.id] ? 'Mark as incomplete' : 'Mark as complete'}
                        >
                          {roadmapCompletions[topic.id] ? '✓' : ''}
                        </button>
                        <div className={styles.topicInfo}>
                          <span className={`${styles.topicTitle} ${roadmapCompletions[topic.id] ? styles.completed : ''}`}>
                            {index + 1}. {topic.title}
                          </span>
                          <span className={styles.topicVideos}>Videos: {topic.videos}</span>
                        </div>
                      </div>
                    ))}

                    {dlRoadmapContent[roadmapLanguage]?.completionNote && (
                      <div className={styles.completionNote}>
                        {dlRoadmapContent[roadmapLanguage].completionNote}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
