'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import styles from './Visual.module.css';

/**
 * Multi-page Visual Component for "Log Transform" Problem
 * Teaching log transformation for exponential data
 */

export default function Visual({ problemInfo }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const pages = problemInfo?.pages || [];
  const totalPages = problemInfo?.totalPages || 2;
  const currentPageData = pages.find(p => p.pageNumber === currentPage);

  // Navigation handlers
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      setShowFeedback(false);
      setSelectedOption(null);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      setShowFeedback(false);
    }
  };

  // Handle answer submission with API call
  const handleCheckAnswer = async () => {
    if (!selectedOption) return;

    setIsSubmitting(true);
    const correct = selectedOption === currentPageData?.correctAnswer;
    setIsCorrect(correct);
    setShowFeedback(true);

    if (correct) {
      // Call API to update database
      try {
        await fetch('/api/check-answer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            problemId: 'log-transform',
            userAnswer: selectedOption,
            expertAnswer: currentPageData?.correctAnswer,
            threshold: 0.75,
          }),
        });

        // Dispatch event to notify other components
        window.dispatchEvent(new CustomEvent('completion-updated', {
          detail: { problemSlug: 'log-transform' }
        }));
      } catch (error) {
        console.error('Error updating completion:', error);
      }
    }

    setIsSubmitting(false);
  };

  const handleCompletion = async () => {
    try {
      // Mark the problem as complete regardless of answer correctness
      await fetch('/api/mark-complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problemSlug: 'log-transform' }),
      });

      // Dispatch event to notify other components
      window.dispatchEvent(new CustomEvent('completion-updated', {
        detail: { problemSlug: 'log-transform' }
      }));
    } catch (error) {
      console.error('Error marking problem complete:', error);
    }

    router.push('/module/LinearRegression');
  };

  // Render different page types
  const renderPageContent = () => {
    if (!currentPageData) return null;

    switch (currentPageData.type) {
      case 'multiple-choice-question':
        return (
          <MultipleChoiceQuestionPage
            data={currentPageData}
            selectedOption={selectedOption}
            setSelectedOption={setSelectedOption}
            showFeedback={showFeedback}
            isCorrect={isCorrect}
            isSubmitting={isSubmitting}
            handleCheckAnswer={handleCheckAnswer}
            goToNextPage={goToNextPage}
          />
        );

      case 'completion':
        return <CompletionPage data={currentPageData} handleCompletion={handleCompletion} />;

      default:
        return null;
    }
  };

  return (
    <div className={styles.visualContainer}>
      {/* Page Progress Indicator */}
      <div className={styles.progressBar}>
        {Array.from({ length: totalPages }, (_, i) => (
          <div
            key={i}
            className={`${styles.progressDot} ${
              i + 1 === currentPage ? styles.active : ''
            } ${i + 1 < currentPage ? styles.completed : ''}`}
          />
        ))}
      </div>

      {/* Page Content */}
      <div className={styles.pageContent}>
        {renderPageContent()}
      </div>

      {/* Navigation Buttons */}
      <div className={styles.navigationButtons}>
        <button
          onClick={goToPrevPage}
          disabled={currentPage === 1}
          className={styles.navButton}
        >
          ← Previous
        </button>

        <span className={styles.pageIndicator}>
          {currentPage} / {totalPages}
        </span>

        {currentPageData?.hasNextButton && (
          <button
            onClick={goToNextPage}
            className={`${styles.navButton} ${styles.nextButton}`}
          >
            Next →
          </button>
        )}

        {!currentPageData?.hasNextButton && (
          <div style={{ width: '120px' }}></div>
        )}
      </div>
    </div>
  );
}

// Page 1: Multiple Choice Question
function MultipleChoiceQuestionPage({
  data,
  selectedOption,
  setSelectedOption,
  showFeedback,
  isCorrect,
  isSubmitting,
  handleCheckAnswer,
  goToNextPage
}) {
  const renderFormattedText = (text) => {
    if (!text) return null;
    const parts = text.split('**');
    return parts.map((part, idx) => {
      if (idx % 2 === 1) {
        return <strong key={idx} style={{
          color: '#667eea',
          fontWeight: 700
        }}>{part}</strong>;
      }
      return part;
    });
  };

  return (
    <div style={{
      maxWidth: '900px',
      margin: '0 auto',
      padding: '2rem',
    }}>
      <h2 style={{
        fontSize: '2.5rem',
        fontWeight: 700,
        color: '#1a202c',
        letterSpacing: '-0.02em',
        textAlign: 'center',
        marginBottom: '2rem',
      }}>
        {data.prompt.heading}
      </h2>

      <div style={{ marginBottom: '2rem' }}>
        {data.prompt.body.split('\n\n').map((para, idx) => (
          <p key={idx} style={{
            fontSize: '1.25rem',
            lineHeight: '1.9',
            color: '#2d3748',
            textAlign: 'center',
            marginBottom: '1.5rem',
          }}>
            {renderFormattedText(para)}
          </p>
        ))}
      </div>

      {/* Image */}
      {data.image && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '2.5rem',
        }}>
          <Image
            src={data.image.path}
            alt={data.image.alt}
            width={700}
            height={450}
            style={{
              borderRadius: '12px',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
            }}
          />
        </div>
      )}

      {/* Options */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '1.5rem',
        marginBottom: '2rem',
        maxWidth: '600px',
        margin: '0 auto 2rem auto',
      }}>
        {data.options.map((option) => {
          const isSelected = selectedOption === option.id;
          const isCorrectOption = option.id === data.correctAnswer;

          let backgroundColor = '#ffffff';
          let borderColor = '#e2e8f0';
          let textColor = '#1a202c';

          if (showFeedback) {
            if (isCorrectOption) {
              backgroundColor = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
              borderColor = '#10b981';
              textColor = 'white';
            } else if (isSelected && !isCorrectOption) {
              backgroundColor = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
              borderColor = '#ef4444';
              textColor = 'white';
            }
          } else if (isSelected) {
            backgroundColor = 'linear-gradient(135deg, #e0e7ff 0%, #ddd6fe 100%)';
            borderColor = '#667eea';
          }

          return (
            <button
              key={option.id}
              onClick={() => !showFeedback && setSelectedOption(option.id)}
              style={{
                padding: '1.5rem 2rem',
                fontSize: '1.2rem',
                fontWeight: 600,
                color: textColor,
                background: backgroundColor,
                border: `3px solid ${borderColor}`,
                borderRadius: '12px',
                cursor: showFeedback ? 'default' : 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
              disabled={showFeedback}
            >
              <span>{option.label}</span>
              {isSelected && !showFeedback && <span>✓</span>}
              {showFeedback && isCorrectOption && <span>✓</span>}
              {showFeedback && isSelected && !isCorrectOption && <span>✗</span>}
            </button>
          );
        })}
      </div>

      {/* Check Button */}
      {!showFeedback && (
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <button
            onClick={handleCheckAnswer}
            disabled={!selectedOption || isSubmitting}
            style={{
              padding: '1rem 3rem',
              fontSize: '1.2rem',
              fontWeight: 700,
              color: 'white',
              background: selectedOption && !isSubmitting
                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                : '#cbd5e0',
              border: 'none',
              borderRadius: '12px',
              cursor: selectedOption && !isSubmitting ? 'pointer' : 'not-allowed',
              boxShadow: selectedOption ? '0 10px 30px rgba(102, 126, 234, 0.3)' : 'none',
              transition: 'all 0.3s ease',
            }}
          >
            {isSubmitting ? 'Checking...' : 'Check Answer'}
          </button>
        </div>
      )}

      {/* Feedback */}
      {showFeedback && (
        <div style={{
          padding: '2.5rem',
          background: isCorrect
            ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
            : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          borderRadius: '16px',
          boxShadow: isCorrect
            ? '0 20px 50px rgba(16, 185, 129, 0.4)'
            : '0 20px 50px rgba(239, 68, 68, 0.4)',
          color: 'white',
          maxWidth: '700px',
          margin: '0 auto',
        }}>
          <h3 style={{
            fontSize: '2rem',
            fontWeight: 700,
            marginBottom: '1rem',
          }}>
            {isCorrect ? data.feedback.correct.title : data.feedback.incorrect.title}
          </h3>
          <p style={{
            fontSize: '1.2rem',
            lineHeight: '1.8',
            marginBottom: '1.5rem',
          }}>
            {isCorrect ? data.feedback.correct.message : data.feedback.incorrect.message}
          </p>
          {isCorrect && data.feedback.correct.explanation && (
            <div style={{
              padding: '1.5rem',
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '10px',
              marginBottom: '1.5rem',
            }}>
              <p style={{
                fontSize: '1.1rem',
                lineHeight: '1.8',
                margin: 0,
                fontStyle: 'italic',
              }}>
                💡 {data.feedback.correct.explanation}
              </p>
            </div>
          )}
          {!isCorrect && data.feedback.incorrect.hint && (
            <p style={{
              fontSize: '1rem',
              lineHeight: '1.6',
              fontStyle: 'italic',
              marginBottom: '1.5rem',
            }}>
              Hint: {data.feedback.incorrect.hint}
            </p>
          )}
          <button
            onClick={goToNextPage}
            style={{
              padding: '1rem 2.5rem',
              fontSize: '1.1rem',
              fontWeight: 700,
              color: isCorrect ? '#10b981' : '#ef4444',
              background: 'white',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              boxShadow: '0 5px 15px rgba(0, 0, 0, 0.2)',
              transition: 'all 0.3s ease',
            }}
          >
            Continue →
          </button>
        </div>
      )}
    </div>
  );
}

// Page 2: Completion Page - UNIFORM STANDARD
function CompletionPage({ data, handleCompletion }) {
  const [isLoading, setIsLoading] = useState(false);

  const onComplete = async () => {
    setIsLoading(true);
    await handleCompletion();
  };

  const renderFormattedText = (text) => {
    if (!text) return null;
    const parts = text.split('**');
    return parts.map((part, idx) => {
      if (idx % 2 === 1) {
        return <strong key={idx} style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontWeight: 700,
          fontSize: '1.35rem',
        }}>{part}</strong>;
      }
      return part;
    });
  };

  return (
    <div style={{
      maxWidth: '900px',
      margin: '0 auto',
      padding: '2rem',
      textAlign: 'center',
    }}>
      <h1 style={{
        fontSize: '3rem',
        fontWeight: 800,
        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        marginBottom: '2.5rem',
        letterSpacing: '-0.02em',
      }}>
        {data.prompt.heading}
      </h1>

      <div style={{
        maxWidth: '750px',
        margin: '0 auto 3rem auto',
      }}>
        {data.prompt.body.split('\n\n').map((para, idx) => (
          <p key={idx} style={{
            fontSize: '1.3rem',
            lineHeight: '1.9',
            color: '#2d3748',
            marginBottom: '1.5rem',
          }}>
            {renderFormattedText(para)}
          </p>
        ))}
      </div>

      <button
        onClick={onComplete}
        disabled={isLoading}
        style={{
          padding: '1.2rem 3rem',
          fontSize: '1.2rem',
          fontWeight: 700,
          color: 'white',
          background: isLoading
            ? 'linear-gradient(135deg, #a5b4fc 0%, #c4b5fd 100%)'
            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          border: 'none',
          borderRadius: '12px',
          cursor: isLoading ? 'wait' : 'pointer',
          boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.75rem',
          minWidth: '320px',
          margin: '0 auto',
        }}
        onMouseEnter={(e) => {
          if (!isLoading) {
            e.target.style.transform = 'translateY(-3px)';
            e.target.style.boxShadow = '0 15px 40px rgba(102, 126, 234, 0.4)';
          }
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'translateY(0)';
          e.target.style.boxShadow = '0 10px 30px rgba(102, 126, 234, 0.3)';
        }}
      >
        {isLoading && (
          <span style={{
            width: '20px',
            height: '20px',
            border: '3px solid rgba(255,255,255,0.3)',
            borderTop: '3px solid white',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }} />
        )}
        {isLoading ? 'Saving Progress...' : 'Return to Linear Regression Module →'}
      </button>
      {isLoading && (
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      )}
    </div>
  );
}
