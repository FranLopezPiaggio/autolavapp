-- autolavapp — schema inicial para Supabase
-- Refleja apps/api/src/infrastructure/database.ts (única fuente de verdad).
-- Seeded determinístico: working_hours + services con IDs fijos (reusables en tests/smoke).

-- ============ TABLES ============

-- Usuarios del sistema (login). El admin se crea con el CLI seed:
--   pnpm --filter api seed:user -- --email=<email> --password=<pass> --name=<name>
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'ADMIN',
  name VARCHAR(150),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- email opcional: el flujo real crea cliente solo con phone + name
  email VARCHAR(255) UNIQUE,
  name VARCHAR(150) NOT NULL,
  phone VARCHAR(30) UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  plates VARCHAR(20) UNIQUE NOT NULL,
  vehicle_type VARCHAR(20) NOT NULL DEFAULT 'CAR',
  vehicle_size VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
  notes VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description VARCHAR(255),
  price NUMERIC(10, 2) NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name VARCHAR(100) NOT NULL,
  vehicle_plate VARCHAR(20) NOT NULL,
  services JSONB NOT NULL,
  status VARCHAR(20) NOT NULL,
  total_amount NUMERIC(10, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
  scheduled_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_scheduled_at ON orders(scheduled_at);

CREATE TABLE IF NOT EXISTS order_audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  previous_status VARCHAR(20) NOT NULL,
  new_status VARCHAR(20) NOT NULL,
  changed_by VARCHAR(100) DEFAULT 'ADMIN',
  reason VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_order_audits_order_id ON order_audits(order_id);

CREATE TABLE IF NOT EXISTS working_hours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  slot_duration_minutes INTEGER NOT NULL DEFAULT 30,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(day_of_week)
);

-- ============ SEEDS (deterministic) ============

-- Lunes a Viernes 08:00-18:00, Sábado 08:00-14:00, Domingo cerrado
INSERT INTO working_hours (id, day_of_week, start_time, end_time, slot_duration_minutes)
VALUES
  ('00000000-0000-0000-0000-000000000001', 1, '08:00', '18:00', 30),
  ('00000000-0000-0000-0000-000000000002', 2, '08:00', '18:00', 30),
  ('00000000-0000-0000-0000-000000000003', 3, '08:00', '18:00', 30),
  ('00000000-0000-0000-0000-000000000004', 4, '08:00', '18:00', 30),
  ('00000000-0000-0000-0000-000000000005', 5, '08:00', '18:00', 30),
  ('00000000-0000-0000-0000-000000000006', 6, '08:00', '14:00', 30)
ON CONFLICT (day_of_week) DO NOTHING;

INSERT INTO services (id, name, description, price, duration_minutes)
VALUES
  ('10000000-0000-0000-0000-000000000001', 'Lavado Exterior',  'Lavado de carrocería',        15000, 30),
  ('10000000-0000-0000-0000-000000000002', 'Lavado Interior',  'Aspirado y limpieza interior', 20000, 45),
  ('10000000-0000-0000-0000-000000000003', 'Lavado Completo',  'Exterior + interior',         35000, 60),
  ('10000000-0000-0000-0000-000000000004', 'Pulido y Encerado', 'Detallado de pintura',        80000, 120),
  ('10000000-0000-0000-0000-000000000005', 'Limpieza Motor',   'Limpieza de compartimiento motor', 25000, 30)
ON CONFLICT (id) DO NOTHING;