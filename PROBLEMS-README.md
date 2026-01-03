# Problems System - Architecture Documentation

## Overview

This is a **highly modular, registry-based problem system** designed for maximum **SCALABILITY**, **MODULARITY**, **SYSTEM DESIGN**, and **DEPLOYABILITY**.

### Key Design Principles

1. **Registry Pattern**: Single source of truth (`/src/problems/index.js`)
2. **Self-Contained Modules**: Each problem is completely independent
3. **Database-Ready**: Structure maps 1:1 with database schema
4. **Local AI**: Uses Transformers.js (MiniLM) for semantic answer checking
5. **No External Dependencies**: Runs entirely on your infrastructure

---

## Architecture

### Directory Structure

```
/src/problems/
├── index.js                    # THE REGISTRY (source of truth)
├── /log-transform/             # Problem module (self-contained)
│   ├── info.js                 # Metadata + configuration
│   ├── Visual.jsx              # Visualization component
│   └── Visual.module.css       # Component styles
├── /outlier-detection/         # Next problem...
│   ├── info.js
│   ├── Visual.jsx
│   └── Visual.module.css
└── ...                         # More problems
```

### How It Works

```
User visits /solve/log-transform
         ↓
Dynamic route reads problem slug
         ↓
Registry (`/src/problems/index.js`) maps slug → Problem Module
         ↓
Problem Module provides:
  - info.js: All metadata, prompts, answers, feedback
  - Visual.jsx: Interactive visualization component
         ↓
User submits answer
         ↓
API `/api/check-answer` uses MiniLM for semantic similarity
         ↓
Feedback displayed based on info.js configuration
```

---

## Creating a New Problem

### Step 1: Create Problem Folder

```
/src/problems/your-problem-slug/
```

### Step 2: Create `info.js`

```javascript
export const info = {
  // Identification (MUST match folder name)
  slug: 'your-problem-slug',

  // Display
  title: 'Your Problem Title',
  module: 'linear-regression', // or other module
  difficulty: 'beginner', // beginner | intermediate | advanced | expert

  // Content
  prompt: {
    heading: 'Problem Heading',
    body: 'Problem description...',
  },

  // Visualization
  visualization: {
    type: 'image', // or 'chart', 'interactive'
    path: '/assets/ModuleName/image.png',
    alt: 'Description',
  },

  // Answer checking
  answer: {
    expert: 'The correct answer',
    alternatives: ['alternative 1', 'alternative 2'],
    similarityThreshold: 0.75, // 0-1 (75% match required)
    maxLength: 100,
    minLength: 3,
  },

  // Feedback messages
  feedback: {
    correct: {
      title: '🎉 Excellent!',
      message: 'Correct explanation...',
      explanation: 'Deep dive...',
    },
    incorrect: {
      title: '🤔 Not Quite',
      message: 'Hint...',
      hint: 'Another hint...',
    },
  },

  // Gamification
  scoring: {
    basePoints: 100,
    timeBonusPoints: 50,
    maxTimeForBonus: 120,
  },

  // Progressive hints
  hints: [
    'Hint 1...',
    'Hint 2...',
    'Hint 3...',
  ],

  // Database sync
  meta: {
    displayOrder: 1,
    isPublished: true,
    version: '1.0.0',
    createdAt: '2025-01-03',
    tags: ['tag1', 'tag2'],
  },
};

export default info;
```

### Step 3: Create `Visual.jsx`

```javascript
'use client';

import Image from 'next/image';
import styles from './Visual.module.css';

export default function Visual({ imagePath, alt }) {
  return (
    <div className={styles.visualContainer}>
      <Image
        src={imagePath}
        alt={alt}
        width={800}
        height={600}
        className={styles.image}
      />
    </div>
  );
}
```

### Step 4: Create `Visual.module.css`

```css
.visualContainer {
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
}

.image {
  width: 100%;
  height: auto;
  border-radius: 8px;
}
```

### Step 5: Register in `/src/problems/index.js`

```javascript
import { info as yourProblemInfo } from './your-problem-slug/info.js';
import YourProblemVisual from './your-problem-slug/Visual.jsx';

const problemsRegistry = {
  // ... existing problems

  'your-problem-slug': {
    info: yourProblemInfo,
    Visual: YourProblemVisual,
  },
};
```

### Step 6: Done!

Problem is now accessible at: `/solve/your-problem-slug`

---

## Answer Checking System

### Technology: Transformers.js + MiniLM

- **Model**: `Xenova/all-MiniLM-L6-v2`
- **Size**: ~23MB (very small!)
- **Speed**: ~100-200ms per check
- **Accuracy**: High semantic understanding
- **Privacy**: 100% local, no external API calls

### How It Works

1. **Exact Match Check** (instant)
   - Compares user answer with expert answer (case-insensitive)
   - Checks against alternative answers

2. **Semantic Similarity** (if no exact match)
   - Converts both answers to embeddings (vectors)
   - Calculates cosine similarity (0-1 score)
   - If similarity >= threshold → Correct!

3. **Threshold Configuration**
   - Default: 0.75 (75% similarity)
   - Configurable per problem in `info.js`
   - Higher = stricter, Lower = more lenient

### Example Semantic Matches

**Expert Answer**: "Use Log Transformation"

**User Answers** (all accepted at 0.75 threshold):
- ✅ "log transformation"
- ✅ "apply logarithmic transform"
- ✅ "take log of y"
- ✅ "use natural logarithm"
- ❌ "normalize the data" (too different)
- ❌ "standardize features" (wrong concept)

---

## Database Migration Strategy

### Current State: Registry-Based
- Problems live in code (`/src/problems/`)
- Registry is source of truth
- No database dependency

### Future State: Database-Backed
- Problems synced to Neon DB (PostgreSQL)
- Registry structure maps 1:1 with DB schema
- Migration script will:
  1. Read all problems from registry
  2. Insert/update in database
  3. Keep registry in sync

### Migration Script (Future)

```javascript
// scripts/sync-problems-to-db.js
import { getAllProblems } from '@/problems/index.js';
import { db } from '@/lib/neon-db.js';

async function syncProblems() {
  const problems = getAllProblems();

  for (const problem of problems) {
    await db.problems.upsert({
      slug: problem.slug,
      title: problem.title,
      module: problem.module,
      difficulty: problem.difficulty,
      // ... all other fields from info.js
    });
  }
}
```

### Why This Design?

**Benefits**:
1. ✅ **Works NOW** (no database required)
2. ✅ **Migrates EASILY** (structure already matches DB)
3. ✅ **Version Control** (problems are code, tracked in Git)
4. ✅ **Local Development** (no DB connection needed)
5. ✅ **Production Ready** (just run sync script)

---

## API Endpoints

### POST `/api/check-answer`

**Purpose**: Check if user's answer is correct using semantic similarity

**Request**:
```json
{
  "problemId": "log-transform",
  "userAnswer": "use log transformation",
  "expertAnswer": "Use Log Transformation",
  "threshold": 0.75,
  "alternatives": ["log transform", "logarithm"]
}
```

**Response (Correct)**:
```json
{
  "isCorrect": true,
  "similarity": 0.92,
  "method": "semantic",
  "problemId": "log-transform",
  "threshold": 0.75
}
```

**Response (Incorrect)**:
```json
{
  "isCorrect": false,
  "similarity": 0.43,
  "method": "semantic",
  "problemId": "log-transform",
  "threshold": 0.75
}
```

---

## Routes

### `/solve/[id]`

**Dynamic route** that displays any problem by its slug.

**Examples**:
- `/solve/log-transform`
- `/solve/outlier-detection`
- `/solve/feature-scaling`

**Features**:
- Loads problem from registry
- Displays visualization
- Shows prompt and answer input
- Progressive hints system
- Semantic answer checking
- Detailed feedback

---

## Scalability Considerations

### 1. Problem Count
- **Architecture supports 100+ problems** without changes
- Each problem is isolated (no coupling)
- Registry is simple object lookup (O(1))

### 2. Concurrent Users
- Answer checking runs locally (no API limits)
- Model cached in memory (loaded once)
- Serverless-compatible (stateless)

### 3. Performance
- Static assets (images) served via CDN
- Components lazy-loaded
- MiniLM model: ~100-200ms per check
- No external API calls (no rate limits)

### 4. Deployment
- **Vercel/Netlify**: Works out of the box
- **Docker**: Containerizes cleanly
- **Edge**: Compatible with edge runtime
- **Self-hosted**: No external dependencies

---

## Testing

### Test a Problem

1. **Start dev server**:
   ```bash
   npm run dev
   ```

2. **Navigate to**:
   ```
   http://localhost:3000/solve/log-transform
   ```

3. **Test answer checking**:
   - Try: "Use Log Transformation" → Should be correct
   - Try: "log transform" → Should be correct
   - Try: "normalize data" → Should be incorrect

### Test Semantic Similarity

```javascript
// Test different phrasings
const testAnswers = [
  "Use Log Transformation",           // 100% match
  "apply logarithmic transform",      // ~85% match
  "take log of y variable",           // ~75% match
  "normalize the distribution",       // ~40% match
];
```

---

## Future Enhancements

### 1. Interactive Visualizations
- Use D3.js or Recharts for dynamic plots
- Allow users to interact with data
- Show transformations in real-time

### 2. Code Challenges
- Add code editor (Monaco/CodeMirror)
- Execute Python/R code snippets
- Test against expected output

### 3. Multi-Step Problems
- Break complex problems into sub-tasks
- Track progress through stages
- Unlock hints progressively

### 4. Leaderboard Integration
- Track time to solution
- Award bonus points for speed
- Show user rankings

---

## Summary

✅ **Modular**: Each problem is self-contained
✅ **Scalable**: Supports 100+ problems easily
✅ **Database-Ready**: Structure maps to DB schema
✅ **Local AI**: No external API dependencies
✅ **Deployable**: Works anywhere Next.js runs
✅ **Maintainable**: Clear structure, easy to extend

**Current Problems**: 1
**Estimated Time to Add New Problem**: ~15 minutes
**Database Migration**: Ready when you are!
