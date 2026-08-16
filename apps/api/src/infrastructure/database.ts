import pg from 'pg';

const { Pool } = pg;

export const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    'postgres://postgres:postgrespassword@localhost:5432/autolavapp-db',
});

export async function initDatabase() {
  const queryText = `
    CREATE TABLE IF NOT EXISTS orders (
      id UUID PRIMARY KEY,
      customer_name VARCHAR(100) NOT NULL,
      vehicle_plate VARCHAR(20) NOT NULL,
      services JSONB NOT NULL,
      status VARCHAR(20) NOT NULL,
      total_amount NUMERIC(10, 2) NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await pool.query(queryText);
}