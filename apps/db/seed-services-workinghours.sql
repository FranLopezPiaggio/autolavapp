-- Datos semilla para servicios
INSERT INTO services (name, description, price, duration_minutes, is_active) VALUES
('Lavado Básico', 'Lavado exterior e interior. Usa shampoo pH neutro y aspirado.', 1500.00, 30, true),
('Lavado Completo', 'Lavado interior, exterior, encerado y detallado de llantas.', 2500.00, 60, true),
('Tratamiento Cerámico', 'Protección de pintura cerámico con duración de 1 año.', 8000.00, 180, true)
ON CONFLICT DO NOTHING;

-- Datos semilla para horarios de atención (Lunes a Sábado, 8:00 a 18:00, slots de 30 min)
INSERT INTO working_hours (day_of_week, start_time, end_time, slot_duration_minutes) VALUES
(1, '08:00:00', '18:00:00', 30), -- Lunes
(2, '08:00:00', '18:00:00', 30), -- Martes
(3, '08:00:00', '18:00:00', 30), -- Miércoles
(4, '08:00:00', '18:00:00', 30), -- Jueves
(5, '08:00:00', '18:00:00', 30), -- Viernes
(6, '08:00:00', '14:00:00', 30)  -- Sábado
ON CONFLICT DO NOTHING;