-- Drop existing tables if they exist (in correct order due to foreign keys)
DROP TABLE IF EXISTS stock_items CASCADE;
DROP TABLE IF EXISTS refresh_tokens CASCADE;
DROP TABLE IF EXISTS user_settings CASCADE;
DROP TABLE IF EXISTS invoices CASCADE;
DROP TABLE IF EXISTS contacts CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    company VARCHAR(255),
    role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
    last_activity TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create contacts table
CREATE TABLE contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contact_id VARCHAR(50) NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    company VARCHAR(255) NOT NULL,
    address TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, contact_id)
);

-- Create invoices table
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number VARCHAR(100) NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
    client_name VARCHAR(255) NOT NULL,
    client_company VARCHAR(255),
    client_email VARCHAR(255),
    client_phone VARCHAR(50),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('paid', 'partial', 'pending', 'refunded', 'cancelled')),
    total_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    subtotal_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    tax_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    tax_rate DECIMAL(5,2) NOT NULL DEFAULT 0,
    discount_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    discount_type VARCHAR(20) DEFAULT 'percentage' CHECK (discount_type IN ('percentage', 'fixed')),
    paid_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    currency VARCHAR(10) NOT NULL DEFAULT 'EUR',
    created_date DATE NOT NULL,
    due_date DATE NOT NULL,
    items JSONB NOT NULL DEFAULT '[]',
    payment_history JSONB NOT NULL DEFAULT '[]',
    vat_number VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, invoice_number)
);

-- Create user_settings table
CREATE TABLE user_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    profile_settings JSONB NOT NULL DEFAULT '{}',
    invoice_settings JSONB NOT NULL DEFAULT '{}',
    general_settings JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Create refresh_tokens table
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create stock_items table
CREATE TABLE stock_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    my_product BOOLEAN NOT NULL DEFAULT true,
    quantity INTEGER NOT NULL DEFAULT 0,
    min_stock INTEGER NOT NULL DEFAULT 0,
    price DECIMAL(12,2) NOT NULL DEFAULT 0,
    currency VARCHAR(10) NOT NULL DEFAULT 'EUR',
    supplier VARCHAR(255),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_last_activity ON users(last_activity);

CREATE INDEX idx_contacts_user_id ON contacts(user_id);
CREATE INDEX idx_contacts_contact_id ON contacts(contact_id);
CREATE INDEX idx_contacts_email ON contacts(email);
CREATE INDEX idx_contacts_status ON contacts(status);

CREATE INDEX idx_invoices_user_id ON invoices(user_id);
CREATE INDEX idx_invoices_contact_id ON invoices(contact_id);
CREATE INDEX idx_invoices_invoice_number ON invoices(invoice_number);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_created_date ON invoices(created_date);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);

CREATE INDEX idx_user_settings_user_id ON user_settings(user_id);

CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);
CREATE INDEX idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);

CREATE INDEX idx_stock_items_user_id ON stock_items(user_id);
CREATE INDEX idx_stock_items_name ON stock_items(name);
CREATE INDEX idx_stock_items_my_product ON stock_items(my_product);
CREATE INDEX idx_stock_items_quantity ON stock_items(quantity);

-- Insert demo data
-- Demo users with bcrypt hashed passwords (password: "demo")
INSERT INTO users (id, email, password_hash, name, company, role, status, last_activity) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'admin@demo.com', '$2b$12$nvSj0MfS6V6gqOEh5o6nQe.VaCSTt1BQ09Ug/gZu4NVJZDMtLgzhS', 'Admin User', 'Demo Company', 'admin', 'active', NOW()),
('550e8400-e29b-41d4-a716-446655440001', 'user@demo.com', '$2b$12$nvSj0MfS6V6gqOEh5o6nQe.VaCSTt1BQ09Ug/gZu4NVJZDMtLgzhS', 'Demo User', 'User Company', 'user', 'active', NOW()),
('550e8400-e29b-41d4-a716-446655440002', 'boj@gmail.com', '$2b$12$nvSj0MfS6V6gqOEh5o6nQe.VaCSTt1BQ09Ug/gZu4NVJZDMtLgzhS', 'Youssef Boujmil', 'Smith Corp', 'user', 'active', NOW()),
('550e8400-e29b-41d4-a716-446655440003', 'aziz@gamil.com', '$2b$12$nvSj0MfS6V6gqOEh5o6nQe.VaCSTt1BQ09Ug/gZu4NVJZDMtLgzhS', 'Aziz Khadhraoui', 'Doe Industries', 'user', 'active', NOW());

-- Demo contacts for user@demo.com
INSERT INTO contacts (id, contact_id, user_id, name, email, phone, company, address, status) VALUES
('660e8400-e29b-41d4-a716-446655440000', 'CMT-001', '550e8400-e29b-41d4-a716-446655440001', 'Alice Johnson', 'alice@techcorp.com', '+1-555-0101', 'TechCorp Solutions', '123 Tech Street, Silicon Valley, CA 94000', 'active'),
('660e8400-e29b-41d4-a716-446655440001', 'CMT-002', '550e8400-e29b-41d4-a716-446655440001', 'Bob Wilson', 'bob@designstudio.com', '+1-555-0102', 'Creative Design Studio', '456 Design Ave, New York, NY 10001', 'active'),
('660e8400-e29b-41d4-a716-446655440002', 'CMT-003', '550e8400-e29b-41d4-a716-446655440001', 'Carol Martinez', 'carol@retailplus.com', '+1-555-0103', 'RetailPlus Inc', '789 Commerce Blvd, Chicago, IL 60601', 'active'),
('660e8400-e29b-41d4-a716-446655440003', 'CMT-004', '550e8400-e29b-41d4-a716-446655440001', 'David Chen', 'david@startuplab.com', '+1-555-0104', 'StartupLab', '321 Innovation Dr, Austin, TX 78701', 'pending');

INSERT INTO contacts (id, contact_id, user_id, name, email, phone, company, address, status) VALUES
('660e8400-e29b-41d4-a716-446655440004', 'CMT-001', '550e8400-e29b-41d4-a716-446655440002', 'Emma Thompson', 'emma@globaltech.com', '+1-555-0201', 'GlobalTech Systems', '100 Global Plaza, Seattle, WA 98101', 'active'),
('660e8400-e29b-41d4-a716-446655440005', 'CMT-002', '550e8400-e29b-41d4-a716-446655440002', 'Frank Rodriguez', 'frank@mediahub.com', '+1-555-0202', 'MediaHub Agency', '200 Media Center, Los Angeles, CA 90210', 'active');

-- Demo invoices
INSERT INTO invoices (id, invoice_number, user_id, contact_id, client_name, client_company, client_email, client_phone, status, total_amount, subtotal_amount, tax_amount, tax_rate, paid_amount, currency, created_date, due_date, items, payment_history) VALUES
('770e8400-e29b-41d4-a716-446655440000', 'INV-001', '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440000', 'Alice Johnson', 'TechCorp Solutions', 'alice@techcorp.com', '+1-555-0101', 'paid', 1200.00, 1000.00, 200.00, 20.00, 1200.00, 'EUR', '2024-01-15', '2024-02-15', '[{"id":"1","description":"Web Development Services","quantity":1,"unitPrice":1000,"totalPrice":1000}]', '[{"id":"1","amount":1200,"date":"2024-01-20","method":"bank_transfer","note":"Full payment received"}]'),
('770e8400-e29b-41d4-a716-446655440001', 'INV-002', '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', 'Bob Wilson', 'Creative Design Studio', 'bob@designstudio.com', '+1-555-0102', 'partial', 800.00, 666.67, 133.33, 20.00, 400.00, 'EUR', '2024-01-20', '2024-02-20', '[{"id":"1","description":"Logo Design","quantity":1,"unitPrice":400,"totalPrice":400},{"id":"2","description":"Brand Guidelines","quantity":1,"unitPrice":266.67,"totalPrice":266.67}]', '[{"id":"1","amount":400,"date":"2024-01-25","method":"credit_card","note":"Partial payment"}]'),
('770e8400-e29b-41d4-a716-446655440002', 'INV-003', '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440002', 'Carol Martinez', 'RetailPlus Inc', 'carol@retailplus.com', '+1-555-0103', 'pending', 1500.00, 1250.00, 250.00, 20.00, 0.00, 'EUR', '2024-01-25', '2024-02-25', '[{"id":"1","description":"E-commerce Platform Setup","quantity":1,"unitPrice":1250,"totalPrice":1250}]', '[]'),
('770e8400-e29b-41d4-a716-446655440003', 'INV-004', '550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440004', 'Emma Thompson', 'GlobalTech Systems', 'emma@globaltech.com', '+1-555-0201', 'paid', 2000.00, 1666.67, 333.33, 20.00, 2000.00, 'EUR', '2024-01-10', '2024-02-10', '[{"id":"1","description":"System Integration","quantity":1,"unitPrice":1666.67,"totalPrice":1666.67}]', '[{"id":"1","amount":2000,"date":"2024-01-15","method":"bank_transfer","note":"Payment received"}]');

-- Demo user settings
INSERT INTO user_settings (user_id, profile_settings, invoice_settings, general_settings) VALUES
('550e8400-e29b-41d4-a716-446655440001', '{"firstName":"Demo User","company":"User Company","address":"123 Demo Street","phone":"+1-555-0100","email":"user@demo.com","website":"https://demo.com","bankRib":"FR1420041010050500013M02606","bankName":"Demo Bank"}','{"invoiceNumber":true,"dueDate":true,"dueDateType":"custom","dueDateDays":"30","dueDateCustom":"2024-12-31","currency":true,"discount":true,"tax":true,"notes":true,"invoiceNumberPrefix":"INV","invoiceNumberStart":"001","vatNumber":"FR12345678901","taxAmount":"20","taxMethod":"default","currencyType":"EUR","separator":"comma-dot","signPlacement":"before","decimals":"2","discountType":"percentage","discountAmount":"0","defaultNotes":"Thank you for your business!","saveLocation":"","template":"Minimal","dateFormat":"dd/MM/yyyy"}','{"sound":"Default Values","language":"English","mute":false,"openPdfAfterSave":true}'),
('550e8400-e29b-41d4-a716-446655440002', '{"firstName":"John Smith","company":"Smith Corp","address":"456 Business Ave","phone":"+1-555-0200","email":"john@example.com","website":"https://smithcorp.com","bankRib":"FR1420041010050500013M02607","bankName":"Business Bank"}','{"invoiceNumber":true,"dueDate":true,"dueDateType":"term","dueDateDays":"30","dueDateCustom":"2024-12-31","currency":true,"discount":false,"tax":true,"notes":true,"invoiceNumberPrefix":"INV","invoiceNumberStart":"001","vatNumber":"FR12345678902","taxAmount":"20","taxMethod":"default","currencyType":"EUR","separator":"comma-dot","signPlacement":"before","decimals":"2","discountType":"percentage","discountAmount":"0","defaultNotes":"Payment terms: 30 days","saveLocation":"","template":"Professional","dateFormat":"dd/MM/yyyy"}','{"sound":"Default Values","language":"English","mute":false,"openPdfAfterSave":true}');

-- Demo stock items for demo users
INSERT INTO stock_items (id, user_id, name, my_product, quantity, min_stock, price, currency, supplier, description) VALUES
('880e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001', 'MacBook Pro 16', true, 25, 10, 2499.99, 'EUR', 'Apple Inc.', 'High-performance laptop for professionals'),
('880e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'Ergonomic Office Chair', true, 5, 15, 299.99, 'EUR', 'Herman Miller', 'Comfortable office chair with lumbar support'),
('880e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'Wireless Mouse', true, 0, 20, 99.99, 'EUR', 'Logitech', 'Precision wireless mouse'),
('880e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', 'iPhone 15 Pro', true, 45, 20, 999.99, 'EUR', 'Apple Inc.', 'Latest iPhone with advanced features'),
('880e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440001', 'Standing Desk', false, 8, 10, 799.99, 'EUR', 'Uplift Desk', 'Adjustable height standing desk'),
('880e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440001', 'AirPods Pro', true, 32, 25, 249.99, 'EUR', 'Apple Inc.', 'Noise-cancelling wireless earbuds'),
('880e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440002', 'Dell Monitor 27"', true, 15, 8, 399.99, 'EUR', 'Dell Technologies', '4K Ultra HD monitor'),
('880e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440002', 'Mechanical Keyboard', false, 12, 10, 149.99, 'EUR', 'Corsair', 'RGB mechanical gaming keyboard');

-- Success message
SELECT 'Database setup completed successfully! Demo accounts created:' as message
UNION ALL
SELECT '- Admin: admin@demo.com / demo' as message  
UNION ALL
SELECT '- User: user@demo.com / demo' as message
UNION ALL
SELECT '- Additional users: boj@gmail.com / demo, aziz@gamil.com / demo' as message
UNION ALL
SELECT 'All tables created with proper relationships and indexes.' as message;
