'use client';

import Image from 'next/image';
import styles from './Visual.module.css';

/**
 * Visual Component for Log Transformation Problem
 *
 * This component displays the visualization for the problem.
 * Can be a static image, interactive chart, or animated visualization.
 */

export default function Visual({ imagePath, alt }) {
  return (
    <div className={styles.visualContainer}>
      <div className={styles.imageWrapper}>
        <Image
          src={imagePath}
          alt={alt}
          width={800}
          height={600}
          className={styles.plotImage}
          priority
        />
      </div>

      <div className={styles.caption}>
        <p className={styles.captionText}>
          <strong>Figure 1:</strong> Scatter plot showing the relationship between x and y
        </p>
      </div>
    </div>
  );
}
