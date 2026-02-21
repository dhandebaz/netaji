import { Pool } from 'pg';

let pool: Pool | null = null;

export const getPool = (): Pool | null => {
  if (pool) return pool;
  if (!process.env.DATABASE_URL) {
    return null;
  }
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  return pool;
};

