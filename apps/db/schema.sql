-- Extensiones
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. CLIENTES
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(120) NOT NULL,
    phone VARCHAR(30) UNIQUE NOT NULL,
    email VARCHAR(120),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. VEHÍCULOS
CREATE TABLE IF NOT EXISTS vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    plates VARCHAR(10) NOT NULL UNIQUE,
    vehicle_type VARCHAR(20) NOT NULL, -- ej: 'CAR', 'SUV', 'MOTORCYCLE'
    vehicle_size VARCHAR(10) NOT NULL, -- ej: 'SMALL', 'MEDIUM', 'LARGE'
    notes VARCHAR(255) DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. HORARIOS DE ATENCIÓN Y SLOTS
CREATE TABLE IF NOT EXISTS working_hours (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Domingo, 1=Lunes...
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    slot_duration_minutes INT DEFAULT 30
);

-- 4. CATÁLOGO DE SERVICIOS
CREATE TABLE IF NOT EXISTS services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT DEFAULT '',
    price NUMERIC(10, 2) NOT NULL,
    duration_minutes INT NOT NULL DEFAULT 30,
    is_active BOOLEAN DEFAULT TRUE
);

-- 5. ÓRDENES Y RESERVAS (Core del Negocio)
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
    customer_name VARCHAR(100) NOT NULL,
    customer_phone VARCHAR(30),
    vehicle_plate VARCHAR(20) NOT NULL,
    services JSONB NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (
        status IN ('PENDING', 'CONFIRMED', 'IN_PROGRESS', 'READY', 'COMPLETED', 'CANCELLED')
    ),
    total_amount NUMERIC(10, 2) NOT NULL,
    estimated_minutes INT DEFAULT 30,
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices de rendimiento
CREATE INDEX IF NOT EXISTS idx_orders_scheduled_at ON orders(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_vehicle_id ON orders(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_vehicles_plates ON vehicles(plates);


-- --. RECURSOS (Requerido por la FK de orders)
-- CREATE TABLE IF NOT EXISTS resources (
--     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--     name VARCHAR(80) NOT NULL,
--     is_active BOOLEAN DEFAULT TRUE,
--     created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
-- );