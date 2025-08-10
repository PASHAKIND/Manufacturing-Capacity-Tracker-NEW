-- Настройка базы данных для Manufacturing Capacity Tracker
-- Выполните этот скрипт в SQL Editor вашего проекта Supabase

-- Создание enum типов
CREATE TYPE user_role AS ENUM ('admin', 'manufacturer', 'client');
CREATE TYPE inquiry_status AS ENUM ('New', 'Viewed', 'Responded');
CREATE TYPE delegation_status AS ENUM ('Новая', 'В работе', 'Предложения отправлены', 'Выполнена', 'Отменена');
CREATE TYPE turnkey_status AS ENUM ('processing_ai', 'pending_review', 'published', 'in_progress', 'completed', 'cancelled');

-- Таблица пользователей
CREATE TABLE users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    role user_role NOT NULL,
    is_active BOOLEAN DEFAULT true
);

-- Таблица производственных мощностей
CREATE TABLE production_facilities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    city TEXT NOT NULL,
    contact_info TEXT NOT NULL,
    production_load INTEGER NOT NULL,
    product_categories TEXT[] NOT NULL,
    estimated_travel_time TEXT,
    general_turnaround_time TEXT,
    certifications TEXT[],
    images TEXT[]
);

-- Таблица продуктов
CREATE TABLE products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    estimated_production_time TEXT NOT NULL,
    materials TEXT[],
    capacity_per_week TEXT,
    facility_id UUID REFERENCES production_facilities(id) ON DELETE CASCADE
);

-- Таблица запросов
CREATE TABLE inquiries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID REFERENCES users(id) ON DELETE CASCADE,
    client_name TEXT NOT NULL,
    production_facility_id UUID REFERENCES production_facilities(id) ON DELETE CASCADE,
    production_facility_name TEXT NOT NULL,
    message TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status inquiry_status DEFAULT 'New',
    response TEXT,
    is_auto_generated BOOLEAN DEFAULT false,
    original_delegation_request_id UUID,
    turnkey_project_id UUID
);

-- Таблица сотрудников
CREATE TABLE employees (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    facility_owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    default_hourly_rate DECIMAL(10,2) NOT NULL
);

-- Таблица рабочих записей
CREATE TABLE work_log_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    facility_owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    employee_name TEXT NOT NULL,
    date DATE NOT NULL,
    hours_worked DECIMAL(5,2) NOT NULL,
    hourly_rate DECIMAL(10,2) NOT NULL,
    calculated_pay DECIMAL(10,2) NOT NULL,
    work_description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица архивированных сотрудников
CREATE TABLE archived_employees (
    id UUID PRIMARY KEY,
    facility_owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    default_hourly_rate DECIMAL(10,2) NOT NULL,
    archived_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица архивированных рабочих записей
CREATE TABLE archived_work_log_entries (
    id UUID PRIMARY KEY,
    facility_owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    employee_name TEXT NOT NULL,
    date DATE NOT NULL,
    hours_worked DECIMAL(5,2) NOT NULL,
    hourly_rate DECIMAL(10,2) NOT NULL,
    calculated_pay DECIMAL(10,2) NOT NULL,
    work_description TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    archived_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица запросов на делегирование
CREATE TABLE delegation_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID REFERENCES users(id) ON DELETE SET NULL,
    client_name TEXT NOT NULL,
    search_criteria JSONB NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status delegation_status DEFAULT 'Новая',
    admin_notes TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    contact_telegram TEXT
);

-- Таблица специальных предложений
CREATE TABLE special_offers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    facility_id UUID REFERENCES production_facilities(id) ON DELETE CASCADE,
    facility_owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
    facility_name TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    discount_percentage INTEGER,
    fixed_discount_amount DECIMAL(10,2),
    applicable_services TEXT[],
    valid_from TIMESTAMP WITH TIME ZONE NOT NULL,
    valid_until TIMESTAMP WITH TIME ZONE NOT NULL,
    promo_code TEXT,
    terms_and_conditions TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    view_count INTEGER DEFAULT 0
);

-- Таблица логов просмотров специальных предложений
CREATE TABLE special_offer_view_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    offer_id UUID REFERENCES special_offers(id) ON DELETE CASCADE,
    client_id UUID REFERENCES users(id) ON DELETE CASCADE,
    client_name TEXT NOT NULL,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    follow_up_sent BOOLEAN DEFAULT false,
    follow_up_message TEXT
);

-- Таблица проектов под ключ
CREATE TABLE turnkey_projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID REFERENCES users(id) ON DELETE SET NULL,
    client_name TEXT NOT NULL,
    product_description TEXT NOT NULL,
    project_name TEXT NOT NULL,
    stages JSONB NOT NULL,
    status turnkey_status DEFAULT 'processing_ai',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    admin_notes TEXT,
    product_image_url TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    contact_telegram TEXT
);

-- Создание индексов для оптимизации производительности
CREATE INDEX idx_production_facilities_owner_id ON production_facilities(owner_id);
CREATE INDEX idx_products_facility_id ON products(facility_id);
CREATE INDEX idx_inquiries_client_id ON inquiries(client_id);
CREATE INDEX idx_inquiries_facility_id ON inquiries(production_facility_id);
CREATE INDEX idx_employees_facility_owner_id ON employees(facility_owner_id);
CREATE INDEX idx_work_log_entries_facility_owner_id ON work_log_entries(facility_owner_id);
CREATE INDEX idx_work_log_entries_employee_id ON work_log_entries(employee_id);
CREATE INDEX idx_delegation_requests_client_id ON delegation_requests(client_id);
CREATE INDEX idx_special_offers_facility_id ON special_offers(facility_id);
CREATE INDEX idx_special_offers_is_active ON special_offers(is_active);
CREATE INDEX idx_turnkey_projects_client_id ON turnkey_projects(client_id);

-- Функция для увеличения счетчика просмотров предложений
CREATE OR REPLACE FUNCTION increment_offer_view(offer_id_in UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE special_offers 
    SET view_count = view_count + 1 
    WHERE id = offer_id_in;
END;
$$;

-- Включение Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_log_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE delegation_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE special_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE special_offer_view_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE turnkey_projects ENABLE ROW LEVEL SECURITY;

-- Базовые политики RLS (настройте под ваши требования)
-- Публичный доступ к производственным мощностям
CREATE POLICY "Public read access to production facilities" ON production_facilities
    FOR SELECT USING (true);

-- Владелец может управлять своими мощностям
CREATE POLICY "Owner can manage production facilities" ON production_facilities
    FOR ALL USING (owner_id = auth.uid());

-- Публичный доступ к специальным предложениям
CREATE POLICY "Public read access to special offers" ON special_offers
    FOR SELECT USING (is_active = true);

-- Владелец может управлять своими предложениями
CREATE POLICY "Owner can manage special offers" ON special_offers
    FOR ALL USING (facility_owner_id = auth.uid());

-- Вставка тестовых данных (опционально)
INSERT INTO users (name, role) VALUES 
('Admin User', 'admin'),
('Test Manufacturer', 'manufacturer'),
('Test Client', 'client'); 