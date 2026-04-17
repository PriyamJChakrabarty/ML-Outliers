'use client';

import { useState } from 'react';
import { TOPIC_RESOURCES, RESOURCE_TYPE_META } from './resources';
import styles from './urmentor.module.css';

const MANDATORY_TOPICS = ['eda_data_analysis', 'linear_regression', 'logistic_regression'];

const QUESTIONS = [
  {
    id: 'background',
    label: 'Step 1 of 5',
    text: "What's your current background?",
    hint: 'Be honest — this shapes your entire roadmap.',
    type: 'single',
    layout: 'stack',
    options: [
      { value: 'Complete Beginner (no coding experience)', label: 'Complete Beginner', sub: 'No prior coding experience' },
      { value: 'Beginner (can code in Python)', label: 'Beginner — Can Code', sub: 'Know Python basics, new to ML' },
      { value: 'Intermediate (know basic ML concepts)', label: 'Intermediate', sub: 'Familiar with some ML concepts' },
      { value: 'Advanced (practicing ML professionally)', label: 'Advanced', sub: 'Using ML in projects or work' },
    ],
  },
  {
    id: 'goal',
    label: 'Step 2 of 5',
    text: "What's your target goal?",
    hint: 'Your goal determines which skills get prioritized.',
    type: 'single',
    layout: 'grid',
    options: [
      { value: 'Become a Data Scientist', label: 'Data Scientist' },
      { value: 'Become an ML Engineer', label: 'ML Engineer' },
      { value: 'Research / Academia', label: 'Researcher / Academic' },
      { value: 'Just curious to learn ML', label: 'Just Curious to Learn' },
    ],
  },
  {
    id: 'hours',
    label: 'Step 3 of 5',
    text: 'How many hours per week can you dedicate?',
    hint: 'Be realistic — consistency beats intensity.',
    type: 'single',
    layout: 'grid',
    options: [
      { value: '2-5 hours per week', label: '2–5 hrs / week' },
      { value: '5-10 hours per week', label: '5–10 hrs / week' },
      { value: '10-20 hours per week', label: '10–20 hrs / week' },
      { value: '20+ hours per week', label: '20+ hrs / week' },
    ],
  },
  {
    id: 'language',
    label: 'Step 4 of 5',
    text: 'Which language do you prefer for learning?',
    hint: 'Resources will be selected accordingly.',
    type: 'single',
    layout: 'grid',
    options: [
      { value: 'English', label: 'English' },
      { value: 'Hindi', label: 'Hindi' },
      { value: 'Both', label: 'Both' },
    ],
  },
  {
    id: 'interests',
    label: 'Step 5 of 5',
    text: 'What areas are you most interested in?',
    hint: 'Select all that apply. These will extend your roadmap beyond the fundamentals.',
    type: 'multi',
    layout: 'grid',
    options: [
      { value: 'NLP / Text AI', label: 'NLP / Text AI' },
      { value: 'Computer Vision', label: 'Computer Vision' },
      { value: 'LLMs / Generative AI', label: 'LLMs / Generative AI' },
      { value: 'MLOps / Production', label: 'MLOps / Production' },
      { value: 'Reinforcement Learning', label: 'Reinforcement Learning' },
      { value: 'Deep Learning', label: 'Deep Learning' },
    ],
  },
];

function ChevronDown({ className }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
    </svg>
  );
}

function ArrowRight({ className }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ResourceLink({ resource }) {
  const meta = RESOURCE_TYPE_META[resource.type] || RESOURCE_TYPE_META.article;
  return (
    <a
      href={resource.url}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.resourceLink}
    >
      <span
        className={styles.resourceTypeBadge}
        style={{ background: meta.color }}
      >
        {meta.label}
      </span>
      <span className={styles.resourceLabel}>{resource.label}</span>
      <ArrowRight className={styles.resourceArrow} />
    </a>
  );
}

function TopicCard({ topic, language }) {
  const [open, setOpen] = useState(false);
  const isMandatory = MANDATORY_TOPICS.includes(topic.topicKey);
  const resourceData = TOPIC_RESOURCES[topic.topicKey];

  let resources = [];
  if (resourceData) {
    const langKey = language === 'Hindi' ? 'hindi' : 'english';
    if (language === 'Both') {
      const seen = new Set();
      const combined = [...(resourceData.english || []), ...(resourceData.hindi || [])];
      resources = combined.filter(r => {
        if (seen.has(r.url)) return false;
        seen.add(r.url);
        return true;
      });
    } else {
      resources = resourceData[langKey] || resourceData.english || [];
    }
  }

  return (
    <div className={styles.topicCard}>
      <div className={styles.topicHeader} onClick={() => setOpen(o => !o)}>
        {isMandatory && <span className={styles.mandatoryBadge}>Core</span>}
        <span className={styles.topicTitle}>{topic.topicTitle}</span>
        <ChevronDown className={`${styles.topicChevron} ${open ? styles.topicChevronOpen : ''}`} />
      </div>
      {open && (
        <div className={styles.topicBody}>
          {topic.why && <p className={styles.topicWhy}>{topic.why}</p>}
          <p className={styles.resourcesLabel}>Resources</p>
          <div className={styles.resourcesList}>
            {resources.length > 0
              ? resources.map((r, i) => <ResourceLink key={i} resource={r} />)
              : <p className={styles.noResources}>No resources mapped yet for this topic.</p>
            }
          </div>
        </div>
      )}
    </div>
  );
}

function PhaseCard({ phase, language, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={styles.phaseCard}>
      <div className={styles.phaseHeader} onClick={() => setOpen(o => !o)}>
        <div className={styles.phaseNumber}>{phase.phaseNumber}</div>
        <div className={styles.phaseHeaderText}>
          <div className={styles.phaseTitle}>{phase.phaseTitle}</div>
          <div className={styles.phaseMeta}>{phase.weekEstimate} · {phase.topics?.length || 0} topics</div>
        </div>
        <ChevronDown className={`${styles.phaseChevron} ${open ? styles.phaseChevronOpen : ''}`} />
      </div>
      {open && (
        <div className={styles.phaseBody}>
          {phase.description && <p className={styles.phaseDesc}>{phase.description}</p>}
          {phase.topics?.map((topic, i) => (
            <TopicCard key={i} topic={topic} language={language} />
          ))}
        </div>
      )}
    </div>
  );
}

function Roadmap({ roadmap, language, onRestart }) {
  return (
    <div className={styles.roadmapContainer}>
      <div className={styles.roadmapHeader}>
        <div className={styles.roadmapBadge}>Your Personalized Roadmap</div>
        <h1 className={styles.roadmapTitle}>{roadmap.roadmapTitle}</h1>
        <div className={styles.roadmapMeta}>
          <span className={styles.metaChip}>
            <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            {roadmap.estimatedDuration}
          </span>
          <span className={styles.metaChip}>
            <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
            </svg>
            {roadmap.phases?.length || 0} phases
          </span>
          <span className={styles.metaChip}>
            {language}
          </span>
        </div>
        {roadmap.personalizedMessage && (
          <p className={styles.personalizedMsg}>{roadmap.personalizedMessage}</p>
        )}
      </div>

      {roadmap.phases?.map((phase, i) => (
        <PhaseCard key={i} phase={phase} language={language} defaultOpen={i === 0} />
      ))}

      <div className={styles.restartRow}>
        <button className={styles.restartBtn} onClick={onRestart}>
          Start Over — Rebuild Roadmap
        </button>
      </div>
    </div>
  );
}

const INITIAL_ANSWERS = { background: '', goal: '', hours: '', language: '', interests: [] };

export default function UrMentorPage() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState(INITIAL_ANSWERS);
  const [phase, setPhase] = useState('quiz'); // 'quiz' | 'loading' | 'roadmap' | 'error'
  const [roadmap, setRoadmap] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const question = QUESTIONS[step];
  const currentValue = question?.type === 'multi'
    ? answers.interests
    : answers[question?.id] || '';

  const canAdvance = question?.type === 'multi'
    ? answers.interests.length > 0
    : currentValue !== '';

  function selectSingle(value) {
    setAnswers(prev => ({ ...prev, [question.id]: value }));
  }

  function toggleMulti(value) {
    setAnswers(prev => {
      const exists = prev.interests.includes(value);
      return {
        ...prev,
        interests: exists
          ? prev.interests.filter(v => v !== value)
          : [...prev.interests, value],
      };
    });
  }

  function handleNext() {
    if (step < QUESTIONS.length - 1) {
      setStep(s => s + 1);
    } else {
      generateRoadmap();
    }
  }

  function handleBack() {
    if (step > 0) setStep(s => s - 1);
  }

  async function generateRoadmap() {
    setPhase('loading');
    try {
      const res = await fetch('/api/urmentor/generate-roadmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(answers),
      });
      const data = await res.json();
      if (!res.ok || !data.roadmap) {
        throw new Error(data.error || 'Unknown error generating roadmap.');
      }
      setRoadmap(data.roadmap);
      setPhase('roadmap');
    } catch (err) {
      setErrorMsg(err.message || 'Something went wrong. Please try again.');
      setPhase('error');
    }
  }

  function restart() {
    setStep(0);
    setAnswers(INITIAL_ANSWERS);
    setRoadmap(null);
    setErrorMsg('');
    setPhase('quiz');
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.logo}>UM</div>
        <div className={styles.headerText}>
          <span className={styles.headerTitle}>UrMentor</span>
          <span className={styles.headerSub}>Personalized ML Roadmap Generator</span>
        </div>
      </header>

      {phase === 'quiz' && (
        <div className={styles.quizContainer}>
          {/* progress dots */}
          <div className={styles.progressRow}>
            {QUESTIONS.map((_, i) => (
              <div
                key={i}
                className={`${styles.dot} ${i === step ? styles.dotActive : i < step ? styles.dotDone : ''}`}
              />
            ))}
          </div>

          <div className={styles.questionCard}>
            <p className={styles.stepLabel}>{question.label}</p>
            <h2 className={styles.questionText}>{question.text}</h2>
            {question.hint && <p className={styles.questionHint}>{question.hint}</p>}

            {question.type === 'single' && question.layout === 'grid' && (
              <div className={styles.optionsGrid}>
                {question.options.map(opt => (
                  <button
                    key={opt.value}
                    className={`${styles.optionBtn} ${currentValue === opt.value ? styles.optionSelected : ''}`}
                    onClick={() => selectSingle(opt.value)}
                  >
                    {opt.label}
                    {opt.sub && <span style={{ display: 'block', fontSize: 11, color: '#9ca3af', marginTop: 3 }}>{opt.sub}</span>}
                  </button>
                ))}
              </div>
            )}

            {question.type === 'single' && question.layout === 'stack' && (
              <div className={styles.optionsStack}>
                {question.options.map(opt => (
                  <button
                    key={opt.value}
                    className={`${styles.optionBtn} ${currentValue === opt.value ? styles.optionSelected : ''}`}
                    onClick={() => selectSingle(opt.value)}
                  >
                    {opt.label}
                    {opt.sub && <span style={{ display: 'block', fontSize: 11, color: '#9ca3af', marginTop: 3 }}>{opt.sub}</span>}
                  </button>
                ))}
              </div>
            )}

            {question.type === 'multi' && (
              <div className={styles.checkGrid}>
                {question.options.map(opt => {
                  const checked = answers.interests.includes(opt.value);
                  return (
                    <button
                      key={opt.value}
                      className={`${styles.checkBtn} ${checked ? styles.checkBtnSelected : ''}`}
                      onClick={() => toggleMulti(opt.value)}
                    >
                      <span className={`${styles.checkBox} ${checked ? styles.checkBoxChecked : ''}`}>
                        {checked && <CheckIcon />}
                      </span>
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            )}

            <div className={styles.actionRow}>
              {step > 0 && (
                <button className={styles.backBtn} onClick={handleBack}>
                  ← Back
                </button>
              )}
              {step < QUESTIONS.length - 1 ? (
                <button
                  className={styles.nextBtn}
                  disabled={!canAdvance}
                  onClick={handleNext}
                >
                  Next →
                </button>
              ) : (
                <button
                  className={styles.generateBtn}
                  disabled={!canAdvance}
                  onClick={handleNext}
                >
                  Generate My Roadmap ✦
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {phase === 'loading' && (
        <div className={styles.loadingContainer}>
          <div className={styles.spinner} />
          <p className={styles.loadingTitle}>Building your roadmap…</p>
          <p className={styles.loadingSubtext}>
            Gemini is analyzing your profile and selecting the best resources for you.
          </p>
        </div>
      )}

      {phase === 'error' && (
        <div className={styles.loadingContainer}>
          <div className={styles.errorBox}>
            <strong>Something went wrong</strong>
            <br /><br />
            {errorMsg}
            <br />
            <button className={styles.retryBtn} onClick={restart}>
              Try Again
            </button>
          </div>
        </div>
      )}

      {phase === 'roadmap' && roadmap && (
        <Roadmap roadmap={roadmap} language={answers.language} onRestart={restart} />
      )}
    </div>
  );
}
