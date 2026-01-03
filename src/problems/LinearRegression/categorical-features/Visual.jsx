'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { markComplete } from '@/lib/completionTracker';
import { useRouter } from 'next/navigation';
import styles from './Visual.module.css';

/**
 * Multi-page Visual Component for "Categorical Features" Problem
 * Teaching ANOVA, T-tests, and Box Plots for categorical feature analysis
 */

export default function Visual({ problemInfo }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [csvData, setCsvData] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  // Separate state for each yes/no page to prevent persistence - ANSWER
  const [page6Answer, setPage6Answer] = useState(null);
  const [page7Answer, setPage7Answer] = useState(null);
  const [page8Answer, setPage8Answer] = useState(null);
  // Separate state for each yes/no page to prevent persistence - FEEDBACK
  const [page6ShowFeedback, setPage6ShowFeedback] = useState(false);
  const [page7ShowFeedback, setPage7ShowFeedback] = useState(false);
  const [page8ShowFeedback, setPage8ShowFeedback] = useState(false);
  const router = useRouter();

  const pages = problemInfo?.pages || [];
  const totalPages = problemInfo?.totalPages || 9;
  const currentPageData = pages.find(p => p.pageNumber === currentPage);

  // Load CSV data for page 2
  useEffect(() => {
    if (currentPage === 2) {
      fetch('/assets/LinearRegression/Anova/data.csv')
        .then(res => res.text())
        .then(text => {
          const rows = text.trim().split('\n');
          const headers = rows[0].split(',');
          const data = rows.slice(1).filter(row => row.trim()).map(row => {
            const values = row.split(',');
            return headers.reduce((obj, header, index) => {
              obj[header.trim()] = values[index]?.trim() || '';
              return obj;
            }, {});
          });
          setCsvData(data);
        })
        .catch(err => console.error('Error loading CSV:', err));
    }
  }, [currentPage]);

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
    markComplete('categorical-features');
    router.push('/module/LinearRegression');
  };

  // Render different page types
  const renderPageContent = () => {
    if (!currentPageData) return null;

    switch (currentPageData.type) {
      case 'introduction':
        return <IntroductionPage data={currentPageData} />;

      case 'data-with-question':
        return (
          <DataWithQuestionPage
            data={currentPageData}
            csvData={csvData}
            selectedOption={selectedOption}
            setSelectedOption={setSelectedOption}
            showFeedback={showFeedback}
            setShowFeedback={setShowFeedback}
            showAnswer={showAnswer}
            setShowAnswer={setShowAnswer}
            goToNextPage={goToNextPage}
          />
        );

      case 'explanation-with-resources':
        return <ExplanationWithResourcesPage data={currentPageData} />;

      case 'dramatic-quote':
        return <DramaticQuotePage data={currentPageData} />;

      case 'box-plot-intro':
        return <BoxPlotIntroPage data={currentPageData} />;

      case 'yes-no':
        // Use different state based on page number
        const getStateForPage = () => {
          if (currentPage === 6) return {
            answer: page6Answer,
            setAnswer: setPage6Answer,
            showFeedback: page6ShowFeedback,
            setShowFeedback: setPage6ShowFeedback
          };
          if (currentPage === 7) return {
            answer: page7Answer,
            setAnswer: setPage7Answer,
            showFeedback: page7ShowFeedback,
            setShowFeedback: setPage7ShowFeedback
          };
          if (currentPage === 8) return {
            answer: page8Answer,
            setAnswer: setPage8Answer,
            showFeedback: page8ShowFeedback,
            setShowFeedback: setPage8ShowFeedback
          };
          return {
            answer: null,
            setAnswer: () => {},
            showFeedback: false,
            setShowFeedback: () => {}
          };
        };

        const { answer, setAnswer, showFeedback: pageShowFeedback, setShowFeedback: setPageShowFeedback } = getStateForPage();

        return (
          <YesNoPage
            data={currentPageData}
            selectedAnswer={answer}
            setSelectedAnswer={setAnswer}
            showFeedback={pageShowFeedback}
            setShowFeedback={setPageShowFeedback}
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

// Page 1: Introduction
function IntroductionPage({ data }) {
  const formatText = (text) => {
    // Replace "correlation" with gradient text
    text = text.replace(/Correlation/g, '<span style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 700; font-size: 1.4rem;">Correlation</span>');

    // Bold important terms
    text = text.replace(/numerical features/g, '<strong style="color: #667eea; font-weight: 700;">numerical features</strong>');
    text = text.replace(/categorical/g, '<strong style="color: #667eea; font-weight: 700;">categorical</strong>');

    // Emphasize "can't just correlate"
    text = text.replace(/you can't just "correlate"/g, 'you <em style="font-style: italic; color: #ef4444; font-weight: 600;">can\'t just "correlate"</em>');

    return text;
  };

  return (
    <div className={styles.introPage}>
      <h2 className={styles.pageHeading}>{data.prompt.heading}</h2>
      <div className={styles.introBody}>
        {data.prompt.body.split('\n\n').map((para, idx) => {
          if (para.includes('car brand') || para.includes('Toyota')) {
            // Special formatting for examples paragraph
            return (
              <p key={idx} style={{
                fontSize: '1.25rem',
                lineHeight: '1.9',
                color: '#4a5568',
                textAlign: 'center',
                maxWidth: '700px',
                margin: '0 auto 1.5rem auto'
              }}>
                Things like <strong style={{ color: '#667eea', fontWeight: 700 }}>car brand</strong> (Toyota, Honda, BMW), <strong style={{ color: '#667eea', fontWeight: 700 }}>fuel type</strong> (Petrol, Diesel, Electric), or <strong style={{ color: '#667eea', fontWeight: 700 }}>transmission</strong> (Manual, Automatic)—you <em style={{ fontStyle: 'italic', color: '#ef4444', fontWeight: 600 }}>can't just "correlate"</em> these. They're categories, not numbers.
              </p>
            );
          }

          return (
            <p key={idx} style={{
              fontSize: '1.3rem',
              lineHeight: '1.9',
              color: '#2d3748',
              textAlign: 'center',
              maxWidth: '700px',
              margin: '0 auto 1.5rem auto',
              fontWeight: para.includes('how do you figure') ? 600 : 400
            }} dangerouslySetInnerHTML={{ __html: formatText(para) }}>
            </p>
          );
        })}
      </div>
    </div>
  );
}

// Page 2: Data Display with Question (MERGED)
function DataWithQuestionPage({ data, csvData, selectedOption, setSelectedOption, showFeedback, setShowFeedback, showAnswer, setShowAnswer, goToNextPage }) {
  if (!csvData || csvData.length === 0) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingSpinner}></div>
        <p className={styles.loadingText}>Loading data...</p>
      </div>
    );
  }

  const correctAnswer = data.question.correctAnswer;
  const isCorrect = selectedOption === correctAnswer;

  const handleCheckAnswer = () => {
    if (selectedOption) {
      setShowFeedback(true);
      setShowAnswer(false);
    }
  };

  const handleSeeAnswer = () => {
    setShowAnswer(true);
    setShowFeedback(false);
    setSelectedOption(correctAnswer);
  };

  const getOptionClass = (optionValue) => {
    if (showAnswer || (showFeedback && isCorrect)) {
      if (optionValue === correctAnswer) {
        return styles.correct;
      }
    }
    if (showFeedback && !isCorrect) {
      if (optionValue === correctAnswer) {
        return styles.correct;
      }
      if (optionValue === selectedOption) {
        return styles.incorrect;
      }
    }
    return selectedOption === optionValue ? styles.selected : '';
  };

  return (
    <div className={styles.dataWithQuestionPage}>
      <h2 className={styles.pageHeading}>{data.prompt.heading}</h2>

      {/* Introduction */}
      <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <p style={{ fontSize: '1.2rem', lineHeight: '1.8', color: '#4a5568', marginBottom: '0.5rem' }}>
          Consider the below:
        </p>
        <p style={{ fontSize: '1.25rem', lineHeight: '1.9', color: '#2d3748', fontWeight: 500 }}>
          A restaurant chain is trying to figure out what drives chef salaries. They've got data on <strong style={{ color: '#667eea', fontWeight: 700 }}>years of experience</strong>, <strong style={{ color: '#667eea', fontWeight: 700 }}>critic reviews</strong>, <strong style={{ color: '#667eea', fontWeight: 700 }}>cuisine specialization</strong>, and what each chef actually earns.
        </p>
      </div>

      {/* Data Table with emojis */}
      <div className={styles.tableContainer}>
        <table className={styles.dataTable}>
          <thead>
            <tr>
              <th className={styles.tableHeader}>👨‍🍳 Experience (Years)</th>
              <th className={styles.tableHeader}>⭐ Critic Review</th>
              <th className={styles.tableHeader}>🍽️ Cuisine</th>
              <th className={styles.tableHeader}>💰 Salary (INR Lakhs)</th>
            </tr>
          </thead>
          <tbody>
            {csvData.map((row, idx) => (
              <tr key={idx} className={styles.tableRow}>
                <td className={styles.tableCell}>{row['Experience (Years)']}</td>
                <td className={styles.tableCell}>{row['Critic Review']}</td>
                <td className={styles.tableCell}>{row['Cuisine']}</td>
                <td className={styles.tableCell}>{row['Salary (INR Lakhs)']}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Categorical Note */}
      <div style={{
        padding: '2rem',
        background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
        borderLeft: '5px solid #f59e0b',
        borderRadius: '12px',
        margin: '2.5rem 0',
        boxShadow: '0 4px 15px rgba(245, 158, 11, 0.15)'
      }}>
        <p style={{ fontSize: '1.2rem', lineHeight: '1.8', color: '#78350f', marginBottom: '1rem' }}>
          Two of these features are <strong style={{ color: '#92400e', fontWeight: 700 }}>categorical</strong>—they're not numbers, they're labels.
        </p>
        <p style={{ fontSize: '1.15rem', lineHeight: '1.7', color: '#78350f', marginBottom: '0.5rem' }}>
          <strong style={{ color: '#92400e', fontWeight: 700 }}>Critic Review:</strong> Excellent or Poor
        </p>
        <p style={{ fontSize: '1.15rem', lineHeight: '1.7', color: '#78350f' }}>
          <strong style={{ color: '#92400e', fontWeight: 700 }}>Cuisine:</strong> French or Italian
        </p>
      </div>

      {/* Question */}
      <div style={{ marginTop: '3rem' }}>
        <p style={{
          fontSize: '1.35rem',
          lineHeight: '1.8',
          color: '#1a202c',
          fontWeight: 600,
          textAlign: 'center',
          marginBottom: '2rem'
        }}>
          Your task is simple: Look at the data and tell - the salary does <em style={{ fontStyle: 'italic', color: '#ef4444', fontWeight: 700 }}>NOT</em> seem to depend heavily on which one of these categories?
        </p>

        <div className={styles.optionsGrid}>
          {data.question.options.map((option) => (
            <button
              key={option.value}
              onClick={() => !showFeedback && !showAnswer && setSelectedOption(option.value)}
              className={`${styles.optionCard} ${getOptionClass(option.value)}`}
              disabled={showFeedback || showAnswer}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className={styles.buttonGroup}>
          <button
            onClick={handleCheckAnswer}
            className={styles.checkButton}
            disabled={!selectedOption || showFeedback || showAnswer}
          >
            Check Answer
          </button>
          <button onClick={handleSeeAnswer} className={styles.seeAnswerButton}>
            See Answer
          </button>
        </div>

        {showFeedback && (
          <div className={`${styles.feedbackBox} ${isCorrect ? styles.correctFeedback : styles.incorrectFeedback}`}>
            <h3 className={styles.feedbackTitle}>
              {isCorrect ? data.question.feedback.correct.title : data.question.feedback.incorrect.title}
            </h3>
            <p className={styles.feedbackMessage}>
              {isCorrect ? data.question.feedback.correct.remark : data.question.feedback.incorrect.remark}
            </p>
            {/* Show continue button for BOTH correct and incorrect */}
            <button onClick={goToNextPage} className={styles.continueButton}>
              Continue →
            </button>
          </div>
        )}

        {showAnswer && (
          <div className={`${styles.feedbackBox} ${styles.answerFeedback}`}>
            <h3 className={styles.feedbackTitle}>{data.question.feedback.correct.title}</h3>
            <p className={styles.feedbackMessage}>{data.question.feedback.correct.remark}</p>
            <button onClick={goToNextPage} className={styles.continueButton}>
              Continue →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Page 3: Explanation with Resources (T-test and ANOVA)
function ExplanationWithResourcesPage({ data }) {
  const [openDropdowns, setOpenDropdowns] = useState({});

  const toggleDropdown = (sectionTitle) => {
    setOpenDropdowns(prev => ({
      ...prev,
      [sectionTitle]: !prev[sectionTitle]
    }));
  };

  return (
    <div className={styles.explanationPage}>
      <h2 className={styles.pageHeading}>{data.prompt.heading}</h2>

      {/* Introduction with beautiful formatting */}
      <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
        <p style={{
          fontSize: '1.3rem',
          lineHeight: '1.9',
          color: '#2d3748',
          maxWidth: '700px',
          margin: '0 auto'
        }}>
          When the patterns are <em style={{ fontStyle: 'italic', color: '#667eea' }}>subtle</em>, mathematical ways for deciding whether a categorical feature actually matters.
        </p>
      </div>

      <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <p style={{ fontSize: '1.2rem', lineHeight: '1.8', color: '#4a5568' }}>
          For <strong style={{ color: '#667eea', fontWeight: 700 }}>binary categories</strong> (like Excellent vs Poor), we use <span style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 700,
            fontSize: '1.3rem'
          }}>T-Tests</span>.
        </p>
        <p style={{ fontSize: '1.2rem', lineHeight: '1.8', color: '#4a5568', marginTop: '1rem' }}>
          For categories with <strong style={{ color: '#667eea', fontWeight: 700 }}>more than two groups</strong> (like Maharashtra, Karnataka, Tamil Nadu—the state you belong to), we use <span style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 700,
            fontSize: '1.3rem'
          }}>ANOVA</span>.
        </p>
      </div>

      {data.sections.map((section, idx) => (
        <div key={idx} className={styles.resourceSection}>
          <h3 style={{
            fontSize: '2rem',
            fontWeight: 700,
            color: '#1a202c',
            marginBottom: '1rem'
          }}>
            {section.title}
          </h3>
          <p style={{
            fontSize: '1.15rem',
            lineHeight: '1.8',
            color: '#4a5568',
            marginBottom: '1.5rem'
          }}>
            {section.description}
          </p>

          {section.image && (
            <div className={styles.resourceImage}>
              <Image
                src={section.image}
                alt={section.title}
                width={600}
                height={300}
                className={styles.resourceImageImg}
              />
            </div>
          )}

          {/* Resource Dropdown */}
          <div className={styles.resourceDropdown}>
            <div
              className={styles.resourceDropdownHeader}
              onClick={() => toggleDropdown(section.title)}
            >
              <p className={styles.resourceDropdownTitle}>
                📚 Learn More about {section.title}
              </p>
              <span className={`${styles.resourceDropdownIcon} ${openDropdowns[section.title] ? styles.open : ''}`}>
                ▼
              </span>
            </div>
            {openDropdowns[section.title] && (
              <div className={styles.resourceDropdownContent}>
                {section.resources.map((url, urlIdx) => (
                  <a
                    key={urlIdx}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.resourceLink}
                  >
                    {url}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// Page 4: Dramatic Quote
function DramaticQuotePage({ data }) {
  return (
    <div className={styles.dramaticQuotePage}>
      <h2 className={styles.pageHeading}>{data.prompt.heading}</h2>
      <div className={styles.dramaticQuoteBody}>
        <p style={{
          fontSize: '1.3rem',
          color: '#2d3748',
          textAlign: 'center',
          marginBottom: '3rem',
          fontWeight: 600
        }}>
          {data.prompt.body}
        </p>
        <div className={styles.dramaticQuotes}>
          {data.quotes.map((quote, idx) => (
            <div key={idx} style={{
              padding: '3rem',
              background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
              borderLeft: '6px solid #667eea',
              borderRadius: '12px',
              boxShadow: '0 8px 25px rgba(102, 126, 234, 0.15)',
              marginBottom: idx < data.quotes.length - 1 ? '2.5rem' : 0
            }}>
              <p style={{
                fontSize: '1.5rem',
                fontWeight: 700,
                fontStyle: 'italic',
                color: '#1a202c',
                margin: 0,
                lineHeight: '1.6',
                textAlign: 'center'
              }}>
                {quote}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Page 5: Box Plot Introduction
function BoxPlotIntroPage({ data }) {
  return (
    <div className={styles.boxPlotIntroPage}>
      <h2 className={styles.pageHeading}>{data.prompt.heading}</h2>
      <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <p style={{
          fontSize: '1.3rem',
          lineHeight: '1.9',
          color: '#2d3748',
          maxWidth: '700px',
          margin: '0 auto 1rem auto'
        }}>
          Luckily for us, one easy way is to look at the <span style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 700,
            fontSize: '1.4rem'
          }}>Box Plot</span>!
        </p>
        <p style={{
          fontSize: '1.2rem',
          lineHeight: '1.8',
          color: '#4a5568',
          maxWidth: '700px',
          margin: '0 auto'
        }}>
          A Box Plot first represents various categories as blocks and then represents the range of target values they cover
        </p>
      </div>

      <div className={styles.boxPlotImageContainer}>
        <Image
          src={data.image}
          alt="Box Plot Example"
          width={800}
          height={500}
          className={styles.boxPlotImage}
        />
      </div>

      <div style={{
        marginTop: '3rem',
        padding: '2.5rem',
        background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
        borderLeft: '5px solid #f59e0b',
        borderRadius: '12px',
        boxShadow: '0 4px 15px rgba(245, 158, 11, 0.15)'
      }}>
        <p style={{
          fontSize: '1.3rem',
          fontWeight: 700,
          color: '#78350f',
          marginBottom: '1.5rem'
        }}>
          As you can see:
        </p>
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
    </div>
  );
}

// Pages 6-8: Yes/No Questions
function YesNoPage({ data, selectedAnswer, setSelectedAnswer, showFeedback, setShowFeedback, goToNextPage }) {
  const correctAnswer = data.correctAnswer;
  const isCorrect = selectedAnswer === correctAnswer;

  const handleAnswer = (answer) => {
    setSelectedAnswer(answer);
    setShowFeedback(true);
  };

  const getButtonClass = (answer) => {
    if (!showFeedback) {
      return selectedAnswer === answer ? styles.selected : '';
    }
    if (answer === correctAnswer) {
      return styles.correct;
    }
    if (answer === selectedAnswer && answer !== correctAnswer) {
      return styles.incorrect;
    }
    return '';
  };

  return (
    <div className={styles.yesNoPage}>
      <h2 className={styles.pageHeading}>{data.prompt.heading}</h2>
      <div className={styles.promptBody}>
        <p style={{ fontSize: '1.2rem', lineHeight: '1.9', color: '#2d3748', marginBottom: '2rem' }}>
          {data.prompt.body}
        </p>
      </div>

      <div className={styles.boxPlotImageContainer}>
        <Image
          src={data.image}
          alt="Box Plot Analysis"
          width={700}
          height={450}
          className={styles.boxPlotImage}
        />
      </div>

      <div className={styles.yesNoButtons}>
        <button
          onClick={() => handleAnswer('yes')}
          className={`${styles.yesNoButton} ${getButtonClass('yes')}`}
          disabled={showFeedback}
        >
          Yes
        </button>
        <button
          onClick={() => handleAnswer('no')}
          className={`${styles.yesNoButton} ${getButtonClass('no')}`}
          disabled={showFeedback}
        >
          No
        </button>
      </div>

      {showFeedback && (
        <div className={`${styles.feedbackBox} ${isCorrect ? styles.correctFeedback : styles.incorrectFeedback}`}>
          <h3 className={styles.feedbackTitle}>
            {isCorrect ? 'Correct! ✓' : 'Incorrect ✗'}
          </h3>
          <p className={styles.feedbackMessage}>{data.remark}</p>
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
        <h1 className={styles.completionHeading}>{data.prompt.heading}</h1>
        <p className={styles.completionMessage}>{data.prompt.body}</p>
        <button onClick={handleCompletion} className={styles.returnButton}>
          Return to Modules
        </button>
      </div>
    </div>
  );
}
