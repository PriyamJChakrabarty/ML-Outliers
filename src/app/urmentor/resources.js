const EN_ML = 'https://youtube.com/playlist?list=PLZoTAELRMXVPBTrWtJkn3wWQxZkmTXGwe';
const HI_ML = 'https://youtube.com/playlist?list=PLKnIA16_Rmvbr7zKYQuBfsVkjoLcJgxHH';
const EN_DL = 'https://youtube.com/playlist?list=PLZoTAELRMXVPGU70ZGsckrMdr0FteeRUi';
const HI_DL = 'https://youtube.com/playlist?list=PLKnIA16_RmvYuZauWaPlRTC54KxSNLtNn';

export const TOPIC_RESOURCES = {
  python_basics: {
    title: 'Python Basics',
    english: [
      { label: 'Core ML Playlist — Videos 1–6 (ML & Python Intro)', url: EN_ML, type: 'youtube' },
      { label: 'Kaggle — Free Python Course (Interactive)', url: 'https://www.kaggle.com/learn/python', type: 'course' },
      { label: 'Official Python Tutorial', url: 'https://docs.python.org/3/tutorial/', type: 'docs' },
    ],
    hindi: [
      { label: 'Core ML Playlist (Hindi) — Videos 1–18 (Basics + Setup)', url: HI_ML, type: 'youtube' },
      { label: 'Kaggle — Free Python Course (Interactive)', url: 'https://www.kaggle.com/learn/python', type: 'course' },
    ],
  },

  numpy_pandas_matplotlib: {
    title: 'NumPy, Pandas & Matplotlib',
    english: [
      { label: 'Core ML Playlist — Videos 7–13 (NumPy, Pandas, Seaborn, Matplotlib)', url: EN_ML, type: 'youtube' },
      { label: 'Kaggle — Free Pandas Course', url: 'https://www.kaggle.com/learn/pandas', type: 'course' },
      { label: 'Kaggle — Data Visualization Course', url: 'https://www.kaggle.com/learn/data-visualization', type: 'course' },
      { label: 'Python for Data Analysis (Free Book)', url: 'https://wesmckinney.com/book/', type: 'book' },
    ],
    hindi: [
      { label: 'Core ML Playlist (Hindi) — Videos 1–22 (Basics + Data Analysis)', url: HI_ML, type: 'youtube' },
      { label: 'Kaggle — Free Pandas Course', url: 'https://www.kaggle.com/learn/pandas', type: 'course' },
    ],
  },

  eda_data_analysis: {
    title: 'EDA & Data Analysis',
    english: [
      { label: 'Core ML Playlist — Videos 14, 29–33 (EDA)', url: EN_ML, type: 'youtube' },
      { label: 'StatQuest with Josh Starmer — Stats Intuition', url: 'https://www.youtube.com/@statquest', type: 'youtube' },
      { label: 'Think Stats — Free Book', url: 'https://greenteapress.com/wp/think-stats-2e/', type: 'book' },
    ],
    hindi: [
      { label: 'Core ML Playlist (Hindi) — Videos 19–22 (Data Analysis)', url: HI_ML, type: 'youtube' },
      { label: 'StatQuest with Josh Starmer — Stats Intuition', url: 'https://www.youtube.com/@statquest', type: 'youtube' },
    ],
  },

  feature_engineering: {
    title: 'Feature Engineering & Transformation',
    english: [
      { label: 'Core ML Playlist — Videos 54–58 (Advanced EDA & Feature Engineering)', url: EN_ML, type: 'youtube' },
      { label: 'Core ML Playlist — Videos 41–45 (Feature Selection)', url: EN_ML, type: 'youtube' },
    ],
    hindi: [
      { label: 'Core ML Playlist (Hindi) — Videos 23–45 (Feature Engineering + Handling Data)', url: HI_ML, type: 'youtube' },
    ],
  },

  linear_regression: {
    title: 'Linear Regression',
    english: [
      { label: 'Core ML Playlist — Videos 34–40 (Linear Regression, Ridge & Lasso)', url: EN_ML, type: 'youtube' },
      { label: 'Introduction to Statistical Learning — ISLR (Free Book)', url: 'https://www.statlearning.com/', type: 'book' },
      { label: 'StatQuest — Linear Regression', url: 'https://www.youtube.com/@statquest', type: 'youtube' },
    ],
    hindi: [
      { label: 'Core ML Playlist (Hindi) — Videos 50–68 (Linear + Ridge + Lasso)', url: HI_ML, type: 'youtube' },
      { label: 'Introduction to Statistical Learning — ISLR (Free Book)', url: 'https://www.statlearning.com/', type: 'book' },
    ],
  },

  logistic_regression: {
    title: 'Logistic Regression',
    english: [
      { label: 'Core ML Playlist — Videos 46–49 (Logistic Regression)', url: EN_ML, type: 'youtube' },
      { label: 'Core ML Playlist — Videos 59–60 (Performance Metrics)', url: EN_ML, type: 'youtube' },
      { label: 'StatQuest — Logistic Regression', url: 'https://www.youtube.com/@statquest', type: 'youtube' },
    ],
    hindi: [
      { label: 'Core ML Playlist (Hindi) — Videos 69–79 (Logistic Regression)', url: HI_ML, type: 'youtube' },
    ],
  },

  decision_trees: {
    title: 'Decision Trees',
    english: [
      { label: 'Core ML Playlist — Videos 50–53 (Decision Tree)', url: EN_ML, type: 'youtube' },
    ],
    hindi: [
      { label: 'Core ML Playlist (Hindi) — Videos 80–83 (Decision Trees)', url: HI_ML, type: 'youtube' },
    ],
  },

  random_forest: {
    title: 'Random Forest & Ensemble Learning',
    english: [
      { label: 'Core ML Playlist — Videos 63–66 (Ensemble Learning & Random Forest)', url: EN_ML, type: 'youtube' },
    ],
    hindi: [
      { label: 'Core ML Playlist (Hindi) — Videos 84–97 (Ensemble + Random Forest)', url: HI_ML, type: 'youtube' },
    ],
  },

  ensemble_boosting: {
    title: 'Boosting Algorithms (XGBoost, LightGBM, CatBoost)',
    english: [
      { label: 'Core ML Playlist — Videos 67–68, 87–90 (Boosting + XGBoost)', url: EN_ML, type: 'youtube' },
    ],
    hindi: [
      { label: 'Core ML Playlist (Hindi) — Videos 98–109 (Boosting Algorithms)', url: HI_ML, type: 'youtube' },
    ],
  },

  knn_svm_naive_bayes: {
    title: 'KNN, SVM & Naive Bayes',
    english: [
      { label: 'Core ML Playlist — Videos 61–62 (KNN)', url: EN_ML, type: 'youtube' },
      { label: 'Core ML Playlist — Videos 80–86 (SVM + Naive Bayes)', url: EN_ML, type: 'youtube' },
    ],
    hindi: [
      { label: 'Core ML Playlist (Hindi) — Video 111 (KNN)', url: HI_ML, type: 'youtube' },
      { label: 'Core ML Playlist (Hindi) — Videos 113–126 (SVM + Naive Bayes)', url: HI_ML, type: 'youtube' },
    ],
  },

  clustering: {
    title: 'Clustering Techniques',
    english: [
      { label: 'Core ML Playlist — Videos 70–74 (Clustering)', url: EN_ML, type: 'youtube' },
    ],
    hindi: [
      { label: 'Core ML Playlist (Hindi) — Videos 103–105, 110 (K-Means Clustering)', url: HI_ML, type: 'youtube' },
    ],
  },

  dimensionality_reduction: {
    title: 'Dimensionality Reduction & PCA',
    english: [
      { label: 'Core ML Playlist — Videos 75–77 (Dimensionality Reduction)', url: EN_ML, type: 'youtube' },
    ],
    hindi: [
      { label: 'Core ML Playlist (Hindi) — Videos 46–49 (Dimensionality Reduction & PCA)', url: HI_ML, type: 'youtube' },
    ],
  },

  cross_validation: {
    title: 'Cross Validation & Model Evaluation',
    english: [
      { label: 'Core ML Playlist — Videos 78–79 (Cross Validation & Optimal Threshold)', url: EN_ML, type: 'youtube' },
    ],
    hindi: [
      { label: 'Core ML Playlist (Hindi) — Videos 131–134 (Miscellaneous / Validation)', url: HI_ML, type: 'youtube' },
    ],
  },

  math_for_ml: {
    title: 'Mathematics for ML',
    english: [
      { label: '3Blue1Brown — Essence of Linear Algebra (Visual)', url: 'https://youtube.com/playlist?list=PLZHQObOWTQDPD3MizzM2xVFitgF8hE_ab', type: 'youtube' },
      { label: '3Blue1Brown — Essence of Calculus (Visual)', url: 'https://youtube.com/playlist?list=PLZHQObOWTQDMsr9K-rj53DwVRMYO3t5Yr', type: 'youtube' },
      { label: 'Khan Academy — Statistics & Probability (Free)', url: 'https://www.khanacademy.org/math/statistics-probability', type: 'course' },
      { label: 'Mathematics for Machine Learning (Free Book)', url: 'https://mml-book.github.io/', type: 'book' },
      { label: 'Introduction to Statistical Learning — ISLR (Free Book)', url: 'https://www.statlearning.com/', type: 'book' },
    ],
    hindi: [
      { label: '3Blue1Brown — Essence of Linear Algebra (Visual — works in any language)', url: 'https://youtube.com/playlist?list=PLZHQObOWTQDPD3MizzM2xVFitgF8hE_ab', type: 'youtube' },
      { label: 'Khan Academy — Statistics & Probability', url: 'https://www.khanacademy.org/math/statistics-probability', type: 'course' },
      { label: 'Mathematics for Machine Learning (Free Book)', url: 'https://mml-book.github.io/', type: 'book' },
    ],
  },

  deep_learning_basics: {
    title: 'Deep Learning Fundamentals',
    english: [
      { label: 'Core DL Playlist — Videos 1–26 (Intro + Neural Networks + Optimizers)', url: EN_DL, type: 'youtube' },
      { label: 'Neural Networks and Deep Learning (Free Book)', url: 'http://neuralnetworksanddeeplearning.com/', type: 'book' },
      { label: 'MIT 6.S191 — Introduction to Deep Learning (Free)', url: 'http://introtodeeplearning.com/', type: 'course' },
    ],
    hindi: [
      { label: 'Core DL Playlist (Hindi) — Videos 1–31 (Intro + Neural Networks)', url: HI_DL, type: 'youtube' },
      { label: 'Neural Networks and Deep Learning (Free Book)', url: 'http://neuralnetworksanddeeplearning.com/', type: 'book' },
    ],
  },

  cnn_computer_vision: {
    title: 'CNNs & Computer Vision',
    english: [
      { label: 'Core DL Playlist — Videos 27–35 (CNN)', url: EN_DL, type: 'youtube' },
      { label: 'Stanford CS231N — CNNs for Visual Recognition (Free)', url: 'http://cs231n.stanford.edu/', type: 'course' },
      { label: 'fast.ai — Practical Deep Learning for Coders (Free)', url: 'https://course.fast.ai/', type: 'course' },
    ],
    hindi: [
      { label: 'Core DL Playlist (Hindi) — Videos 40–54 (CNN + Transfer Learning)', url: HI_DL, type: 'youtube' },
      { label: 'Stanford CS231N — CNNs for Visual Recognition', url: 'http://cs231n.stanford.edu/', type: 'course' },
    ],
  },

  rnn_lstm: {
    title: 'RNN & LSTM',
    english: [
      { label: 'Core DL Playlist — Videos 36–50 (RNN + LSTM + More RNN)', url: EN_DL, type: 'youtube' },
    ],
    hindi: [
      { label: 'Core DL Playlist (Hindi) — Videos 55–66 (RNN + LSTM)', url: HI_DL, type: 'youtube' },
    ],
  },

  transformers: {
    title: 'Transformers & Attention',
    english: [
      { label: 'Core DL Playlist — Videos 51–60 (Encoder-Decoder + Transformers)', url: EN_DL, type: 'youtube' },
      { label: 'Andrej Karpathy — Let\'s Build GPT from Scratch', url: 'https://youtu.be/kCc8FmEb1nY', type: 'youtube' },
    ],
    hindi: [
      { label: 'Core DL Playlist (Hindi) — Videos 67–82 (Attention + Transformers)', url: HI_DL, type: 'youtube' },
    ],
  },

  nlp: {
    title: 'Natural Language Processing (NLP)',
    english: [
      { label: 'Hugging Face NLP Course (Free, Highly Practical)', url: 'https://huggingface.co/learn/nlp-course/', type: 'course' },
      { label: 'Stanford CS224N — NLP with Deep Learning (Free)', url: 'https://web.stanford.edu/class/cs224n/', type: 'course' },
      { label: 'spaCy Course (Free, Interactive)', url: 'https://course.spacy.io/', type: 'course' },
    ],
    hindi: [
      { label: 'Hugging Face NLP Course (Free, Highly Practical)', url: 'https://huggingface.co/learn/nlp-course/', type: 'course' },
      { label: 'CampusX YouTube (Hindi ML/NLP content)', url: 'https://www.youtube.com/@campusx-official', type: 'youtube' },
    ],
  },

  llms_genai: {
    title: 'LLMs & Generative AI',
    english: [
      { label: 'Andrej Karpathy — YouTube Channel (Essential for LLMs)', url: 'https://youtube.com/@andrejkarpathy', type: 'youtube' },
      { label: 'DeepLearning.AI — Short Courses on LLMs (Free)', url: 'https://www.deeplearning.ai/short-courses/', type: 'course' },
      { label: 'LLM Course on GitHub (Comprehensive)', url: 'https://github.com/mlabonne/llm-course', type: 'article' },
      { label: 'Prompt Engineering Guide', url: 'https://www.promptingguide.ai/', type: 'article' },
    ],
    hindi: [
      { label: 'Andrej Karpathy — YouTube (English but universally recommended)', url: 'https://youtube.com/@andrejkarpathy', type: 'youtube' },
      { label: 'DeepLearning.AI — Short Courses (Free)', url: 'https://www.deeplearning.ai/short-courses/', type: 'course' },
    ],
  },

  reinforcement_learning: {
    title: 'Reinforcement Learning',
    english: [
      { label: 'HuggingFace Deep RL Course (Free, Interactive)', url: 'https://huggingface.co/learn/deep-rl-course/unit0/introduction', type: 'course' },
      { label: 'David Silver — RL Course by DeepMind (Free)', url: 'https://youtube.com/playlist?list=PLqYmG7hTraZDM-OYHWgPebj2MfEFhVOyd', type: 'youtube' },
      { label: 'RL: An Introduction — Sutton & Barto (Free Book)', url: 'http://incompleteideas.net/book/the-book-2nd.html', type: 'book' },
    ],
    hindi: [
      { label: 'HuggingFace Deep RL Course (Free, Interactive)', url: 'https://huggingface.co/learn/deep-rl-course/unit0/introduction', type: 'course' },
      { label: 'RL Introduction Video', url: 'https://youtu.be/2pWv7GOvuf0', type: 'youtube' },
    ],
  },

  mlops: {
    title: 'MLOps & Deployment',
    english: [
      { label: 'MLOps Zoomcamp by DataTalks.Club (Free + Certificate)', url: 'https://github.com/DataTalksClub/mlops-zoomcamp', type: 'course' },
      { label: 'Made With ML — MLOps by Goku Mohandas (Free)', url: 'https://madewithml.com/', type: 'course' },
      { label: 'Full Stack Deep Learning (Free)', url: 'https://fullstackdeeplearning.com/', type: 'course' },
      { label: 'FastAPI for ML Deployment', url: 'https://fastapi.tiangolo.com/', type: 'docs' },
    ],
    hindi: [
      { label: 'MLOps Zoomcamp by DataTalks.Club (Free)', url: 'https://github.com/DataTalksClub/mlops-zoomcamp', type: 'course' },
      { label: 'Made With ML — MLOps (Free)', url: 'https://madewithml.com/', type: 'course' },
    ],
  },

  projects_competitions: {
    title: 'Projects & Competitions',
    english: [
      { label: 'Kaggle — #1 Platform for ML Competitions & Datasets', url: 'https://www.kaggle.com/', type: 'course' },
      { label: 'ML Projects Playlist (YouTube)', url: 'https://youtube.com/playlist?list=PLfFghEzKVmjvuSA67LszN1dZ-Dd_pkus6', type: 'youtube' },
      { label: 'Analytics Vidhya Hackathons', url: 'https://datahack.analyticsvidhya.com/', type: 'course' },
      { label: 'Papers With Code — Benchmarks & SOTA', url: 'https://paperswithcode.com/sota', type: 'article' },
    ],
    hindi: [
      { label: 'Kaggle — ML Competitions & Datasets', url: 'https://www.kaggle.com/', type: 'course' },
      { label: 'Analytics Vidhya Hackathons (India-focused, Beginner-friendly)', url: 'https://datahack.analyticsvidhya.com/', type: 'course' },
    ],
  },
};

export const RESOURCE_TYPE_META = {
  youtube: { label: 'YouTube', color: '#ef4444' },
  course: { label: 'Course', color: '#8b5cf6' },
  book: { label: 'Book', color: '#0ea5e9' },
  article: { label: 'Article', color: '#10b981' },
  docs: { label: 'Docs', color: '#6b7280' },
};
