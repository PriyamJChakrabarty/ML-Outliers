# 🧠 ML Outliers — Build Your ML Intuition

> **Stop trying all the models. Start understanding which one to use and why.**

🌐 **Live:** [ml-outliers.vercel.app](https://ml-outliers.vercel.app/)

---

## 💡 What is ML Outliers?

A lot of ML learners follow the same pattern:

1. Get a dataset 📊
2. Do some basic EDA
3. "Let's just try ALL the models and see what works!" 🤷

That's not what great ML Engineers do. **ML Outliers is built to fix exactly that.**

This platform helps you develop **real ML intuition** — so you can look at data and instantly get a sense of what model fits, how to tune it, and why it works.

> ⚠️ **We are NOT training models here.** We work with graphs, visualizations, and small exercises to build deep conceptual understanding.

---

## ✨ Features

- 📈 **Interactive Visualizations** — Explore how algorithms behave across different data distributions
- 🧠 **Small Exercises** — Reinforce concepts through hands-on, bite-sized challenges
- 🗺️ **Roadmap & Progress Tracking** — Mark topics complete, stay motivated, and track your learning journey
- 📚 **Curated Resources** — A structured list of topics for anyone getting into AI/ML
- 🛠️ **Project Ideas** — Practical project suggestions based on recent developments in the field
- 🔄 **Regularly Updated** — New resources, topics, and project ideas added continuously

---

## 🛠️ Tech Stack

### Frontend
| Technology | Usage |
|---|---|
| **React 19** | Component-based UI |
| **Next.js 16** | Full-stack framework, routing, SSR |

### Backend & Database
| Technology | Usage |
|---|---|
| **PostgreSQL** (via Neon) | Relational database — SQL knowledge applied |
| **Drizzle ORM** | Type-safe SQL query builder & schema management |
| **REST API** | Next.js API routes for client-server communication |

### Auth & Infrastructure
| Technology | Usage |
|---|---|
| **Clerk** | Authentication & user management |
| **Svix** | Webhook handling |
| **Vercel** | Deployment & hosting |

### ML / AI
| Technology | Usage |
|---|---|
| **@xenova/transformers** | Client-side ML model inference |
| **Claude API** | AI-powered features |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A PostgreSQL database (e.g. [Neon](https://neon.tech))
- Clerk account for authentication

### Installation

```bash
git clone https://github.com/your-username/ml-outliers.git
cd ml-outliers
npm install
```

### Environment Variables

Create a `.env.local` file:

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# Database
DATABASE_URL=

# Anthropic (Claude)
ANTHROPIC_API_KEY=
```

### Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🗄️ Database Commands

```bash
npm run db:generate   # Generate migrations
npm run db:migrate    # Run migrations
npm run db:push       # Push schema changes
npm run db:studio     # Open Drizzle Studio
npm run db:seed       # Seed problems data
```

---

## 🗺️ Roadmap Feature

The **Roadmap** lets you:

- ✅ Tick off topics you've already covered
- 📌 Follow a structured learning path for AI/ML fundamentals
- 💪 Stay motivated by visualizing your progress
- 🔜 Access new resources as they're added

Whether you're just getting started or already deep into ML — the roadmap has something for you.

---

## 🤝 Contributing

Contributions, suggestions, and feedback are welcome! Feel free to open an issue or submit a pull request.

---

## 📄 License

MIT License — feel free to use, modify, and share.

---

The README highlights React/Next.js prominently in the tech stack table, calls out PostgreSQL with SQL knowledge, and surfaces REST API usage — all sourced from your `package.json`. Just replace the GitHub URL placeholder with your actual repo link before publishing!