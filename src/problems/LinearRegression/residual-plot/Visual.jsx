'use client';

import { useState } from 'react';
import Image from 'next/image';
import { markComplete } from '@/lib/completionTracker';
import { useRouter } from 'next/navigation';
import styles from './Visual.module.css';

/**
 * Multi-page Visual Component for "To Err is Human!" Problem
 * Beautiful residual plot analysis teaching component
 */

export default function Visual({ problemInfo }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const router = useRouter();

  const pages = problemInfo?.pages || [];
  const totalPages = problemInfo?.totalPages || 9;
  const currentPageData = pages.find(p => p.pageNumber === currentPage);

  // Navigation handlers
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      setShowFeedback(false);
      setShowAnswer(false);
      setSelectedOption(null);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      setShowFeedback(false);
      setShowAnswer(false);
    }
  };

  const handleCompletion = () => {
    markComplete('residual-plot');
    router.push('/');
  };

  // Render different page types
  const renderPageContent = () => {
    if (!currentPageData) return null;

    switch (currentPageData.type) {
      case 'quote':
        return <QuotePage data={currentPageData} />;

      case 'explanation':
        return <ExplanationPage data={currentPageData} />;

      case 'galton-quote':
        return <GaltonQuotePage data={currentPageData} />;

      case 'multiple-choice':
        return (
          <MultipleChoicePage
            data={currentPageData}
            selectedOption={selectedOption}
            setSelectedOption={setSelectedOption}
            showFeedback={showFeedback}
            setShowFeedback={setShowFeedback}
            showAnswer={showAnswer}
            setShowAnswer={setShowAnswer}
            goToNextPage={handleCompletion}
          />
        );

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

        {!currentPageData?.hasNextButton && currentPage < totalPages && currentPageData?.type !== 'multiple-choice' && (
          <div style={{ width: '120px' }}></div>
        )}

        {currentPageData?.type === 'multiple-choice' && (
          <div style={{ width: '120px' }}></div>
        )}
      </div>
    </div>
  );
}

// Page 1: Dramatic Quote Page
function QuotePage({ data }) {
  return (
    <div className={styles.quotePage}>
      <div className={styles.quoteContainer}>
        <h1 className={styles.quoteHeading}>{data.prompt.heading}</h1>
        <div className={styles.dramaticQuote}>
          <p className={styles.quoteText}>{data.prompt.quote}</p>
        </div>
      </div>
    </div>
  );
}

// Pages 2, 4-8: Explanation Pages
function ExplanationPage({ data }) {
  const [isResourceOpen, setIsResourceOpen] = useState(false);

  // Helper to render formatted text with bold
  const renderFormattedText = (text) => {
    if (!text) return null;
    const parts = text.split('**');
    return parts.map((part, idx) => {
      if (idx % 2 === 1) {
        return <strong key={idx} style={{ color: '#1a202c', fontWeight: 700 }}>{part}</strong>;
      }
      return part;
    });
  };

  return (
    <div className={styles.explanationPage}>
      <h2 className={styles.pageHeading}>{data.prompt.heading}</h2>

      <div className={styles.explanationBody}>
        {data.prompt.body.split('\n\n').map((para, idx) => (
          <p key={idx} className={styles.explanationParagraph}>
            {renderFormattedText(para)}
          </p>
        ))}
      </div>

      {/* Image */}
      {data.image && (
        <div className={styles.imageContainer}>
          <Image
            src={data.image.path}
            alt={data.image.alt}
            width={800}
            height={500}
            className={styles.contentImage}
          />
          {data.image.caption && (
            <p className={styles.imageCaption}>{data.image.caption}</p>
          )}
        </div>
      )}

      {/* Formula Image */}
      {data.formulaImage && (
        <div className={styles.formulaContainer}>
          <p className={styles.formulaLabel}>The formula is given by:</p>
          <Image
            src={data.formulaImage.path}
            alt={data.formulaImage.alt}
            width={600}
            height={200}
            className={styles.formulaImage}
          />
        </div>
      )}

      {/* Formula Explanation */}
      {data.formulaExplanation && (
        <div className={styles.formulaExplanation}>
          {data.formulaExplanation.split('\n\n').map((para, idx) => (
            <p key={idx} className={styles.formulaText}>
              {renderFormattedText(para)}
            </p>
          ))}
        </div>
      )}

      {/* Credit */}
      {data.credit && (
        <div className={styles.credit}>
          <p>
            Credit: <a href={data.credit} target="_blank" rel="noopener noreferrer" className={styles.creditLink}>
              {data.credit}
            </a>
          </p>
        </div>
      )}

      {/* Note */}
      {data.note && (
        <div className={styles.noteBox}>
          <p className={styles.noteText}>
            <strong>Note:</strong> {data.note}
          </p>
        </div>
      )}

      {/* Additional Explanation */}
      {data.explanation && (
        <div className={styles.additionalExplanation}>
          {data.explanation.split('\n\n').map((para, idx) => (
            <p key={idx} className={styles.explanationParagraph}>
              {renderFormattedText(para)}
            </p>
          ))}
        </div>
      )}

      {/* Definition Box */}
      {data.definition && (
        <div className={styles.definitionBox}>
          {data.definition.split('\n\n').map((para, idx) => (
            <p key={idx} className={styles.definitionText}>
              {renderFormattedText(para)}
            </p>
          ))}
        </div>
      )}

      {/* Resources Dropdown */}
      {data.resources && data.resources.length > 0 && (
        <div className={styles.resourceDropdown}>
          <div
            className={styles.resourceDropdownHeader}
            onClick={() => setIsResourceOpen(!isResourceOpen)}
          >
            <p className={styles.resourceDropdownTitle}>
              📚 Resources to learn more
            </p>
            <span className={`${styles.resourceDropdownIcon} ${isResourceOpen ? styles.open : ''}`}>
              ▼
            </span>
          </div>
          <div className={`${styles.resourceDropdownContent} ${isResourceOpen ? styles.open : ''}`}>
            {isResourceOpen && (
              <div className={styles.resourceList}>
                {data.resources.map((resource, idx) => (
                  <a
                    key={idx}
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.resourceLink}
                  >
                    {resource.text}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Page 3: Sir Francis Galton Quote Page
function GaltonQuotePage({ data }) {
  return (
    <div className={styles.galtonPage}>
      <h2 className={styles.pageHeading}>{data.prompt.heading}</h2>

      {data.image && (
        <div className={styles.galtonImageContainer}>
          <Image
            src={data.image.path}
            alt={data.image.alt}
            width={400}
            height={500}
            className={styles.galtonImage}
          />
        </div>
      )}

      <div className={styles.galtonQuote}>
        <p className={styles.galtonText}>
          {data.body.split('**').map((part, idx) => {
            if (idx % 2 === 1) {
              return <strong key={idx} style={{ color: '#667eea', fontWeight: 700, fontSize: '1.35rem' }}>{part}</strong>;
            }
            return part;
          })}
        </p>
      </div>
    </div>
  );
}

// Page 9: Multiple Choice Question
function MultipleChoicePage({
  data,
  selectedOption,
  setSelectedOption,
  showFeedback,
  setShowFeedback,
  showAnswer,
  setShowAnswer,
  goToNextPage
}) {
  const handleCheck = () => {
    setShowFeedback(true);
    setShowAnswer(false);
  };

  const handleSeeAnswer = () => {
    setShowAnswer(true);
    setShowFeedback(false);
  };

  const isCorrect = selectedOption === data.correctAnswer;

  return (
    <div className={styles.multipleChoicePage}>
      <h2 className={styles.pageHeading}>{data.prompt.heading}</h2>

      <div className={styles.promptBody}>
        <p className={styles.questionIntro}>{data.prompt.body}</p>
      </div>

      {/* Residual Plot Image */}
      {data.image && (
        <div className={styles.questionImageContainer}>
          <Image
            src={data.image.path}
            alt={data.image.alt}
            width={700}
            height={400}
            className={styles.questionImage}
          />
        </div>
      )}

      {/* Question */}
      <div className={styles.questionBox}>
        <p className={styles.questionText}>{data.question}</p>
      </div>

      {/* Options */}
      <div className={styles.optionsContainer}>
        {data.options.map((option) => (
          <button
            key={option.id}
            onClick={() => setSelectedOption(option.id)}
            className={`${styles.optionCard} ${
              selectedOption === option.id ? styles.selected : ''
            }`}
          >
            <span className={styles.optionText}>{option.text}</span>
            {selectedOption === option.id && (
              <span className={styles.checkmark}>✓</span>
            )}
          </button>
        ))}
      </div>

      {/* Action Buttons */}
      <div className={styles.buttonGroup}>
        <button
          onClick={handleCheck}
          className={styles.checkButton}
          disabled={!selectedOption}
        >
          Check Answer
        </button>
        <button onClick={handleSeeAnswer} className={styles.seeAnswerButton}>
          See Answer
        </button>
      </div>

      {/* Feedback */}
      {showFeedback && selectedOption && (
        <div className={`${styles.feedbackBox} ${isCorrect ? styles.correct : styles.incorrect}`}>
          <h3 className={styles.feedbackTitle}>
            {isCorrect ? data.feedback.correct.title : data.feedback.incorrect.title}
          </h3>
          <p className={styles.feedbackMessage}>
            {isCorrect ? data.feedback.correct.message : data.feedback.incorrect.message}
          </p>
          {isCorrect && data.feedback.correct.explanation && (
            <div className={styles.explanationBox}>
              <p className={styles.explanationText}>{data.feedback.correct.explanation}</p>
              {data.feedback.correct.remark && (
                <p className={styles.remarkText}>{data.feedback.correct.remark}</p>
              )}
            </div>
          )}
          {!isCorrect && data.feedback.incorrect.hint && (
            <p className={styles.hintText}>{data.feedback.incorrect.hint}</p>
          )}
          {isCorrect && (
            <button onClick={goToNextPage} className={styles.continueButton}>
              Complete Challenge
            </button>
          )}
        </div>
      )}

      {/* Answer Explanation */}
      {showAnswer && (
        <div className={`${styles.feedbackBox} ${styles.answer}`}>
          <h3 className={styles.feedbackTitle}>{data.answerExplanation.title}</h3>
          <div className={styles.answerContent}>
            {data.answerExplanation.body.split('\n\n').map((para, idx) => (
              <p key={idx} className={styles.answerParagraph}>
                {para.split('**').map((part, i) => {
                  if (i % 2 === 1) {
                    return <strong key={i} style={{ fontWeight: 700 }}>{part}</strong>;
                  }
                  return part;
                })}
              </p>
            ))}
          </div>
          <button onClick={goToNextPage} className={styles.continueButton}>
            Complete Challenge
          </button>
        </div>
      )}
    </div>
  );
}
