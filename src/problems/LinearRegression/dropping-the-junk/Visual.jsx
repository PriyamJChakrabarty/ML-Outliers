'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { markComplete } from '@/lib/completionTracker';
import { useRouter } from 'next/navigation';
import styles from './Visual.module.css';

/**
 * Multi-page Visual Component for "Dropping the Junk" Problem
 * Beautiful, full-page design with stunning feedback cards and formatting
 */

export default function Visual({ problemInfo }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedFeatures, setSelectedFeatures] = useState(new Set());
  const [showFeedback, setShowFeedback] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [csvData, setCsvData] = useState([]);
  const [selectedFeaturesPage4, setSelectedFeaturesPage4] = useState(new Set());
  const [showFeedbackPage4, setShowFeedbackPage4] = useState(false);
  const [showAnswerPage4, setShowAnswerPage4] = useState(false);
  const router = useRouter();

  const pages = problemInfo?.pages || [];
  const totalPages = problemInfo?.totalPages || 5;
  const currentPageData = pages.find(p => p.pageNumber === currentPage);

  // Load CSV data for page 4
  useEffect(() => {
    if (currentPage === 4) {
      fetch('/assets/LinearRegression/Correlation/data.csv')
        .then(res => res.text())
        .then(text => {
          const rows = text.trim().split('\n');
          const headers = rows[0].split(',');
          const data = rows.slice(1).map(row => {
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
      setSelectedFeatures(new Set());
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      setShowFeedback(false);
      setShowAnswer(false);
    }
  };

  const handleCompletion = async () => {
    // Mark the problem as complete regardless of answer correctness
    try {
      await fetch('/api/mark-complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problemSlug: 'dropping-the-junk' }),
      });
    } catch (error) {
      console.error('Error marking problem complete:', error);
    }

    // Update localStorage (legacy) and dispatch event
    markComplete('dropping-the-junk');
    window.dispatchEvent(new CustomEvent('completion-updated', {
      detail: { problemSlug: 'dropping-the-junk' }
    }));

    router.push('/module/LinearRegression');
  };

  // Feature selection handlers
  const toggleFeature = (featureName) => {
    const newSelected = new Set(selectedFeatures);
    if (newSelected.has(featureName)) {
      newSelected.delete(featureName);
    } else {
      newSelected.add(featureName);
    }
    setSelectedFeatures(newSelected);
  };

  const checkAnswers = () => {
    const correctAnswers = currentPageData?.correctAnswers || [];
    const selectedArray = Array.from(selectedFeatures);

    const isCorrect =
      correctAnswers.length === selectedArray.length &&
      correctAnswers.every(ans => selectedFeatures.has(ans));

    setShowFeedback(true);
    setShowAnswer(false);

    return isCorrect;
  };

  const handleSeeAnswer = () => {
    setShowAnswer(true);
    setShowFeedback(false);
  };

  // Render different page types
  const renderPageContent = () => {
    if (!currentPageData) return null;

    switch (currentPageData.type) {
      case 'introduction':
        return <IntroductionPage data={currentPageData} />;

      case 'multiple-choice':
        return (
          <MultipleChoicePage
            data={currentPageData}
            selectedFeatures={selectedFeatures}
            toggleFeature={toggleFeature}
            checkAnswers={checkAnswers}
            showFeedback={showFeedback}
            showAnswer={showAnswer}
            handleSeeAnswer={handleSeeAnswer}
            goToNextPage={goToNextPage}
          />
        );

      case 'explanation':
        return <ExplanationPage data={currentPageData} />;

      case 'data-analysis':
        return (
          <DataAnalysisPage
            data={currentPageData}
            csvData={csvData}
            selectedFeatures={selectedFeaturesPage4}
            setSelectedFeatures={setSelectedFeaturesPage4}
            showFeedback={showFeedbackPage4}
            setShowFeedback={setShowFeedbackPage4}
            showAnswer={showAnswerPage4}
            setShowAnswer={setShowAnswerPage4}
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

        {!currentPageData?.hasNextButton && currentPage < totalPages && currentPageData?.type !== 'data-analysis' && currentPageData?.type !== 'completion' && (
          <div style={{ width: '120px' }}></div>
        )}

        {currentPageData?.type === 'completion' && (
          <div style={{ width: '120px' }}></div>
        )}
      </div>
    </div>
  );
}

// Page 1: Introduction
function IntroductionPage({ data }) {
  return (
    <div className={styles.introPage}>
      <h2 className={styles.pageHeading}>{data.prompt.heading}</h2>
      <div className={styles.introBody}>
        {data.prompt.body.split('\n\n').map((para, idx) => (
          <p key={idx} className={styles.introParagraph}>{para}</p>
        ))}
      </div>
    </div>
  );
}

// Page 2: Zombie Survival Multiple Choice
function MultipleChoicePage({
  data,
  selectedFeatures,
  toggleFeature,
  checkAnswers,
  showFeedback,
  showAnswer,
  handleSeeAnswer,
  goToNextPage
}) {
  const [localFeedback, setLocalFeedback] = useState(null);

  const handleCheck = () => {
    const isCorrect = checkAnswers();
    setLocalFeedback(isCorrect);
  };

  // Render formatted text
  const renderFormattedText = (text) => {
    const parts = text.split('**');
    return parts.map((part, idx) => {
      if (idx % 2 === 1) {
        return <strong key={idx} style={{ color: '#1a202c', fontWeight: 700 }}>{part}</strong>;
      }
      return part;
    });
  };

  return (
    <div className={styles.multipleChoicePage}>
      <h2 className={styles.pageHeading}>{data.prompt.heading}</h2>
      <div className={styles.promptBody}>
        <p style={{ fontSize: '1.2rem', lineHeight: '1.9', color: '#2d3748', marginBottom: '1rem' }}>
          Sometimes you can just <em style={{ fontStyle: 'italic', color: '#5a67d8' }}>see</em> which features aren't important—no fancy math needed. Just <strong style={{ color: '#1a202c', fontWeight: 700 }}>common sense</strong>.
        </p>
        <p style={{ fontSize: '1.2rem', lineHeight: '1.9', color: '#2d3748', marginBottom: '1rem' }}>
          <strong style={{ color: '#ef4444', fontWeight: 700 }}>The year is 2050.</strong> A zombie virus has taken over the world. You are the <span style={{ color: '#667eea', fontWeight: 600 }}>Chief Data Scientist</span> for the last human sanctuary. You have a historical dataset of survivors from the "Outlands," and your job is to build a Linear Regression model to predict how many <strong style={{ color: '#10b981', fontWeight: 700 }}>Days</strong> a new survivor will last outside the walls based on their attributes.
        </p>
        <p style={{ fontSize: '1.3rem', fontWeight: 600, color: '#2d3748', marginTop: '2rem' }}>
          Which of the following features do you think are worthy of dropping?
        </p>
        <p style={{
          fontSize: '1.1rem',
          lineHeight: '1.8',
          color: '#4a5568',
          marginTop: '1rem',
          fontStyle: 'italic',
          padding: '1rem 1.5rem',
          background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%)',
          borderRadius: '12px',
          border: '1px solid rgba(102, 126, 234, 0.2)',
        }}>
          (We are not concerned with features that are similar, but more with{' '}
          <strong style={{
            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 800,
            fontSize: '1.15rem',
          }}>Features that do not have much influence on the No. of Days Survived (the target variable)</strong>)
        </p>
      </div>

      <div className={styles.featureGrid}>
        {data.features.map((feature) => (
          <button
            key={feature.name}
            onClick={() => toggleFeature(feature.name)}
            className={`${styles.featureCard} ${
              selectedFeatures.has(feature.name) ? styles.selected : ''
            }`}
          >
            <span className={styles.featureName}>
              {feature.name.replace(/_/g, ' ')}
            </span>
            {selectedFeatures.has(feature.name) && (
              <span className={styles.checkmark}>✓</span>
            )}
          </button>
        ))}
      </div>

      <div className={styles.buttonGroup}>
        <button onClick={handleCheck} className={styles.checkButton}>
          Check Answer
        </button>
        <button onClick={handleSeeAnswer} className={styles.seeAnswerButton}>
          See the Solution!
        </button>
      </div>

      {showFeedback && localFeedback !== null && (
        <div className={`${styles.feedbackBox} ${localFeedback ? styles.correct : styles.incorrect}`}>
          {localFeedback ? (
            <>
              <h3 className={styles.feedbackTitle}>Perfect! 🎉</h3>
              <p className={styles.feedbackMessage}>
                You identified the irrelevant features correctly! Instagram followers, lucky numbers,
                and shoe brands have <em style={{ fontStyle: 'italic' }}>nothing</em> to do with zombie survival.
              </p>
              <button onClick={goToNextPage} className={styles.continueButton}>
                Continue →
              </button>
            </>
          ) : (
            <>
              <h3 className={styles.feedbackTitle}>Think More 🧟‍♂️</h3>
              <p className={styles.feedbackMessage}>
                Can you not see some features that ain't saving you from those <strong>Zom-Zom bites?</strong>
              </p>
            </>
          )}
        </div>
      )}

      {showAnswer && (
        <div className={`${styles.feedbackBox} ${styles.answer}`}>
          <h3 className={styles.feedbackTitle}>The Answer 📝</h3>
          <p className={styles.feedbackMessage}>
            Here are the features that should be dropped:
          </p>
          <div className={styles.answerList}>
            <h4>Irrelevant Features:</h4>
            <ul>
              {data.correctAnswers.map((answer) => (
                <li key={answer}>{answer.replace(/_/g, ' ')}</li>
              ))}
            </ul>
          </div>
          <p className={styles.feedbackMessage} style={{ marginTop: '1.5rem', fontSize: '1.1rem', fontStyle: 'italic' }}>
            These features have <strong>no logical connection</strong> to survival in a zombie apocalypse.
            Physical attributes, skills, and resources matter—not fashion choices or social media! 💪
          </p>
          <button onClick={goToNextPage} className={styles.continueButton}>
            Continue →
          </button>
        </div>
      )}
    </div>
  );
}

// Page 3: Correlation Explanation with Dropdown
function ExplanationPage({ data }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <div className={styles.explanationPage}>
      <h2 className={styles.pageHeading}>{data.prompt.heading}</h2>

      <div className={styles.explanationBody}>
        <p style={{ fontSize: '1.2rem', lineHeight: '1.9', color: '#2d3748', marginBottom: '1.5rem' }}>
          But it's not always so easy to see the data and find out the redundant features!
        </p>
        <p style={{ fontSize: '1.2rem', lineHeight: '1.9', color: '#2d3748', marginBottom: '1.5rem' }}>
          It's better to rely on <strong style={{ color: '#ef4444', fontWeight: 700, fontSize: '1.3rem' }}>Math</strong>!
        </p>
        <p style={{ fontSize: '1.2rem', lineHeight: '1.9', color: '#2d3748', marginBottom: '2rem' }}>
          This is where <span className={styles.standoutDefinition}>CORRELATION</span> comes in!
        </p>
        <p style={{ fontSize: '1.2rem', lineHeight: '1.9', color: '#2d3748' }}>
          Two variables are said to be <strong style={{ color: '#667eea', fontWeight: 700 }}>correlated</strong> if a change in one causes a corresponding change in the other variable.
        </p>
      </div>

      {/* Resource Dropdown */}
      <div className={styles.resourceDropdown}>
        <div
          className={styles.resourceDropdownHeader}
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          <p className={styles.resourceDropdownTitle}>
            📚 Resources to learn more about Correlation
          </p>
          <span className={`${styles.resourceDropdownIcon} ${isDropdownOpen ? styles.open : ''}`}>
            ▼
          </span>
        </div>
        <div className={`${styles.resourceDropdownContent} ${isDropdownOpen ? styles.open : ''}`}>
          {isDropdownOpen && (
            <div style={{ paddingTop: '1rem' }}>
              <a
                href={data.resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.resourceLink}
              >
                {data.resource.text}
              </a>
            </div>
          )}
        </div>
      </div>

      {data.keyPoint && (
        <div className={styles.keyPointBox}>
          <div className={styles.keyPointIcon}>💡</div>
          <p className={styles.keyPoint}>{data.keyPoint}</p>
        </div>
      )}
    </div>
  );
}

// Page 4: Data Analysis with Code Box, Plot, and Selection
function DataAnalysisPage({
  data,
  csvData,
  selectedFeatures,
  setSelectedFeatures,
  showFeedback,
  setShowFeedback,
  showAnswer,
  setShowAnswer,
  goToNextPage
}) {
  const [showPlot, setShowPlot] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleShowCorrelation = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setShowPlot(true);
    }, 1500);
  };

  const toggleFeature = (featureName) => {
    const newSelected = new Set(selectedFeatures);
    if (newSelected.has(featureName)) {
      newSelected.delete(featureName);
    } else {
      newSelected.add(featureName);
    }
    setSelectedFeatures(newSelected);
  };

  const checkAnswers = () => {
    const correctAnswers = data.selectionQuestion?.correctAnswers || [];
    const selectedArray = Array.from(selectedFeatures);

    const isCorrect =
      correctAnswers.length === selectedArray.length &&
      correctAnswers.every(ans => selectedFeatures.has(ans));

    setShowFeedback(true);
    setShowAnswer(false);

    return isCorrect;
  };

  const handleSeeAnswer = () => {
    setShowAnswer(true);
    setShowFeedback(false);
  };

  if (!csvData || csvData.length === 0) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingSpinner}></div>
        <p className={styles.loadingText}>Loading data...</p>
      </div>
    );
  }

  const headers = Object.keys(csvData[0]);

  return (
    <div className={styles.dataAnalysisPage}>
      <h2 className={styles.pageHeading}>{data.prompt.heading}</h2>

      <div className={styles.promptBody}>
        <p style={{ fontSize: '1.2rem', lineHeight: '1.9', color: '#2d3748', marginBottom: '1rem' }}>
          Consider the following problem: You're helping a <strong style={{ color: '#667eea', fontWeight: 700 }}>used car dealer</strong> predict selling prices. They've been tracking everything—odometer readings, car age, horsepower, even the owner's age and highway driving habits.
        </p>

        <div style={{ margin: '2rem 0' }}>
          <p style={{ fontSize: '1.15rem', fontWeight: 600, color: '#2d3748', marginBottom: '1rem' }}>
            <strong style={{ color: '#10b981' }}>Features:</strong>
          </p>
          <ul style={{ listStyle: 'none', padding: '0 0 0 1rem' }}>
            {[
              ['Odometer (1k km)', 'How much the car\'s been driven'],
              ['Car Age', 'Years since it rolled off the factory'],
              ['Horsepower', 'Engine power, the vroom factor'],
              ['Owner Age', 'How old the previous owner was'],
              ['Highway Miles (%)', 'Percentage that the owner claims to have driven on highways vs rough roads'],
              ['Selling Price (INR Lakhs)', 'What it actually sold for (target)'],
            ].map(([name, desc], i) => (
              <li key={i} style={{ marginBottom: '0.75rem', fontSize: '1.1rem', lineHeight: '1.7' }}>
                <strong style={{ color: '#2d3748', fontWeight: 700 }}>{name}</strong> - {desc}
              </li>
            ))}
          </ul>
        </div>

        <p style={{ fontSize: '1.2rem', lineHeight: '1.9', color: '#2d3748' }}>
          But here's the thing: not all of this matters. Some features are just <em style={{ fontStyle: 'italic', color: '#ef4444' }}>noise</em>. <strong style={{ color: '#667eea', fontWeight: 700, fontSize: '1.3rem' }}>Find the features that are unnecessary!</strong>
        </p>
        <div style={{
          marginTop: '1.5rem',
          padding: '1.25rem 2rem',
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(251, 191, 36, 0.15) 100%)',
          borderRadius: '12px',
          border: '2px solid rgba(245, 158, 11, 0.3)',
          boxShadow: '0 4px 15px rgba(245, 158, 11, 0.1)',
        }}>
          <p style={{
            fontSize: '1.1rem',
            lineHeight: '1.8',
            color: '#92400e',
            fontStyle: 'italic',
            textAlign: 'center',
            margin: 0,
          }}>
            💡 <span style={{ fontWeight: 600 }}>You will see that it is difficult to see the data and find out features which are not necessary, thus we will rely on</span>{' '}
            <strong style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 800,
              fontSize: '1.2rem',
            }}>math!</strong>{' '}
            <span style={{ fontWeight: 600 }}>Scroll down to find out</span> ⬇️
          </p>
        </div>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.dataTable}>
          <thead>
            <tr>
              {headers.map((header) => (
                <th key={header} className={styles.tableHeader}>
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {csvData.map((row, idx) => (
              <tr key={idx} className={styles.tableRow}>
                {headers.map((header) => (
                  <td key={header} className={styles.tableCell}>
                    {row[header]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Major Quote */}
      <div className={styles.majorQuote}>
        <p className={styles.majorQuoteText}>
          "Calculate correlation of all features with the Target variable"
        </p>
      </div>
      <div style={{
        marginTop: '1.5rem',
        padding: '1rem 2rem',
        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.12) 100%)',
        borderRadius: '12px',
        border: '1px dashed rgba(102, 126, 234, 0.4)',
        textAlign: 'center',
      }}>
        <p style={{
          fontSize: '1.1rem',
          lineHeight: '1.8',
          color: '#4a5568',
          fontStyle: 'italic',
          margin: 0,
        }}>
          🎯 <span style={{ fontWeight: 500 }}>You can use the</span>{' '}
          <strong style={{
            color: '#10b981',
            fontWeight: 700,
          }}>button below</strong>{' '}
          <span style={{ fontWeight: 500 }}>to see the visualisation of the correlation, or</span>{' '}
          <strong style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 700,
          }}>do the maths yourself!</strong>
        </p>
      </div>

      {/* Code Box */}
      <div className={styles.codeBox}>
        <div className={styles.codeBoxTitle}>
          For the Pandas DataFrame df with the 6th Column as target variable, use df.corrwith() to calculate the correlation with the targets
        </div>
        <div className={styles.codeBoxContent}>
          <pre>
            <div className={styles.codeLine}>
              <span className={styles.codeComment}># 1. Select the target (6th column)</span>
            </div>
            <div className={styles.codeLine}>
              <span className={styles.codeKeyword}>target</span> = df.iloc[:, <span className={styles.codeString}>5</span>]
            </div>
            <div className={styles.codeLine}></div>
            <div className={styles.codeLine}>
              <span className={styles.codeComment}># 2. Calculate correlation of all columns with that target</span>
            </div>
            <div className={styles.codeLine}>
              <span className={styles.codeKeyword}>correlations</span> = df.<span className={styles.codeFunction}>corrwith</span>(target)
            </div>
            <div className={styles.codeLine}></div>
            <div className={styles.codeLine}>
              <span className={styles.codeFunction}>print</span>(correlations)
            </div>
          </pre>
        </div>
      </div>

      {/* Show Correlation Button */}
      {!showPlot && !isLoading && (
        <button onClick={handleShowCorrelation} className={styles.showCorrelationButton}>
          Show the Correlation Values!
        </button>
      )}

      {/* Loading */}
      {isLoading && (
        <div className={styles.loading}>
          <div className={styles.loadingSpinner}></div>
          <p className={styles.loadingText}>Calculating correlations...</p>
        </div>
      )}

      {/* Correlation Plot */}
      {showPlot && (
        <>
          <div className={styles.correlationPlot}>
            <Image
              src="/assets/LinearRegression/Correlation/plot.png"
              alt="Correlation Values"
              width={800}
              height={600}
              className={styles.correlationPlotImage}
            />
          </div>

          {/* Selection Question - appears after plot */}
          <div style={{ marginTop: '4rem' }}>
            <h2 className={styles.pageHeading} style={{ marginBottom: '1.5rem' }}>
              {data.selectionQuestion?.heading}
            </h2>
            <div className={styles.promptBody}>
              <p style={{ fontSize: '1.2rem', lineHeight: '1.9', color: '#2d3748' }}>
                Based on the <strong style={{ color: '#667eea', fontWeight: 700 }}>correlation values</strong> you just saw, identify the features that should be dropped.{' '}
                <span style={{
                  display: 'inline-block',
                  marginTop: '0.5rem',
                  padding: '0.4rem 0.8rem',
                  background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.15) 100%)',
                  borderRadius: '8px',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  fontStyle: 'italic',
                  fontSize: '1rem',
                }}>
                  ⚡ <strong style={{
                    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontWeight: 700,
                  }}>Select only the most redundant ones!</strong>
                </span>
              </p>
            </div>

            <div className={styles.featureGrid}>
              {data.selectionQuestion?.features.map((feature) => (
                <button
                  key={feature.name}
                  onClick={() => toggleFeature(feature.name)}
                  className={`${styles.featureCard} ${
                    selectedFeatures.has(feature.name) ? styles.selected : ''
                  }`}
                >
                  <span className={styles.featureName}>{feature.name}</span>
                  {selectedFeatures.has(feature.name) && (
                    <span className={styles.checkmark}>✓</span>
                  )}
                </button>
              ))}
            </div>

            <div className={styles.buttonGroup}>
              <button onClick={checkAnswers} className={styles.checkButton}>
                Check Answer
              </button>
              <button onClick={handleSeeAnswer} className={styles.seeAnswerButton}>
                See the Solution!
              </button>
            </div>

            {showFeedback && (
              <div className={`${styles.feedbackBox} ${
                selectedFeatures.size === data.selectionQuestion?.correctAnswers.length &&
                data.selectionQuestion?.correctAnswers.every(ans => selectedFeatures.has(ans))
                  ? styles.correct
                  : styles.incorrect
              }`}>
                {selectedFeatures.size === data.selectionQuestion?.correctAnswers.length &&
                data.selectionQuestion?.correctAnswers.every(ans => selectedFeatures.has(ans)) ? (
                  <>
                    <h3 className={styles.feedbackTitle}>Excellent! 🎯</h3>
                    <p className={styles.feedbackMessage}>
                      You correctly identified the redundant features based on their correlation values!
                    </p>

                    {/* Show explanations even when correct */}
                    <div className={styles.answerList}>
                      <h4>Why these features should be dropped:</h4>
                      <ul>
                        {data.selectionQuestion?.correctAnswers.map((answer) => (
                          <li key={answer}>{answer}</li>
                        ))}
                      </ul>
                    </div>
                    <div style={{ marginTop: '2rem', textAlign: 'left', maxWidth: '600px', marginLeft: 'auto', marginRight: 'auto' }}>
                      {Object.entries(data.selectionQuestion?.explanations || {}).map(([feature, explanation]) => (
                        <p key={feature} style={{ fontSize: '1.1rem', lineHeight: '1.7', marginBottom: '1rem' }}>
                          <strong style={{ color: 'white' }}>• {feature}:</strong> {explanation}
                        </p>
                      ))}
                    </div>
                    <button onClick={goToNextPage} className={styles.continueButton}>
                      Continue →
                    </button>
                  </>
                ) : (
                  <>
                    <h3 className={styles.feedbackTitle}>Not Quite 🤔</h3>
                    <p className={styles.feedbackMessage}>
                      Look at the correlation plot again. Which features have values closest to <strong>zero</strong>?
                    </p>
                  </>
                )}
              </div>
            )}

            {showAnswer && (
              <div className={`${styles.feedbackBox} ${styles.answer}`}>
                <h3 className={styles.feedbackTitle}>The Answer 📊</h3>
                <div className={styles.answerList}>
                  <h4>Features to Drop:</h4>
                  <ul>
                    {data.selectionQuestion?.correctAnswers.map((answer) => (
                      <li key={answer}>{answer}</li>
                    ))}
                  </ul>
                </div>
                <div style={{ marginTop: '2rem', textAlign: 'left', maxWidth: '600px', marginLeft: 'auto', marginRight: 'auto' }}>
                  {Object.entries(data.selectionQuestion?.explanations || {}).map(([feature, explanation]) => (
                    <p key={feature} style={{ fontSize: '1.1rem', lineHeight: '1.7', marginBottom: '1rem' }}>
                      <strong style={{ color: 'white' }}>• {feature}:</strong> {explanation}
                    </p>
                  ))}
                </div>
                <button onClick={goToNextPage} className={styles.continueButton}>
                  Continue →
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// Page 5: Completion - UNIFORM STANDARD
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
