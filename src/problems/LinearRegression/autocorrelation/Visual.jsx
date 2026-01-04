'use client';

import { useState } from 'react';
import Image from 'next/image';
import { markComplete } from '@/lib/completionTracker';
import { useRouter } from 'next/navigation';
import styles from './Visual.module.css';

/**
 * Multi-page Visual Component for "Autocorrelation" Problem
 * Teaching autocorrelation detection in time series residual plots
 */

export default function Visual({ problemInfo }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const router = useRouter();

  const pages = problemInfo?.pages || [];
  const totalPages = problemInfo?.totalPages || 15;
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
      setSelectedOption(null);
    }
  };

  const handleCompletion = () => {
    markComplete('autocorrelation');
    router.push('/module/LinearRegression');
  };

  // Render different page types
  const renderPageContent = () => {
    if (!currentPageData) return null;

    switch (currentPageData.type) {
      case 'introduction':
        return <IntroductionPage data={currentPageData} />;

      case 'explanation-with-image':
        return <ExplanationWithImagePage data={currentPageData} />;

      case 'explanation-with-dropdown':
        return <ExplanationWithDropdownPage data={currentPageData} />;

      case 'explanation-with-images':
        return <ExplanationWithImagesPage data={currentPageData} />;

      case 'explanation-with-images-plain':
        return <ExplanationWithImagesPlainPage data={currentPageData} />;

      case 'lag-plots-intro':
        return <LagPlotsIntroPage data={currentPageData} />;

      case 'correlation-ordering-question':
        return (
          <CorrelationOrderingQuestionPage
            data={currentPageData}
            selectedOption={selectedOption}
            setSelectedOption={setSelectedOption}
            showFeedback={showFeedback}
            setShowFeedback={setShowFeedback}
            goToNextPage={goToNextPage}
          />
        );

      case 'thinking-page':
        return <ThinkingPage data={currentPageData} />;

      case 'equation-page':
        return <EquationPage data={currentPageData} />;

      case 'predict-change-page':
        return <PredictChangePage data={currentPageData} />;

      case 'single-choice-question':
        return (
          <SingleChoiceQuestionPage
            data={currentPageData}
            selectedOption={selectedOption}
            setSelectedOption={setSelectedOption}
            showFeedback={showFeedback}
            setShowFeedback={setShowFeedback}
            goToNextPage={goToNextPage}
          />
        );

      case 'summary':
        return <SummaryPage data={currentPageData} />;

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

        {!currentPageData?.hasNextButton && currentPage < totalPages && currentPageData?.type !== 'single-choice-question' && currentPageData?.type !== 'completion' && (
          <div style={{ width: '120px' }}></div>
        )}

        {(currentPageData?.type === 'single-choice-question' || currentPageData?.type === 'completion') && (
          <div style={{ width: '120px' }}></div>
        )}
      </div>
    </div>
  );
}

// Page 1: Introduction
function IntroductionPage({ data }) {
  return (
    <div style={{
      maxWidth: '900px',
      margin: '0 auto',
      padding: '2rem',
    }}>
      <h1 style={{
        fontSize: '3rem',
        fontWeight: 800,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        textAlign: 'center',
        marginBottom: '3rem',
        letterSpacing: '-0.02em',
      }}>
        {data.prompt.heading}
      </h1>

      <div>
        {data.prompt.body.split('\n\n').map((para, idx) => {
          // Style specific parts
          let content = para;

          if (para.includes('Forecasting')) {
            return (
              <p key={idx} style={{
                fontSize: '1.3rem',
                lineHeight: '1.9',
                color: '#2d3748',
                textAlign: 'center',
                marginBottom: '1.5rem',
              }}>
                The goal is <span style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontWeight: 700,
                  fontSize: '1.5rem',
                }}>Forecasting</span>. Predicting what comes next based on what's already happened.
              </p>
            );
          }

          return (
            <p key={idx} style={{
              fontSize: '1.3rem',
              lineHeight: '1.9',
              color: '#2d3748',
              textAlign: 'center',
              marginBottom: '1.5rem',
            }}>
              {content}
            </p>
          );
        })}
      </div>
    </div>
  );
}

// Page 2: Explanation with Image
function ExplanationWithImagePage({ data }) {
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
        marginBottom: '2.5rem',
      }}>
        {data.prompt.heading}
      </h2>

      <div style={{ marginBottom: '2.5rem' }}>
        {data.prompt.body.split('\n\n').map((para, idx) => (
          <p key={idx} style={{
            fontSize: '1.25rem',
            lineHeight: '1.9',
            color: '#2d3748',
            textAlign: 'center',
            marginBottom: '1.5rem',
          }}>
            {para}
          </p>
        ))}
      </div>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1rem',
      }}>
        <Image
          src={data.image.path}
          alt={data.image.alt}
          width={800}
          height={500}
          style={{
            borderRadius: '12px',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
          }}
        />
        {data.image.caption && (
          <p style={{
            fontSize: '1.1rem',
            color: '#718096',
            fontStyle: 'italic',
            textAlign: 'center',
          }}>
            {data.image.caption}
          </p>
        )}
      </div>
    </div>
  );
}

// Page 3: Explanation with Dropdown
function ExplanationWithDropdownPage({ data }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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
        marginBottom: '2.5rem',
      }}>
        {data.prompt.heading}
      </h2>

      <div style={{ marginBottom: '2.5rem' }}>
        {data.prompt.body.split('\n\n').map((para, idx) => {
          // Highlight "Autocorrelation" and key terms
          if (para.includes('Autocorrelation means')) {
            return (
              <p key={idx} style={{
                fontSize: '1.3rem',
                lineHeight: '1.9',
                color: '#2d3748',
                marginBottom: '1.5rem',
                padding: '1.5rem',
                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                borderLeft: '4px solid #667eea',
                borderRadius: '8px',
              }}>
                <strong style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontWeight: 700,
                  fontSize: '1.4rem',
                }}>Autocorrelation</strong> means that the "errors" your model makes are not independent—they are <em style={{ color: '#5a67d8', fontStyle: 'italic' }}>following a sequence</em>. If your model overestimates today, it is likely to overestimate tomorrow.
              </p>
            );
          }

          return (
            <p key={idx} style={{
              fontSize: '1.25rem',
              lineHeight: '1.9',
              color: '#2d3748',
              marginBottom: '1.5rem',
            }}>
              {para}
            </p>
          );
        })}
      </div>

      {/* Dropdown */}
      <div style={{
        marginBottom: '2.5rem',
      }}>
        <div
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          style={{
            padding: '1.5rem',
            background: 'linear-gradient(135deg, #e0e7ff 0%, #ddd6fe 100%)',
            borderRadius: '12px',
            border: '2px solid #a5b4fc',
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            transition: 'all 0.3s ease',
          }}
        >
          <p style={{
            fontSize: '1.2rem',
            fontWeight: 600,
            color: '#4c1d95',
            margin: 0,
          }}>
            📚 {data.dropdown.title}
          </p>
          <span style={{
            fontSize: '1.2rem',
            color: '#4c1d95',
            transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.3s ease',
          }}>
            ▼
          </span>
        </div>
        {isDropdownOpen && (
          <div style={{
            padding: '1.5rem',
            background: '#f9fafb',
            borderRadius: '0 0 12px 12px',
            border: '2px solid #a5b4fc',
            borderTop: 'none',
          }}>
            <a
              href={data.dropdown.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: '#667eea',
                fontSize: '1.1rem',
                fontWeight: 600,
                textDecoration: 'underline',
              }}
            >
              {data.dropdown.url}
            </a>
          </div>
        )}
      </div>

      {/* Images side by side */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '2rem',
        marginTop: '2.5rem',
      }}>
        {data.images.map((img, idx) => (
          <div key={idx} style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem',
          }}>
            <p style={{
              fontSize: '1.2rem',
              fontWeight: 600,
              color: '#1a202c',
              textAlign: 'center',
            }}>
              {img.label}
            </p>
            <Image
              src={img.path}
              alt={img.alt}
              width={400}
              height={300}
              style={{
                borderRadius: '12px',
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// Page 4: Explanation with Multiple Images (Original - with colors and labels)
function ExplanationWithImagesPage({ data }) {
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
        marginBottom: '2.5rem',
      }}>
        {data.prompt.heading}
      </h2>

      <div style={{ marginBottom: '2.5rem' }}>
        {data.prompt.body.split('\n\n').map((para, idx) => {
          // Highlight key terms
          if (para.includes('positive or negative')) {
            return (
              <p key={idx} style={{
                fontSize: '1.25rem',
                lineHeight: '1.9',
                color: '#2d3748',
                marginBottom: '1.5rem',
              }}>
                We can divide correlation as <strong style={{
                  color: '#10b981',
                  fontWeight: 700,
                }}>positive</strong> or <strong style={{
                  color: '#ef4444',
                  fontWeight: 700,
                }}>negative</strong> based on whether the residuals follow the same trend as before or change continuously
              </p>
            );
          }

          return (
            <p key={idx} style={{
              fontSize: '1.25rem',
              lineHeight: '1.9',
              color: '#2d3748',
              marginBottom: '1.5rem',
            }}>
              {para}
            </p>
          );
        })}
      </div>

      {/* Images side by side */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '2rem',
        marginTop: '2.5rem',
      }}>
        {data.images.map((img, idx) => (
          <div key={idx} style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem',
          }}>
            <p style={{
              fontSize: '1.2rem',
              fontWeight: 600,
              color: idx === 0 ? '#10b981' : '#ef4444',
              textAlign: 'center',
            }}>
              {img.label}
            </p>
            <Image
              src={img.path}
              alt={img.alt}
              width={400}
              height={300}
              style={{
                borderRadius: '12px',
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
                border: idx === 0 ? '3px solid #10b981' : '3px solid #ef4444',
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// Page 4 Alternative: Explanation with Multiple Images (Plain - no labels or colors)
function ExplanationWithImagesPlainPage({ data }) {
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
        marginBottom: '2.5rem',
      }}>
        {data.prompt.heading}
      </h2>

      <div style={{ marginBottom: '2.5rem' }}>
        {data.prompt.body.split('\n\n').map((para, idx) => {
          // Highlight key terms without colors
          if (para.includes('positive or negative')) {
            return (
              <p key={idx} style={{
                fontSize: '1.25rem',
                lineHeight: '1.9',
                color: '#2d3748',
                marginBottom: '1.5rem',
                textAlign: 'center',
              }}>
                We can divide correlation as <strong style={{
                  fontWeight: 700,
                }}>positive</strong> or <strong style={{
                  fontWeight: 700,
                }}>negative</strong> based on whether the residuals follow the same trend as before or change continuously
              </p>
            );
          }

          return (
            <p key={idx} style={{
              fontSize: '1.25rem',
              lineHeight: '1.9',
              color: '#2d3748',
              marginBottom: '1.5rem',
              textAlign: 'center',
            }}>
              {para}
            </p>
          );
        })}
      </div>

      {/* Images side by side without labels or colored borders */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '2rem',
        marginTop: '2.5rem',
      }}>
        {data.images.map((img, idx) => (
          <div key={idx} style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem',
          }}>
            <Image
              src={img.path}
              alt={img.alt}
              width={400}
              height={300}
              style={{
                borderRadius: '12px',
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// Pages 5 & 6: Single Choice Question
function SingleChoiceQuestionPage({
  data,
  selectedOption,
  setSelectedOption,
  showFeedback,
  setShowFeedback,
  goToNextPage
}) {
  const handleCheck = () => {
    if (selectedOption) {
      setShowFeedback(true);
    }
  };

  const isCorrect = selectedOption === data.correctAnswer;

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

      <p style={{
        fontSize: '1.3rem',
        lineHeight: '1.9',
        color: '#2d3748',
        textAlign: 'center',
        marginBottom: '2.5rem',
      }}>
        {data.prompt.body}
      </p>

      {/* Image (if provided) */}
      {data.image && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '2.5rem',
        }}>
          <Image
            src={data.image.path}
            alt={data.image.alt}
            width={600}
            height={400}
            style={{
              borderRadius: '12px',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
            }}
          />
        </div>
      )}

      {/* Options */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        marginBottom: '2rem',
      }}>
        {data.options.map((option) => {
          const isSelected = selectedOption === option.id;
          const isCorrectOption = option.id === data.correctAnswer;

          let backgroundColor = '#ffffff';
          let borderColor = '#e2e8f0';

          if (showFeedback) {
            if (isCorrectOption) {
              backgroundColor = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
              borderColor = '#10b981';
            } else if (isSelected && !isCorrectOption) {
              backgroundColor = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
              borderColor = '#ef4444';
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
                color: showFeedback && (isCorrectOption || (isSelected && !isCorrectOption)) ? 'white' : '#1a202c',
                background: backgroundColor,
                border: `3px solid ${borderColor}`,
                borderRadius: '12px',
                cursor: showFeedback ? 'default' : 'pointer',
                transition: 'all 0.3s ease',
                textAlign: 'left',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span>{option.text}</span>
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
            onClick={handleCheck}
            disabled={!selectedOption}
            style={{
              padding: '1rem 3rem',
              fontSize: '1.2rem',
              fontWeight: 700,
              color: 'white',
              background: selectedOption
                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                : '#cbd5e0',
              border: 'none',
              borderRadius: '12px',
              cursor: selectedOption ? 'pointer' : 'not-allowed',
              boxShadow: selectedOption ? '0 10px 30px rgba(102, 126, 234, 0.3)' : 'none',
              transition: 'all 0.3s ease',
            }}
          >
            Check Answer
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
          {isCorrect && data.feedback.correct.remark && (
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
              }}>
                💡 {data.feedback.correct.remark}
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
              {data.feedback.incorrect.hint}
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

// Page 7: Summary
function SummaryPage({ data }) {
  return (
    <div style={{
      maxWidth: '900px',
      margin: '0 auto',
      padding: '2rem',
    }}>
      <h2 style={{
        fontSize: '2.5rem',
        fontWeight: 700,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        textAlign: 'center',
        marginBottom: '2.5rem',
        letterSpacing: '-0.02em',
      }}>
        {data.prompt.heading}
      </h2>

      <div>
        {data.prompt.body.split('\n\n').map((para, idx) => {
          // Format bold text
          const parts = para.split('**');
          const formattedPara = parts.map((part, i) => {
            if (i % 2 === 1) {
              return <strong key={i} style={{
                color: '#667eea',
                fontWeight: 700,
                fontSize: '1.3rem',
              }}>{part}</strong>;
            }
            return part;
          });

          return (
            <p key={idx} style={{
              fontSize: '1.25rem',
              lineHeight: '1.9',
              color: '#2d3748',
              marginBottom: '2rem',
            }}>
              {formattedPara}
            </p>
          );
        })}
      </div>
    </div>
  );
}

// Page 5: Lag Plots Introduction
function LagPlotsIntroPage({ data }) {
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
          fontSize: '1.4rem',
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
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        textAlign: 'center',
        marginBottom: '2.5rem',
        letterSpacing: '-0.02em',
      }}>
        {data.prompt.heading}
      </h2>

      <div style={{ marginBottom: '2.5rem' }}>
        {data.prompt.body.split('\n\n').map((para, idx) => (
          <p key={idx} style={{
            fontSize: '1.25rem',
            lineHeight: '1.9',
            color: '#2d3748',
            marginBottom: '1.5rem',
            textAlign: 'center',
          }}>
            {renderFormattedText(para)}
          </p>
        ))}
      </div>

      {/* Styled Box */}
      <div style={{
        padding: '2rem',
        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%)',
        borderLeft: '5px solid #667eea',
        borderRadius: '12px',
        margin: '2.5rem 0',
        boxShadow: '0 10px 30px rgba(102, 126, 234, 0.15)',
      }}>
        {data.styledBox.content.split('\n\n').map((para, idx) => (
          <p key={idx} style={{
            fontSize: '1.2rem',
            fontWeight: 600,
            color: '#2d3748',
            fontFamily: 'monospace',
            margin: '0.5rem 0',
            lineHeight: '1.8',
          }}>
            {para}
          </p>
        ))}
      </div>

      {/* Explanation */}
      <div style={{ marginTop: '2.5rem' }}>
        {data.explanation.split('\n\n').map((para, idx) => (
          <p key={idx} style={{
            fontSize: '1.25rem',
            lineHeight: '1.9',
            color: '#2d3748',
            marginBottom: '1.5rem',
            textAlign: 'center',
          }}>
            {para}
          </p>
        ))}
      </div>
    </div>
  );
}

// Page 6: Correlation Ordering Question
function CorrelationOrderingQuestionPage({
  data,
  selectedOption,
  setSelectedOption,
  showFeedback,
  setShowFeedback,
  goToNextPage
}) {
  const handleCheck = () => {
    if (selectedOption) {
      setShowFeedback(true);
    }
  };

  const isCorrect = selectedOption === data.correctAnswer;

  return (
    <div style={{
      maxWidth: '1000px',
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

      <p style={{
        fontSize: '1.3rem',
        lineHeight: '1.9',
        color: '#2d3748',
        textAlign: 'center',
        marginBottom: '2.5rem',
      }}>
        {data.prompt.body}
      </p>

      {/* 2x2 Grid of Images */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '2rem',
        marginBottom: '2.5rem',
      }}>
        {data.images.map((img) => (
          <div key={img.id} style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem',
            padding: '1.5rem',
            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
            borderRadius: '12px',
            border: '2px solid #e2e8f0',
          }}>
            <p style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: '#667eea',
            }}>
              Plot {img.id}
            </p>
            <Image
              src={img.path}
              alt={img.alt}
              width={400}
              height={300}
              style={{
                borderRadius: '12px',
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
              }}
            />
          </div>
        ))}
      </div>

      {/* Options */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        marginBottom: '2rem',
      }}>
        {data.options.map((option) => {
          const isSelected = selectedOption === option.id;
          const isCorrectOption = option.id === data.correctAnswer;

          let backgroundColor = '#ffffff';
          let borderColor = '#e2e8f0';

          if (showFeedback) {
            if (isCorrectOption) {
              backgroundColor = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
              borderColor = '#10b981';
            } else if (isSelected && !isCorrectOption) {
              backgroundColor = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
              borderColor = '#ef4444';
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
                color: showFeedback && (isCorrectOption || (isSelected && !isCorrectOption)) ? 'white' : '#1a202c',
                background: backgroundColor,
                border: `3px solid ${borderColor}`,
                borderRadius: '12px',
                cursor: showFeedback ? 'default' : 'pointer',
                transition: 'all 0.3s ease',
                textAlign: 'center',
              }}
            >
              {option.text}
            </button>
          );
        })}
      </div>

      {/* Check Button */}
      {!showFeedback && (
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <button
            onClick={handleCheck}
            disabled={!selectedOption}
            style={{
              padding: '1rem 3rem',
              fontSize: '1.2rem',
              fontWeight: 700,
              color: 'white',
              background: selectedOption
                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                : '#cbd5e0',
              border: 'none',
              borderRadius: '12px',
              cursor: selectedOption ? 'pointer' : 'not-allowed',
              boxShadow: selectedOption ? '0 10px 30px rgba(102, 126, 234, 0.3)' : 'none',
              transition: 'all 0.3s ease',
            }}
          >
            Check Answer
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
          {isCorrect && data.feedback.correct.remark && (
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
              }}>
                {data.feedback.correct.remark}
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
              {data.feedback.incorrect.hint}
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

// Page 8: Thinking Page
function ThinkingPage({ data }) {
  return (
    <div style={{
      maxWidth: '900px',
      margin: '0 auto',
      padding: '2rem',
      textAlign: 'center',
    }}>
      <h2 style={{
        fontSize: '2.5rem',
        fontWeight: 700,
        color: '#1a202c',
        letterSpacing: '-0.02em',
        marginBottom: '2.5rem',
      }}>
        {data.prompt.heading}
      </h2>

      <p style={{
        fontSize: '1.3rem',
        lineHeight: '1.9',
        color: '#2d3748',
        marginBottom: '3rem',
      }}>
        {data.prompt.body}
      </p>

      {/* Big Thinking Emoji */}
      <div style={{
        fontSize: '10rem',
        marginBottom: '2rem',
      }}>
        {data.prompt.emoji}
      </div>
    </div>
  );
}

// Page 11: Equation Page
function EquationPage({ data }) {
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
        marginBottom: '2.5rem',
      }}>
        {data.prompt.heading}
      </h2>

      <p style={{
        fontSize: '1.25rem',
        lineHeight: '1.9',
        color: '#2d3748',
        textAlign: 'center',
        marginBottom: '3rem',
      }}>
        {data.prompt.body}
      </p>

      {/* Dramatic Equation Box */}
      <div style={{
        padding: '3rem',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '16px',
        boxShadow: '0 20px 50px rgba(102, 126, 234, 0.4)',
        margin: '2rem 0',
      }}>
        <p style={{
          fontSize: '2rem',
          fontWeight: 700,
          color: 'white',
          fontFamily: 'monospace',
          textAlign: 'center',
          margin: 0,
          letterSpacing: '0.05em',
        }}>
          {data.equation.content}
        </p>
      </div>

      {/* Explanation after equation */}
      {data.explanation && (
        <p style={{
          fontSize: '1.3rem',
          lineHeight: '1.9',
          color: '#2d3748',
          textAlign: 'center',
          marginTop: '2.5rem',
          fontWeight: 600,
        }}>
          {data.explanation}
        </p>
      )}
    </div>
  );
}

// Page 10: Predict the Change Page
function PredictChangePage({ data }) {
  const renderFormattedText = (text) => {
    if (!text) return null;
    const parts = text.split('**');
    return parts.map((part, idx) => {
      if (idx % 2 === 1) {
        return <strong key={idx} style={{
          background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontWeight: 700,
          fontSize: '1.4rem',
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
        marginBottom: '2.5rem',
      }}>
        {data.prompt.heading}
      </h2>

      <p style={{
        fontSize: '1.25rem',
        lineHeight: '1.9',
        color: '#2d3748',
        textAlign: 'center',
        marginBottom: '2.5rem',
      }}>
        {renderFormattedText(data.prompt.body)}
      </p>

      {/* Dramatic Text Box */}
      <div style={{
        padding: '2.5rem',
        background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)',
        borderRadius: '16px',
        boxShadow: '0 20px 50px rgba(245, 158, 11, 0.4)',
        margin: '2.5rem 0',
      }}>
        <h3 style={{
          fontSize: '3rem',
          fontWeight: 800,
          color: 'white',
          textAlign: 'center',
          margin: 0,
          letterSpacing: '0.02em',
        }}>
          {data.prompt.dramaticText}
        </h3>
      </div>

      {/* Explanation */}
      <div style={{
        padding: '2rem',
        background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(234, 88, 12, 0.1) 100%)',
        borderRadius: '12px',
        marginBottom: '1.5rem',
      }}>
        <p style={{
          fontSize: '1.3rem',
          lineHeight: '1.9',
          color: '#2d3748',
          textAlign: 'center',
          fontWeight: 600,
          margin: 0,
        }}>
          {data.explanation.part1}
        </p>
      </div>

      <div style={{ marginTop: '2rem' }}>
        {data.explanation.part2.split('\n\n').map((para, idx) => (
          <p key={idx} style={{
            fontSize: '1.25rem',
            lineHeight: '1.9',
            color: '#2d3748',
            textAlign: 'center',
            marginBottom: '1rem',
          }}>
            {para}
          </p>
        ))}
      </div>
    </div>
  );
}

// Page 8: Completion
function CompletionPage({ data, handleCompletion }) {
  // Format text with bold
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
        marginBottom: '3rem',
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
        onClick={handleCompletion}
        style={{
          padding: '1.2rem 3rem',
          fontSize: '1.2rem',
          fontWeight: 700,
          color: 'white',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          border: 'none',
          borderRadius: '12px',
          cursor: 'pointer',
          boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)',
          transition: 'all 0.3s ease',
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = 'translateY(-3px)';
          e.target.style.boxShadow = '0 15px 40px rgba(102, 126, 234, 0.4)';
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'translateY(0)';
          e.target.style.boxShadow = '0 10px 30px rgba(102, 126, 234, 0.3)';
        }}
      >
        Return to Linear Regression Module →
      </button>
    </div>
  );
}
