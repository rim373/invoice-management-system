-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";



-- Create users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name VARCHAR(255) NOT NULL,
    company VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    access_count INTEGER DEFAULT 0,
    sector VARCHAR(100) DEFAULT 'Technology',
    location VARCHAR(100) DEFAULT 'Europe',
    company_size VARCHAR(50) DEFAULT '1-10',
    payment_method VARCHAR(50) DEFAULT 'credit_card',
    join_date DATE DEFAULT CURRENT_DATE,
    status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'Pending')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create refresh_tokens table
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create contacts table (for users)
CREATE TABLE contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contact_id VARCHAR(20) UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    company VARCHAR(255),
    status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'Pending')),
    projects INTEGER DEFAULT 0,
    last_activity TEXT DEFAULT 'Just added',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create invoices table
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    contact_id VARCHAR(20) REFERENCES contacts(contact_id) ON DELETE SET NULL,
    client_name VARCHAR(255) NOT NULL,
    client_company VARCHAR(255),
    client_email VARCHAR(255),
    client_phone VARCHAR(50),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('paid', 'partial', 'pending', 'refunded', 'cancelled')),
    total_amount DECIMAL(10,2) NOT NULL,
    subtotal_amount DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    tax_rate DECIMAL(5,2) DEFAULT 0,
    paid_amount DECIMAL(10,2) DEFAULT 0,
    currency VARCHAR(10) DEFAULT 'EUR',
    created_date DATE NOT NULL,
    due_date DATE NOT NULL,
    items JSONB DEFAULT '[]',
    payment_history JSONB DEFAULT '[]',
    discount_amount DECIMAL(10,2) DEFAULT 0,
    discount_type VARCHAR(20) DEFAULT 'percentage' CHECK (discount_type IN ('percentage', 'fixed')),
    vat_number VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_settings table
CREATE TABLE user_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    profile_settings JSONB DEFAULT '{}',
    invoice_settings JSONB DEFAULT '{}',
    general_settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);
CREATE INDEX idx_contacts_user_id ON contacts(user_id);
CREATE INDEX idx_contacts_contact_id ON contacts(contact_id);
CREATE INDEX idx_invoices_user_id ON invoices(user_id);
CREATE INDEX idx_invoices_contact_id ON invoices(contact_id);
CREATE INDEX idx_invoices_invoice_number ON invoices(invoice_number);
CREATE INDEX idx_user_settings_user_id ON user_settings(user_id);

-- Insert demo users with hashed passwords
-- Password for both users is "demo"
INSERT INTO users (email, password_hash, name, company, phone, role, access_count, sector, location, company_size, payment_method, status) VALUES
('admin@demo.com', '$2b$12$WSfdt14Ut4zGhTDitE6TFeG4LdjATW5Ql0WUUKlBm.xKwvcu/ZcfS', 'Admin User', 'Demo Company', '+1234567890', 'admin', 100, 'Technology', 'North America', '51-200', 'credit_card', 'Active'),
('user@demo.com', '$2b$12$WSfdt14Ut4zGhTDitE6TFeG4LdjATW5Ql0WUUKlBm.xKwvcu/ZcfS', 'Demo User', 'User Company', '+0987654321', 'user', 50, 'Finance', 'Europe', '11-50', 'paypal', 'Active')
ON CONFLICT (email) DO NOTHING;

-- Get user IDs for demo data
DO $$
DECLARE
    admin_user_id UUID;
    demo_user_id UUID;
BEGIN
    -- Get user IDs
    SELECT id INTO admin_user_id FROM users WHERE email = 'admin@demo.com';
    SELECT id INTO demo_user_id FROM users WHERE email = 'user@demo.com';

    -- Insert demo contacts for the demo user
    INSERT INTO contacts (contact_id, user_id, name, email, phone, company, status, projects, last_activity) VALUES
    ('CMT-001', demo_user_id, 'John Smith', 'john.smith@example.com', '+1234567890', 'ABC Corporation', 'Active', 3, '2024-01-15'),
    ('CMT-002', demo_user_id, 'Sarah Johnson', 'sarah.johnson@example.com', '+1234567891', 'XYZ Industries', 'Active', 1, '2024-01-10'),
    ('CMT-003', demo_user_id, 'Michael Brown', 'michael.brown@example.com', '+1234567892', 'Tech Solutions', 'Pending', 0, '2024-01-05')
    ON CONFLICT (contact_id) DO NOTHING;

    -- Insert demo invoices for the demo user
    INSERT INTO invoices (invoice_number, user_id, contact_id, client_name, client_company, client_email, client_phone, status, total_amount, subtotal_amount, tax_amount, tax_rate, paid_amount, currency, created_date, due_date, items, payment_history, discount_amount, discount_type, vat_number, notes) VALUES
    ('INV-001', demo_user_id, 'CMT-001', 'John Smith', 'ABC Corporation', 'john.smith@example.com', '+1234567890', 'paid', 1200.00, 1000.00, 200.00, 20.00, 1200.00, 'EUR', '2024-01-01', '2024-01-31', '[{"id": "1", "description": "Web Development", "quantity": 1, "unitPrice": 1000, "totalPrice": 1000}]', '[{"id": "PAY-001", "amount": 1200, "date": "2024-01-15", "method": "Bank Transfer", "note": "Full payment"}]', 0, 'percentage', 'VAT123456', 'Thank you for your business'),
    ('INV-002', demo_user_id, 'CMT-002', 'Sarah Johnson', 'XYZ Industries', 'sarah.johnson@example.com', '+1234567891', 'partial', 800.00, 700.00, 100.00, 14.29, 400.00, 'EUR', '2024-01-05', '2024-02-05', '[{"id": "1", "description": "Consulting Services", "quantity": 2, "unitPrice": 350, "totalPrice": 700}]', '[{"id": "PAY-002", "amount": 400, "date": "2024-01-20", "method": "Credit Card", "note": "Partial payment"}]', 0, 'percentage', 'VAT123456', 'Remaining balance due'),
    ('INV-003', demo_user_id, 'CMT-003', 'Michael Brown', 'Tech Solutions', 'michael.brown@example.com', '+1234567892', 'pending', 1500.00, 1250.00, 250.00, 20.00, 0.00, 'EUR', '2024-01-10', '2024-02-10', '[{"id": "1", "description": "Software License", "quantity": 1, "unitPrice": 1250, "totalPrice": 1250}]', '[]', 0, 'percentage', 'VAT123456', 'Payment due within 30 days')
    ON CONFLICT (invoice_number) DO NOTHING;

    -- Insert demo user settings
    INSERT INTO user_settings (user_id, profile_settings, invoice_settings, general_settings) VALUES
    (demo_user_id, 
    '{"logo": null, "logoPreview": null, "firstName": "Demo User", "company": "User Company", "address": "123 Demo Street, Demo City", "phone": "+0987654321", "email": "user@demo.com", "website": "https://usercompany.com", "bankRib": "FR1420041010050500013M02606", "bankName": "Demo Bank"}',
    '{"invoiceNumber": true, "dueDate": true, "dueDateType": "custom", "dueDateDays": "30", "dueDateCustom": "2024-02-01", "currency": true, "discount": true, "tax": true, "notes": true, "invoiceNumberPrefix": "INV", "invoiceNumberStart": "001", "vatNumber": "VAT123456", "taxAmount": "20", "taxMethod": "default", "currencyType": "EUR", "separator": "comma-dot", "signPlacement": "before", "decimals": "2", "discountType": "percentage", "discountAmount": "0", "defaultNotes": "Thank you for your business", "saveLocation": "/invoices", "template": "Minimal", "dateFormat": "dd/MM/yyyy"}',
    '{"sound": "Default Values", "language": "English", "mute": false, "openPdfAfterSave": true}'
    ),
    (admin_user_id,
    '{"logo": null, "logoPreview": null, "firstName": "Admin User", "company": "Demo Company", "address": "456 Admin Avenue, Admin City", "phone": "+1234567890", "email": "admin@demo.com", "website": "https://democompany.com", "bankRib": "FR1420041010050500013M02607", "bankName": "Admin Bank"}',
    '{"invoiceNumber": true, "dueDate": true, "dueDateType": "term", "dueDateDays": "30", "dueDateCustom": "2024-02-01", "currency": true, "discount": true, "tax": true, "notes": true, "invoiceNumberPrefix": "INV", "invoiceNumberStart": "001", "vatNumber": "VAT789012", "taxAmount": "20", "taxMethod": "default", "currencyType": "EUR", "separator": "comma-dot", "signPlacement": "before", "decimals": "2", "discountType": "percentage", "discountAmount": "0", "defaultNotes": "Payment terms: Net 30", "saveLocation": "/admin-invoices", "template": "Professional", "dateFormat": "dd/MM/yyyy"}',
    '{"sound": "Default Values", "language": "English", "mute": false, "openPdfAfterSave": true}'
    )
    ON CONFLICT (user_id) DO NOTHING;
END $$;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
