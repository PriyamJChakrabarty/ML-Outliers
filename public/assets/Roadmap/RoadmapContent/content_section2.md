
Deep Learning

English


https://youtube.com/playlist?list=PLZoTAELRMXVPGU70ZGsckrMdr0FteeRUi\&si=32delBv3jh6FrP26



Introduction



1 - 3



Neural Network Basics



4 - 18



Optimizers



19 - 21



Loss Function \& HyperparameterTuning



22 - 26



CNN



27 - 35



RNN



36 - 40



LSTM 



41 - 46





More on RNN



47 - 50



Encoder Decoder Architecture



51 - 54



Transformers



55 - 60



Cost Sensitive Neural Network



63



Object Localization vs Detection \& Segmentation



67, 70, 80 - 82



Audio Task



71 - 75



Text Generation



79



(Disclaimer - Some of the videos have not been mentioned as this roadmap covers only the most fundamental concepts, be sure to watch the rest of the videos for in depth exploration)





-----------------------------------------------------------------------------------------





Hindi

https://youtube.com/playlist?list=PLKnIA16\_RmvYuZauWaPlRTC54KxSNLtNn\&si=wbrWv\_opEAv1NElv



Introduction



1 - 3



Neural Network Part I



4 - 14



Neural Network Part II



15 - 31



Optimizers



32 - 39



CNN



40 - 52



Transfer Learning



53 - 54



RNN



55 - 60



LSTM 



61 - 63



More on RNN



64 - 66



Introduction to Encoder - Decoder \& Attention



67 - 70



Transformers



71 - 82


--------------------------------------------------



The TypeScript check passed. Now let me provide a summary and 
  the steps you need to follow to complete the database setup.  

  ---
  Summary of Changes Made

  I've implemented all the requested features:

  1. Added Deep Learning Dropdown

  - Added Deep Learning content with both English (14 topics)   
  and Hindi (11 topics) versions
  - Topics include: Introduction, Neural Networks, Optimizers,  
  CNN, RNN, LSTM, Transformers, etc.
  - Full playlist URLs are displayed inside each dropdown       

  2. Database Persistence for Roadmap Progress

  - Created new roadmap_progress table in the database schema   
  (src/db/schema.ts)
  - Created API route /api/roadmap-progress for GET/POST        
  operations
  - Progress is now saved to the database when logged in (falls 
  back to localStorage if not logged in)

  3. Separate Progress Bars for ML and DL

  - Added two separate progress cards showing ML and DL
  completion separately
  - ML progress bar is orange, DL progress bar is purple        

  4. Roadmap Progress in Leaderboard

  - Updated leaderboard queries to include roadmap progress     
  - Each user's ML/DL progress is shown in the leaderboard      
  - Your rank card also shows your roadmap progress

  5. Sequential Animation for Images

  - Fixed the CSS animation so images appear sequentially with a
   fade-in and scale effect
  - Each frame animates in one after another, then the cycle    
  repeats

  6. Full Playlist URLs

  - Added a URL display section in each dropdown showing the    
  complete playlist URL

  ---
  Steps You Need to Follow

  Step 1: Generate and Run the Database Migration

  Run the following commands in your terminal:

  # Navigate to your project directory
  cd
  "C:\Users\Priyam\Documents\Temp\Projects\Latest\ML-Outliers"  

  # Generate the migration for the new roadmap_progress table   
  npx drizzle-kit generate

  # Push the migration to your database
  npx drizzle-kit push

  Step 2: Verify the Migration

  After running the commands, you should see a new
  roadmap_progress table in your Neon DB with the following     
  columns:
  - id (serial, primary key)
  - user_id (uuid, foreign key to users)
  - completions (text, JSON string)
  - language (text)
  - ml_topics_completed (integer)
  - ml_topics_total (integer)
  - dl_topics_completed (integer)
  - dl_topics_total (integer)
  - created_at, updated_at (timestamps)

  Step 3: Test the Application

  # Start the development server
  npm run dev

  Then:
  1. Go to the Roadmap tab
  2. Toggle between English/Hindi
  3. Check topics in both ML and DL sections
  4. Verify progress is saved (refresh the page)
  5. Check the Leaderboard to see roadmap progress displayed    

  Step 4: If You Encounter Migration Issues

  If drizzle-kit doesn't have a config file, create
  drizzle.config.ts in your project root:

  import { defineConfig } from 'drizzle-kit';

  export default defineConfig({
    schema: './src/db/schema.ts',
    out: './drizzle',
    dialect: 'postgresql',
    dbCredentials: {
      url: process.env.DATABASE_URL!,
    },
  });

  Then run the migration commands again.

  ---
  Would you like me to help with anything else or make any      
  adjustments to the implementation?













