'use client';

import { useState } from 'react';
import Image from 'next/image';
import { markComplete } from '@/lib/completionTracker';
import { useRouter } from 'next/navigation';
import styles from './Visual.module.css';

/**
 * Multi-page Visual Component for "More about Residuals!" Problem
 * Teaching interaction detection using residual plots
 */

export default function Visual({ problemInfo }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const router = useRouter();

  const pages = problemInfo?.pages || [];
  const totalPages = problemInfo?.totalPages || 10;
  const currentPageData = pages.find(p => p.pageNumber === currentPage);

  // Navigation handlers
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      setShowFeedback(false);
      setSelectedOptions([]);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      setShowFeedback(false);
    }
  };

  const handleCompletion = () => {
    markComplete('more-residuals');
    router.push('/module/LinearRegression');
  };

  // Render different page types
  const renderPageContent = () => {
    if (!currentPageData) return null;

    switch (currentPageData.type) {
      case 'dramatic-quote-large':
        return <DramaticQuoteLargePage data={currentPageData} />;

      case 'introduction':
        return <IntroductionPage data={currentPageData} />;

      case 'explanation':
        return <ExplanationPage data={currentPageData} />;

      case 'explanation-with-links':
        return <ExplanationWithLinksPage data={currentPageData} />;

      case 'image-with-explanation':
        return <ImageWithExplanationPage data={currentPageData} />;

      case 'explanation-with-whisper':
        return <ExplanationWithWhisperPage data={currentPageData} />;

      case 'multi-select-quiz':
        return (
          <MultiSelectQuizPage
            data={currentPageData}
            selectedOptions={selectedOptions}
            setSelectedOptions={setSelectedOptions}
            showFeedback={showFeedback}
            setShowFeedback={setShowFeedback}
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

        {/* Next button logic - show on pages with hasNextButton=true */}
        {currentPageData?.hasNextButton && (
          <button
            onClick={goToNextPage}
            className={`${styles.navButton} ${styles.nextButton}`}
          >
            Next →
          </button>
        )}

        {/* For pages without Next button (questions, completion) */}
        {!currentPageData?.hasNextButton && currentPage < totalPages && (
          <div style={{ width: '120px' }}></div>
        )}

        {/* Completion page - no Next button */}
        {currentPageData?.type === 'completion' && (
          <div style={{ width: '120px' }}></div>
        )}
      </div>
    </div>
  );
}

// Page 1: Large Dramatic Quote (John W. Tukey)
function DramaticQuoteLargePage({ data }) {
  return (
    <div className={styles.dramaticQuoteLargePage}>
      <div className={styles.quoteContainer}>
        <blockquote style={{
          fontSize: '2.2rem',
          fontWeight: 700,
          fontStyle: 'italic',
          color: '#1a202c',
          lineHeight: '1.5',
          textAlign: 'center',
          margin: '0 auto 3rem auto',
          maxWidth: '900px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          {data.quote}
        </blockquote>
        <p style={{
          fontSize: '1.4rem',
          fontWeight: 600,
          color: '#4a5568',
          textAlign: 'center',
          fontStyle: 'italic'
        }}>
          - {data.author}
        </p>
      </div>
    </div>
  );
}

// Page 2: Introduction
function IntroductionPage({ data }) {
  return (
    <div className={styles.introPage}>
      <h2 style={{
        fontSize: '2.5rem',
        fontWeight: 700,
        color: '#1a202c',
        letterSpacing: '-0.02em',
        textAlign: 'center',
        marginBottom: '2.5rem',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
      }}>
        {data.prompt.heading}
      </h2>
      <div className={styles.introBody}>
        {data.prompt.body.split('\n\n').map((para, idx) => (
          <p key={idx} style={{
            fontSize: '1.3rem',
            lineHeight: '1.9',
            color: '#2d3748',
            textAlign: 'center',
            maxWidth: '750px',
            margin: '0 auto 1.5rem auto',
            fontWeight: para.includes('diagnostic powerhouses') ? 700 : 400
          }}>
            {para.includes('diagnostic powerhouses') ? (
              <span style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 700,
                fontSize: '1.4rem'
              }}>
                {para}
              </span>
            ) : para}
          </p>
        ))}
      </div>
    </div>
  );
}

// Page 3: Explanation
function ExplanationPage({ data }) {
  return (
    <div className={styles.explanationPage}>
      <h2 style={{
        fontSize: '2.5rem',
        fontWeight: 700,
        color: '#1a202c',
        letterSpacing: '-0.02em',
        textAlign: 'center',
        marginBottom: '2.5rem'
      }}>
        {data.prompt.heading}
      </h2>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {data.prompt.body.split('\n\n').map((para, idx) => {
          // Highlight key terms
          let formattedPara = para;

          // Highlight "Signal" with quotes
          formattedPara = formattedPara.replace(/"Signal"/g, '<span style="color: #667eea; font-weight: 700;">"Signal"</span>');

          // Highlight technical terms
          formattedPara = formattedPara.replace(/missing interaction/g, '<strong style="color: #ef4444; font-weight: 700;">missing interaction</strong>');
          formattedPara = formattedPara.replace(/Residual plots/g, '<span style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 700; font-size: 1.35rem;">Residual plots</span>');

          return (
            <p key={idx} style={{
              fontSize: '1.25rem',
              lineHeight: '1.9',
              color: '#2d3748',
              marginBottom: '1.5rem'
            }} dangerouslySetInnerHTML={{ __html: formattedPara }}>
            </p>
          );
        })}
      </div>
    </div>
  );
}

// Page 4: Explanation with Links
function ExplanationWithLinksPage({ data }) {
  return (
    <div className={styles.explanationPage}>
      <h2 style={{
        fontSize: '2.5rem',
        fontWeight: 700,
        color: '#1a202c',
        letterSpacing: '-0.02em',
        textAlign: 'center',
        marginBottom: '2.5rem',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
      }}>
        {data.prompt.heading}
      </h2>

      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <p style={{
          fontSize: '1.3rem',
          lineHeight: '1.9',
          color: '#2d3748',
          textAlign: 'center',
          marginBottom: '3rem'
        }}>
          {data.prompt.body}
        </p>

        {data.resources.map((resource, idx) => (
          <div key={idx} style={{
            padding: '2rem',
            background: 'linear-gradient(135deg, #e0e7ff 0%, #ddd6fe 100%)',
            borderRadius: '12px',
            border: '2px solid #a5b4fc',
            marginBottom: '2rem'
          }}>
            <p style={{
              fontSize: '1.2rem',
              fontWeight: 600,
              color: '#4c1d95',
              marginBottom: '1.5rem'
            }}>
              📚 {resource.text}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {resource.links.map((link, linkIdx) => (
                <div key={linkIdx}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: '#667eea',
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      textDecoration: 'underline',
                      display: 'block',
                      marginBottom: '0.5rem'
                    }}
                  >
                    {link.url}
                  </a>
                  <p style={{
                    fontSize: '1rem',
                    color: '#5a67d8',
                    fontStyle: 'italic',
                    marginLeft: '1rem'
                  }}>
                    {link.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Page 5 & 6 & 8: Image with Explanation
function ImageWithExplanationPage({ data }) {
  return (
    <div className={styles.imageExplanationPage}>
      <h2 style={{
        fontSize: '2.5rem',
        fontWeight: 700,
        color: '#1a202c',
        letterSpacing: '-0.02em',
        textAlign: 'center',
        marginBottom: '2rem'
      }}>
        {data.prompt.heading}
      </h2>

      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {data.prompt.body.split('\n\n').map((para, idx) => (
          <p key={idx} style={{
            fontSize: '1.2rem',
            lineHeight: '1.8',
            color: '#4a5568',
            marginBottom: '1.5rem'
          }}>
            {para}
          </p>
        ))}
      </div>

      <div className={styles.imageContainer}>
        <Image
          src={data.image}
          alt={data.prompt.heading}
          width={800}
          height={500}
          className={styles.plotImage}
        />
      </div>

      {data.explanation && data.explanation.length > 0 && (
        <div style={{
          marginTop: '2.5rem',
          padding: '2rem',
          background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
          borderLeft: '5px solid #f59e0b',
          borderRadius: '12px',
          boxShadow: '0 4px 15px rgba(245, 158, 11, 0.15)',
          maxWidth: '800px',
          margin: '2.5rem auto 0 auto'
        }}>
          {data.explanation.map((exp, idx) => (
            <p key={idx} style={{
              fontSize: '1.15rem',
              lineHeight: '1.8',
              color: '#78350f',
              marginBottom: idx < data.explanation.length - 1 ? '1rem' : 0,
              fontWeight: 600
            }}>
              • {exp}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

// Page 7: Explanation with Whisper
function ExplanationWithWhisperPage({ data }) {
  return (
    <div className={styles.explanationPage}>
      <h2 style={{
        fontSize: '2.5rem',
        fontWeight: 700,
        color: '#1a202c',
        letterSpacing: '-0.02em',
        textAlign: 'center',
        marginBottom: '2.5rem'
      }}>
        {data.prompt.heading}
      </h2>

      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {data.prompt.body.split('\n\n').map((para, idx) => (
          <p key={idx} style={{
            fontSize: '1.25rem',
            lineHeight: '1.9',
            color: '#2d3748',
            marginBottom: '1.5rem'
          }}>
            {para}
          </p>
        ))}

        {/* Whisper box */}
        <div style={{
          marginTop: '2.5rem',
          padding: '2rem',
          background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
          borderLeft: '5px solid #3b82f6',
          borderRadius: '12px',
          boxShadow: '0 4px 15px rgba(59, 130, 246, 0.15)',
          position: 'relative'
        }}>
          <div style={{
            position: 'absolute',
            top: '-15px',
            left: '20px',
            fontSize: '2rem'
          }}>
            🤫
          </div>
          <p style={{
            fontSize: '1.2rem',
            lineHeight: '1.8',
            color: '#1e3a8a',
            fontStyle: 'italic',
            fontWeight: 600,
            marginTop: '1rem'
          }}>
            {data.prompt.whisper}
          </p>
        </div>
      </div>
    </div>
  );
}

// Page 9: Multi-Select Quiz
function MultiSelectQuizPage({ data, selectedOptions, setSelectedOptions, showFeedback, setShowFeedback, goToNextPage }) {
  const correctAnswers = data.correctAnswers;
  const isCorrect = selectedOptions.length === correctAnswers.length &&
                    selectedOptions.every(opt => correctAnswers.includes(opt));

  const handleOptionToggle = (optionValue) => {
    if (showFeedback) return;

    setSelectedOptions(prev => {
      if (prev.includes(optionValue)) {
        return prev.filter(opt => opt !== optionValue);
      } else {
        return [...prev, optionValue];
      }
    });
  };

  const handleCheckAnswer = () => {
    if (selectedOptions.length > 0) {
      setShowFeedback(true);
    }
  };

  const getOptionClass = (optionValue) => {
    if (showFeedback) {
      if (correctAnswers.includes(optionValue)) {
        return styles.correct;
      }
      if (selectedOptions.includes(optionValue) && !correctAnswers.includes(optionValue)) {
        return styles.incorrect;
      }
    }
    return selectedOptions.includes(optionValue) ? styles.selected : '';
  };

  return (
    <div className={styles.quizPage}>
      <h2 style={{
        fontSize: '2.5rem',
        fontWeight: 700,
        color: '#1a202c',
        letterSpacing: '-0.02em',
        textAlign: 'center',
        marginBottom: '2rem'
      }}>
        {data.prompt.heading}
      </h2>

      <p style={{
        fontSize: '1.3rem',
        lineHeight: '1.9',
        color: '#2d3748',
        textAlign: 'center',
        maxWidth: '800px',
        margin: '0 auto 2rem auto'
      }}>
        {data.prompt.body}
      </p>

      {/* Options Grid */}
      <div className={styles.quizOptionsGrid}>
        {data.options.map((option) => (
          <div
            key={option.value}
            className={`${styles.quizOptionCard} ${getOptionClass(option.value)}`}
            onClick={() => handleOptionToggle(option.value)}
          >
            <div className={styles.quizOptionImage}>
              <Image
                src={option.image}
                alt={option.label}
                width={400}
                height={300}
                className={styles.optionImage}
              />
            </div>
            <div className={styles.quizOptionLabel}>
              {option.label}
            </div>
            {selectedOptions.includes(option.value) && !showFeedback && (
              <div className={styles.checkmark}>✓</div>
            )}
            {showFeedback && correctAnswers.includes(option.value) && (
              <div className={styles.correctMark}>✓</div>
            )}
            {showFeedback && selectedOptions.includes(option.value) && !correctAnswers.includes(option.value) && (
              <div className={styles.incorrectMark}>✗</div>
            )}
          </div>
        ))}
      </div>

      {/* Remark */}
      <div style={{
        marginTop: '2rem',
        padding: '1.5rem',
        background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
        borderLeft: '5px solid #f59e0b',
        borderRadius: '12px',
        maxWidth: '800px',
        margin: '2rem auto'
      }}>
        <p style={{
          fontSize: '1.1rem',
          lineHeight: '1.8',
          color: '#78350f',
          fontWeight: 600
        }}>
          💡 {data.prompt.remark}
        </p>
      </div>

      {/* Check Answer Button */}
      {!showFeedback && (
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <button
            onClick={handleCheckAnswer}
            className={styles.checkButton}
            disabled={selectedOptions.length === 0}
          >
            Check Answer
          </button>
        </div>
      )}

      {/* Feedback */}
      {showFeedback && (
        <div className={`${styles.feedbackBox} ${isCorrect ? styles.correctFeedback : styles.incorrectFeedback}`}>
          <h3 className={styles.feedbackTitle}>
            {isCorrect ? 'Correct Answer! 🎯' : 'Wrong Answer! ❌'}
          </h3>
          <p className={styles.feedbackMessage}>
            {isCorrect
              ? 'Great job! You correctly identified the plots showing interactions.'
              : `The correct answers are: ${data.options.filter(opt => correctAnswers.includes(opt.value)).map(opt => opt.label).join(', ')}`
            }
          </p>
          <button onClick={goToNextPage} className={styles.continueButton}>
            Continue →
          </button>
        </div>
      )}
    </div>
  );
}

// Page 10: Completion
function CompletionPage({ data, handleCompletion }) {
  return (
    <div className={styles.completionPage}>
      <div className={styles.completionContent}>
        <h1 style={{
          fontSize: '3rem',
          fontWeight: 800,
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textAlign: 'center',
          marginBottom: '2rem'
        }}>
          {data.prompt.heading}
        </h1>

        <div style={{
          maxWidth: '750px',
          margin: '0 auto 3rem auto'
        }}>
          {data.prompt.body.split('\n\n').map((para, idx) => (
            <p key={idx} style={{
              fontSize: '1.3rem',
              lineHeight: '1.9',
              color: '#2d3748',
              textAlign: 'center',
              marginBottom: '1.5rem'
            }}>
              {para.includes('Interaction Term') ? (
                <>
                  You simply add a new <span style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontWeight: 700,
                    fontSize: '1.4rem'
                  }}>"Interaction Term" (X1 * X2)</span> into your hypothesis.
                </>
              ) : para}
            </p>
          ))}
        </div>

        {/* Beautified Equation */}
        <div style={{
          padding: '3rem',
          background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
          borderRadius: '16px',
          boxShadow: '0 10px 40px rgba(102, 126, 234, 0.2)',
          marginBottom: '3rem',
          border: '3px solid #667eea'
        }}>
          <p style={{
            fontSize: '2.5rem',
            fontWeight: 800,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textAlign: 'center',
            fontFamily: 'Georgia, serif',
            letterSpacing: '0.05em'
          }}>
            {data.prompt.equation}
          </p>
        </div>

        <button onClick={handleCompletion} className={styles.returnButton}>
          Return to Linear Regression Module
        </button>
      </div>
    </div>
  );
}
