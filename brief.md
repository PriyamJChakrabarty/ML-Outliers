This project design is specifically engineered to demonstrate **System Thinking**, **Domain Expertise**, and **Modular Architecture**—three things senior SDE interviewers look for. By using the **Registry Pattern**, you’re proving you can build systems that are "Open for Extension, but Closed for Modification" (The Open-Closed Principle).

Here is the full briefing for your junior engineer.

---

# 🚀 Project Brief: ML Outliers

**Internal Onboarding Document v1.0**

## 1. The Core Objective

**ML Outliers** is a "Clinical Diagnostic Lab" for Data Science. Unlike platforms that focus on syntax (how to write code), we focus on **Intuition** (why the math fails).

The platform is a "LeetCode for ML" where users are presented with "pathological" datasets and must diagnose issues like multicollinearity, heteroscedasticity, and bias.

## 🌟 The Vision: "The End of the Black Box"

Most people use ML Models like "Black Box" —they throw data in, get a result, and hope it’s right. Our vision is to make learners peer inside the box.

We want to build the place where you go to develop your "Data Sense." Through our platform, they should be able to look at a messy data and immediately say, "I know exactly which model to use, how to use and why to use?."






* **Inspired By:** LeetCode (Challenge/Submission loop) and Codeforces (Competitive diagnostics).
* **The Motto:** "Syntax is easy, Intuition is hard."

## 2. The "Problem-as-a-Package" Design

To ensure this project can scale to 100+ challenges without becoming a "spaghetti" codebase, we are using a **Modular Registry Architecture**.

Every challenge is not just a file; it is a **Self-Contained Module**. This allows us to have unique animations, specific data logic, and custom "Judge" prompts for every single problem.

---

## 3. Architecture & Codebase Layout

### 📂 Folder Structure

```text
/src
├── /app/solve/[id]        # The "Dynamic Shell." It reads the URL ID and 
│                            # pulls the corresponding problem from the Registry.
├── /problems              # THE CORE ENGINE
│   ├── index.js           # THE REGISTRY. Maps IDs to Problem Modules.
│   └── /log-transform     # Example Problem Module
│       ├── info.js        # Meta-data (Title, expert answer, hint)
│       ├── Visual.jsx     # The custom animated data plot (Framer Motion)
│       └── data.json      # Rigged dataset for this specific problem
├── /api/judge             # THE JUDGE (Next.js Route)
│   └── route.js           # Passes User Input + Expert Answer to Gemini API
└── /components/shared     # Reusable UI (Buttons, Sliders, Layouts)

```

---

## 4. Engineering Expectations (The Workflow)

When you are assigned to build a new challenge (e.g., "Multicollinearity Hunt"), your workflow should be:

1. **Create the Folder:** Build `/src/problems/multicollinearity-hunt`.
2. **Rig the Data:** Create a `data.json` where two features are 99% correlated.
3. **Build the Visual:** Use `Visual.jsx` to render a heatmap or scatter plot that "visualizes" the echo between features.
4. **Define the Expert Answer:** In `info.js`, write the conceptual answer: *"The user must identify that Feature A and B are redundant and recommend dropping one."*
5. **Register It:** Import the new module into `/src/problems/index.js`.

---

## 5. Why This Impresses Interviewers

During your SDE interviews, you should highlight these three points:

* **Encapsulation:** "Each problem is isolated. Adding a complex new animation for a specific challenge doesn't bloat the global bundle or risk breaking other challenges."
* **Strategic AI Integration:** "We don't just use an LLM to generate code. We use it as a **Semantic Judge** to evaluate a developer's conceptual reasoning against a ground-truth expert answer."
* **Developer Experience (DX):** "The Registry Pattern allows a team to contribute new content asynchronously just by following a folder template, mimicking a real-world production environment."

