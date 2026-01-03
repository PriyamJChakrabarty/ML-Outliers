'use client';

import { use } from 'react';
import { UserButton } from '@clerk/nextjs';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getProblem } from '@/problems/index.js';
import { markComplete } from '@/lib/completionTracker';
import styles from './solve.module.css';

export default function SolvePage({ params }) {
  const { id } = use(params);

  // Get problem from registry
  const problem = getProblem(id);

  // State management
  const [userAnswer, setUserAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [hintIndex, setHintIndex] = useState(0);

  // Handle case where problem doesn't exist
  if (!problem) {
    return (
      <div className={styles.container}>
        <nav className={styles.nav}>
          <Link href="/home" className={styles.backLink}>
            <span className={styles.backArrow}>←</span>
            <span>Back to Home</span>
          </Link>
          <Image
            src="/logo.png"
            alt="ML Outliers"
            width={150}
            height={30}
          />
          <UserButton afterSignOutUrl="/" />
        </nav>

        <main className={styles.main}>
          <div className={styles.errorCard}>
            <h1 className={styles.errorTitle}>Problem Not Found</h1>
            <p className={styles.errorText}>
              The problem "{id}" doesn't exist or hasn't been published yet.
            </p>
            <Link href="/home" className={styles.homeButton}>
              Go Back Home
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const { info, Visual } = problem;

  // Handle answer submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (userAnswer.trim().length < info.answer.minLength) {
      setFeedback({
        type: 'error',
        title: 'Answer Too Short',
        message: `Please provide an answer with at least ${info.answer.minLength} characters.`,
      });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    try {
      const response = await fetch('/api/check-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problemId: id,
          userAnswer: userAnswer.trim(),
          expertAnswer: info.answer.expert,
          threshold: info.answer.similarityThreshold,
        }),
      });

      const result = await response.json();

      if (result.isCorrect) {
        // Mark problem as completed
        markComplete(id);

        setFeedback({
          type: 'success',
          ...info.feedback.correct,
          similarity: result.similarity,
        });
      } else {
        setFeedback({
          type: 'incorrect',
          ...info.feedback.incorrect,
          similarity: result.similarity,
        });
      }
    } catch (error) {
      setFeedback({
        type: 'error',
        title: 'Submission Error',
        message: 'Failed to check your answer. Please try again.',
      });
      console.error('Submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle hint request
  const handleShowHint = () => {
    if (!showHint) {
      setShowHint(true);
    } else if (hintIndex < info.hints.length - 1) {
      setHintIndex(hintIndex + 1);
    }
  };

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

        <UserButton afterSignOutUrl="/" />
      </nav>

      <main className={styles.main}>
        {/* Problem Header */}
        <div className={styles.header}>
          <div className={styles.breadcrumb}>
            <span className={styles.module}>{info.module}</span>
            <span className={styles.separator}>›</span>
            <span className={styles.difficulty}>{info.difficulty}</span>
          </div>
          <h1 className={styles.title}>{info.title}</h1>
        </div>

        {/* Visualization */}
        <section className={styles.visualSection}>
          <Visual
            imagePath={info.visualization.path}
            alt={info.visualization.alt}
            problemInfo={info}
          />
        </section>

        {/* Problem Prompt */}
        {!info.multiPage && (
          <section className={styles.promptSection}>
            <h2 className={styles.promptHeading}>{info.prompt.heading}</h2>
            <p className={styles.promptBody}>{info.prompt.body}</p>
          </section>
        )}

        {/* Answer Input */}
        {!info.multiPage && (
          <section className={styles.answerSection}>
          <form onSubmit={handleSubmit} className={styles.answerForm}>
            <label htmlFor="answer" className={styles.inputLabel}>
              Your Answer
            </label>
            <div className={styles.inputWrapper}>
              <input
                type="text"
                id="answer"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                maxLength={info.answer.maxLength}
                placeholder="Type your answer here..."
                className={styles.answerInput}
                disabled={isSubmitting}
              />
              <span className={styles.charCount}>
                {userAnswer.length}/{info.answer.maxLength}
              </span>
            </div>

            <div className={styles.formActions}>
              <button
                type="button"
                onClick={handleShowHint}
                className={styles.hintButton}
                disabled={isSubmitting || (showHint && hintIndex >= info.hints.length - 1)}
              >
                💡 {showHint ? 'Show Next Hint' : 'Show Hint'}
              </button>

              <button
                type="submit"
                className={styles.submitButton}
                disabled={isSubmitting || userAnswer.trim().length < info.answer.minLength}
              >
                {isSubmitting ? 'Checking...' : 'Submit Answer'}
              </button>
            </div>
          </form>

          {/* Hint Display */}
          {showHint && (
            <div className={styles.hintBox}>
              <div className={styles.hintHeader}>
                <span className={styles.hintIcon}>💡</span>
                <span className={styles.hintTitle}>Hint {hintIndex + 1}</span>
              </div>
              <p className={styles.hintText}>{info.hints[hintIndex]}</p>
            </div>
          )}

          {/* Feedback Display */}
          {feedback && (
            <div className={`${styles.feedbackBox} ${styles[feedback.type]}`}>
              <div className={styles.feedbackHeader}>
                <h3 className={styles.feedbackTitle}>{feedback.title}</h3>
                {feedback.similarity !== undefined && (
                  <span className={styles.similarityScore}>
                    Match: {Math.round(feedback.similarity * 100)}%
                  </span>
                )}
              </div>
              <p className={styles.feedbackMessage}>{feedback.message}</p>
              {feedback.explanation && (
                <div className={styles.explanationBox}>
                  <p className={styles.explanation}>{feedback.explanation}</p>
                </div>
              )}
              {feedback.hint && (
                <p className={styles.feedbackHint}>{feedback.hint}</p>
              )}

              {feedback.type === 'success' && (
                <div className={styles.successActions}>
                  <Link href="/home" className={styles.continueButton}>
                    Continue Learning
                  </Link>
                </div>
              )}
            </div>
          )}
        </section>
        )}
      </main>
    </div>
  );
}
