import pg from 'pg';
import bcrypt from 'bcryptjs';

const { Pool } = pg;

export const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    'postgres://postgres:postgrespassword@localhost:5432/autolavapp-db',
});

const ADMIN_EMAIL = 'admin@dashboard.com';
const ADMIN_PASSWORD = 'admin123';

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

    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(20) NOT NULL DEFAULT 'ADMIN',
      name VARCHAR(150),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS order_audits (
      id UUID PRIMARY KEY,
      order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
      previous_status VARCHAR(20) NOT NULL,
      new_status VARCHAR(20) NOT NULL,
      changed_by VARCHAR(100) DEFAULT 'ADMIN',
      reason VARCHAR(255),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await pool.query(queryText);

  // Migración idempotente: columnas nuevas sobre tablas existentes
  await pool.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_id UUID`);
  await pool.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS vehicle_id UUID`);
  await pool.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMP WITH TIME ZONE`);

  // Seed admin para el flujo de login (dev)
  await seedAdmin();
}

async function seedAdmin() {
  const existing = await pool.query('SELECT id FROM users WHERE email = $1', [ADMIN_EMAIL]);
  if (existing.rows.length > 0) return;

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  await pool.query(
    `INSERT INTO users (id, email, password_hash, role, name)
     VALUES ($1, $2, $3, $4, $5)`,
    [crypto.randomUUID(), ADMIN_EMAIL, passwordHash, 'ADMIN', 'Admin']
  );
  console.log(`Seeded admin user: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
}