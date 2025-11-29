-- Insert Cooperatives
INSERT INTO cooperatives (id, name, location, description, "createdAt", "updatedAt")
VALUES 
  ('coop1', 'Huye Coffee Cooperative', 'Huye District, Southern Province', 'Leading coffee cooperative in Southern Rwanda', NOW(), NOW()),
  ('coop2', 'Musasa Tea Growers', 'Musanze District, Northern Province', 'Premium tea producers in Northern Rwanda', NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

-- Insert Users (passwords are bcrypt hashed for 'farmer123', 'admin123', etc.)
INSERT INTO users (id, name, email, password, role, phone, country, city, province, "cooperativeId", "isActive", "createdAt", "updatedAt")
VALUES 
  ('admin1', 'Admin User', 'admin@cuptrace.rw', '$2b$10$rKJ8YQxL5vZ3qN0pX7wHXeF8L5vZ3qN0pX7wHXeF8L5vZ3qN0pX7wH', 'admin', '+250788000000', 'Rwanda', 'Kigali', 'Kigali City', NULL, true, NOW(), NOW()),
  ('farmer1', 'Jean Uwimana', 'jean.farmer@cuptrace.rw', '$2b$10$rKJ8YQxL5vZ3qN0pX7wHXeF8L5vZ3qN0pX7wHXeF8L5vZ3qN0pX7wH', 'farmer', '+250788111111', 'Rwanda', 'Huye', 'Southern Province', 'coop1', true, NOW(), NOW()),
  ('farmer2', 'Marie Mukamana', 'marie.farmer@cuptrace.rw', '$2b$10$rKJ8YQxL5vZ3qN0pX7wHXeF8L5vZ3qN0pX7wHXeF8L5vZ3qN0pX7wH', 'farmer', '+250788222222', 'Rwanda', 'Musanze', 'Northern Province', 'coop2', true, NOW(), NOW()),
  ('ws1', 'Huye Washing Station', 'huye.station@cuptrace.rw', '$2b$10$rKJ8YQxL5vZ3qN0pX7wHXeF8L5vZ3qN0pX7wHXeF8L5vZ3qN0pX7wH', 'ws', '+250788333333', 'Rwanda', 'Huye', 'Southern Province', NULL, true, NOW(), NOW()),
  ('exp1', 'Rwanda Coffee Exports Ltd', 'rwanda.exports@cuptrace.rw', '$2b$10$rKJ8YQxL5vZ3qN0pX7wHXeF8L5vZ3qN0pX7wHXeF8L5vZ3qN0pX7wH', 'exporter', '+250788444444', 'Rwanda', 'Kigali', 'Kigali City', NULL, true, NOW(), NOW())
ON CONFLICT (email) DO NOTHING;
