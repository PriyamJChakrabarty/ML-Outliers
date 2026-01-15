import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

/**
 * DATABASE CLIENT - ML OUTLIERS
 *
 * Uses Neon's serverless driver for optimal performance in Next.js
 * Serverless-first architecture perfect for edge functions
 *
 * SCALABILITY: Automatic connection pooling via Neon
 * MODULARITY: Single database instance with full schema
 * DEPLOYABILITY: Environment variable configuration
 */

// Neon serverless driver - optimized for serverless environments
// Note: DATABASE_URL must be set in production
const sql = neon(process.env.DATABASE_URL || '');

// Drizzle instance with schema for type-safe queries
export const db = drizzle(sql, { schema });
