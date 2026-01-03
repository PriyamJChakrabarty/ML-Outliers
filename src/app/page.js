'use client';

import Image from "next/image";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

export default function Home() {
  const router = useRouter();
  return (
    <div className={styles.page}>
      {/* Navigation */}
      <nav className={styles.nav}>
        <Image
          src="/logo.png"
          alt="ML Outliers"
          width={200}
          height={40}
          priority
          className={styles.navLogo}
        />
        <div className={styles.navLinks}>
          <a href="#features" className={styles.navLink}>Features</a>
          <a href="#about" className={styles.navLink}>About</a>
          <button className={styles.ctaButton} onClick={() => router.push('/sign-in')}>
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className={styles.main}>
        <div className={styles.hero}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>
              The End of the <span className={styles.highlight}>Black Box</span>
            </h1>
            <p className={styles.heroSubtitle}>
              Most people use ML Models like a "Black Box" — they throw data in, get a result, and hope it's right.
              Our vision is to make learners peer inside the box.
            </p>
            <p className={styles.heroVision}>
              We want to build the place where you go to develop your <span className={styles.dataSense}>"Data Sense."</span> Through our platform,
              you'll be able to look at messy data and immediately say, <strong>"I know exactly which model to use, how to use it, and why to use it."</strong>
            </p>
            <div className={styles.heroMotto}>
              <span className={styles.mottoLabel}>Our Philosophy:</span>
              <span className={styles.mottoText}>Syntax is easy, Intuition is hard.</span>
            </div>
          </div>
          <div className={styles.heroVisual}>
            <div className={styles.animationContainer}>
              <div className={styles.boyAnimation}>
                <Image
                  src="/Boy-1.png"
                  alt="Learning ML"
                  width={600}
                  height={600}
                  className={`${styles.animationImage} ${styles.frame1}`}
                  priority
                />
                <Image
                  src="/Boy-2.png"
                  alt="Learning ML"
                  width={600}
                  height={600}
                  className={`${styles.animationImage} ${styles.frame2}`}
                  priority
                />
                <Image
                  src="/Boy-3.png"
                  alt="Learning ML"
                  width={600}
                  height={600}
                  className={`${styles.animationImage} ${styles.frame3}`}
                  priority
                />
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Prompt */}
        <div className={styles.scrollPrompt}>
          <p className={styles.scrollText}>Scroll down to start your journey</p>
          <div className={styles.scrollArrow}>↓</div>
        </div>

        <div className={styles.spacer}></div>

        {/* Main CTA Section */}
        <section className={styles.mainCta}>
          <div className={styles.ctaCards}>
            <div className={styles.ctaCard}>
              <button className={styles.heftyButton} disabled>
                <span className={styles.buttonIcon}>🎯</span>
                <span className={styles.buttonText}>Develop Insights</span>
              </button>
              <div className={styles.ctaDescription}>
                <h3 className={styles.ctaDescTitle}>Interactive ML Challenges</h3>
                <p className={styles.ctaDescText}>
                  Develop your sense of clearly understanding <strong>when to use</strong> the models,
                  <strong> how to use</strong> the models, and <strong>why to use</strong> the models through
                  playful, insightful exercises with real data scenarios.
                </p>
              </div>
            </div>

            <div className={styles.ctaCard}>
              <button className={styles.heftyButton} disabled>
                <span className={styles.buttonIcon}>🗺️</span>
                <span className={styles.buttonText}>ML Roadmap</span>
              </button>
              <div className={styles.ctaDescription}>
                <h3 className={styles.ctaDescTitle}>Curated Learning Path</h3>
                <p className={styles.ctaDescText}>
                  Follow a structured progression with carefully curated resource links in a
                  tickbox-style tracker. Stay on track with the most important ML concepts
                  and resources, organized for your learning journey.
                </p>
              </div>
            </div>
          </div>

          {/* Get Started CTA */}
          <div className={styles.getStartedSection}>
            <button className={styles.getStartedButton} onClick={() => router.push('/sign-in')}>
              Get Started
            </button>
            <p className={styles.getStartedSubtext}>Begin your journey to master ML intuition</p>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className={styles.features}>
          <h2 className={styles.sectionTitle}>Why ML Outliers?</h2>
          <div className={styles.featureGrid}>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>🔍</div>
              <h3 className={styles.featureTitle}>Diagnostic Challenges</h3>
              <p className={styles.featureDescription}>
                Face pathological datasets designed to reveal hidden issues like heteroscedasticity,
                bias, and multicollinearity.
              </p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>🎯</div>
              <h3 className={styles.featureTitle}>Develop Intuition</h3>
              <p className={styles.featureDescription}>
                Move beyond syntax. Learn to look at messy data and immediately identify why
                models will fail in production.
              </p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>⚡</div>
              <h3 className={styles.featureTitle}>Interactive Learning</h3>
              <p className={styles.featureDescription}>
                Each challenge features custom visualizations and real-time feedback powered
                by AI semantic evaluation.
              </p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>🏆</div>
              <h3 className={styles.featureTitle}>Production-Ready Skills</h3>
              <p className={styles.featureDescription}>
                Build the "Data Sense" that distinguishes senior engineers - the ability to
                peer inside the black box.
              </p>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className={styles.about}>
          <div className={styles.aboutContent}>
            <h2 className={styles.sectionTitle}>LeetCode for Machine Learning</h2>
            <p className={styles.aboutText}>
              Most people use AI like a black box - throw data in, get a result, hope it's right.
              ML Outliers is different. We're building a generation of engineers who can peer inside the box.
            </p>
            <p className={styles.aboutText}>
              Through hands-on challenges inspired by LeetCode and Codeforces, you'll develop the
              intuition to diagnose data issues before they become production disasters. Spend 10 hours
              on our platform, and you'll never look at a dataset the same way again.
            </p>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className={styles.finalCta}>
          <h2 className={styles.ctaTitle}>Ready to develop your Data Sense?</h2>
          <p className={styles.ctaText}>
            Join learners who understand not just syntax, but the intuition behind every model choice.
            Peer inside the black box and master ML with clarity.
          </p>
          <button className={styles.primaryButton} onClick={() => router.push('/sign-in')}>
            Start Your Journey
          </button>
        </section>
      </main>

      {/* Footer */}
      <footer className={styles.footer}>
        <p>&copy; 2025 ML Outliers. Built with precision and purpose.</p>
      </footer>
    </div>
  );
}
