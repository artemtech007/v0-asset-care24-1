-- =====================================================
-- AssetCare24 MVP Database Schema v2.1
-- Separate tables for clients and masters
-- Requires PostGIS extension for geography types
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- =====================================================
-- 1. CLIENTS TABLE (Составные ID как PK)
-- =====================================================
CREATE TABLE public.clients (
    id text PRIMARY KEY,                    -- cid_wa_491510416555, cid_tg_123456789
    phone text,
    email text,
    whatsapp_id text,                       -- Технический ID WhatsApp
    telegram_id text,                       -- ID в Telegram
    first_name text NOT NULL,
    last_name text NOT NULL,
    status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'blocked')),
    category text CHECK (category IN ('existing_client', 'new_client', 'unknown')),
    subcategory text,                       -- house_1, complex_a, ad_google
    source text,                            -- qr_code, advertisement, website
    first_contact_at timestamptz DEFAULT now(),
    last_activity_at timestamptz DEFAULT now(),
    meta_data jsonb DEFAULT '{}'::jsonb,    -- Доп. данные (адреса, предпочтения)
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- =====================================================
-- 2. MASTERS TABLE (Составные ID как PK)
-- =====================================================
CREATE TABLE public.masters (
    id text PRIMARY KEY,                    -- mid_wa_491510416556, mid_web_user@email
    phone text,
    email text,
    whatsapp_id text,                       -- Технический ID WhatsApp
    telegram_id text,                       -- ID в Telegram
    first_name text NOT NULL,
    last_name text NOT NULL,
    status text DEFAULT 'pending_approval' CHECK (status IN ('pending_approval', 'approved', 'active', 'suspended', 'blocked')),
    rating numeric(3,2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
    completed_jobs integer DEFAULT 0,
    specializations text[],                 -- ['elektrik', 'sanitär', 'maler']
    working_hours jsonb,                    -- {"start": "08:00", "end": "18:00"}
    working_days text[],                   -- ['mo', 'di', 'mi', 'do', 'fr']
    service_area text,                     -- Текстовое описание зоны
    has_vehicle boolean DEFAULT false,
    experience_years integer,
    qualifications text,
    documents_verified boolean DEFAULT false,
    approval_date timestamptz,
    admin_comment text,
    last_activity_at timestamptz DEFAULT now(),
    meta_data jsonb DEFAULT '{}'::jsonb,    -- Доп. данные (график, зоны)
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- =====================================================
-- 3. USER LINKS TABLE (connections between profiles)
-- =====================================================
CREATE TABLE public.user_links (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id text REFERENCES public.clients(id) ON DELETE CASCADE,
    master_id text REFERENCES public.masters(id) ON DELETE CASCADE,
    link_type text DEFAULT 'same_person' CHECK (link_type IN ('same_person', 'family_member', 'company_employee', 'related')),
    confidence numeric(3,2) DEFAULT 1.0 CHECK (confidence >= 0 AND confidence <= 1.0),
    linked_by text DEFAULT 'system',
    linked_at timestamptz DEFAULT now(),
    notes text,
    UNIQUE(client_id, master_id)
);

-- =====================================================
-- 4. ADMIN USERS TABLE (Составные ID как PK)
-- =====================================================
CREATE TABLE public.admin_users (
    id text PRIMARY KEY,                    -- aid_web_admin@company.com, aid_wa_491510416557
    phone text,
    email text UNIQUE NOT NULL,
    whatsapp_id text,                       -- Технический ID WhatsApp
    telegram_id text,                       -- ID в Telegram
    first_name text NOT NULL,
    last_name text NOT NULL,
    role text DEFAULT 'admin' CHECK (role IN ('admin', 'manager', 'support')),
    permissions jsonb DEFAULT '{}'::jsonb,  -- Права доступа
    last_login_at timestamptz,
    created_at timestamptz DEFAULT now()
);

-- =====================================================
-- 5. CLIENT ADDRESSES TABLE
-- =====================================================
CREATE TABLE public.client_addresses (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id text REFERENCES public.clients(id) ON DELETE CASCADE,
    name text,
    postal_code text,
    address_text text NOT NULL,
    location geography,
    is_default boolean DEFAULT false,
    created_at timestamptz DEFAULT now()
);

-- =====================================================
-- 6. REQUESTS TABLE
-- =====================================================
CREATE TABLE public.requests (
    id bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    parent_request_id bigint REFERENCES public.requests(id) ON DELETE SET NULL,
    client_id text REFERENCES public.clients(id) ON DELETE SET NULL,
    address_id uuid REFERENCES public.client_addresses(id) ON DELETE SET NULL,
    address_snapshot text NOT NULL,
    postal_code text,
    master_id text REFERENCES public.masters(id) ON DELETE SET NULL,
    status text DEFAULT 'new' CHECK (status IN ('new', 'assigned', 'in_progress', 'completed', 'canceled')),
    category text,
    description text,
    urgency text DEFAULT 'normal' CHECK (urgency IN ('low', 'normal', 'high', 'urgent')),
    admin_comment text,
    assigned_at timestamptz,
    started_at timestamptz,
    created_at timestamptz DEFAULT now(),
    completed_at timestamptz
);

-- =====================================================
-- 7. REQUEST MEDIA TABLE
-- =====================================================
CREATE TABLE public.request_media (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    request_id bigint REFERENCES public.requests(id) ON DELETE CASCADE,
    uploaded_by text,  -- Can reference clients.id or masters.id
    type text CHECK (type IN ('problem_photo', 'problem_audio', 'before_photo', 'after_photo', 'receipt')),
    bucket_path text NOT NULL,
    public_url text,
    file_name text,
    file_size integer,
    mime_type text,
    created_at timestamptz DEFAULT now()
);

-- =====================================================
-- 8. CLIENT STATUS TABLE (State Machine for Clients)
-- =====================================================
CREATE TABLE public.client_status (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id text REFERENCES public.clients(id) ON DELETE CASCADE,
    session_id uuid DEFAULT gen_random_uuid(),
    current_state text NOT NULL CHECK (current_state IN ('start', 'waiting_address', 'waiting_category', 'request_created', 'feedback_pending', 'completed')),
    state_data jsonb DEFAULT '{}'::jsonb,
    last_message_at timestamptz DEFAULT now(),
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- =====================================================
-- 9. MASTER STATUS TABLE (State Machine for Masters)
-- =====================================================
CREATE TABLE public.master_status (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    master_id text REFERENCES public.masters(id) ON DELETE CASCADE,
    session_id uuid DEFAULT gen_random_uuid(),
    current_state text NOT NULL CHECK (current_state IN ('start', 'waiting_acceptance', 'job_started', 'job_completed', 'feedback_given', 'idle')),
    state_data jsonb DEFAULT '{}'::jsonb,
    last_message_at timestamptz DEFAULT now(),
    is_active boolean DEFAULT true,
    current_location geography,
    is_on_shift boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- =====================================================
-- 10. REVIEWS TABLE
-- =====================================================
CREATE TABLE public.reviews (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    request_id bigint REFERENCES public.requests(id) ON DELETE CASCADE,
    client_id text REFERENCES public.clients(id) ON DELETE CASCADE,
    master_id text REFERENCES public.masters(id) ON DELETE CASCADE,
    rating integer CHECK (rating >= 1 AND rating <= 5),
    comment text,
    response_from_master text,
    is_public boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- =====================================================
-- INDEXES for performance
-- =====================================================

-- Clients indexes
CREATE INDEX idx_clients_phone ON clients(phone);
CREATE INDEX idx_clients_category ON clients(category);
CREATE INDEX idx_clients_status ON clients(status);
CREATE INDEX idx_clients_last_activity ON clients(last_activity_at);

-- Masters indexes
CREATE INDEX idx_masters_phone ON masters(phone);
CREATE INDEX idx_masters_status ON masters(status);
CREATE INDEX idx_masters_rating ON masters(rating);
CREATE INDEX idx_masters_specializations ON masters USING gin(specializations);
CREATE INDEX idx_masters_last_activity ON masters(last_activity_at);

-- User links indexes
CREATE INDEX idx_user_links_client ON user_links(client_id);
CREATE INDEX idx_user_links_master ON user_links(master_id);
CREATE INDEX idx_user_links_confidence ON user_links(confidence);

-- Client addresses indexes
CREATE INDEX idx_client_addresses_client ON client_addresses(client_id);
CREATE INDEX idx_client_addresses_postal_code ON client_addresses(postal_code);

-- Requests indexes
CREATE INDEX idx_requests_client ON requests(client_id);
CREATE INDEX idx_requests_master ON requests(master_id);
CREATE INDEX idx_requests_parent ON requests(parent_request_id);
CREATE INDEX idx_requests_status ON requests(status);
CREATE INDEX idx_requests_created_at ON requests(created_at);
CREATE INDEX idx_requests_urgency_status ON requests(urgency, status);

-- Request media indexes
CREATE INDEX idx_request_media_request ON request_media(request_id);
CREATE INDEX idx_request_media_type ON request_media(type);

-- Client status indexes
CREATE INDEX idx_client_status_client ON client_status(client_id);
CREATE INDEX idx_client_status_session ON client_status(session_id);
CREATE INDEX idx_client_status_state ON client_status(current_state);
CREATE INDEX idx_client_status_active ON client_status(is_active);
CREATE INDEX idx_client_status_last_message ON client_status(last_message_at);

-- Master status indexes
CREATE INDEX idx_master_status_master ON master_status(master_id);
CREATE INDEX idx_master_status_session ON master_status(session_id);
CREATE INDEX idx_master_status_state ON master_status(current_state);
CREATE INDEX idx_master_status_active ON master_status(is_active);
CREATE INDEX idx_master_status_shift ON master_status(is_on_shift);
CREATE INDEX idx_master_status_last_message ON master_status(last_message_at);

-- Reviews indexes
CREATE INDEX idx_reviews_request ON reviews(request_id);
CREATE INDEX idx_reviews_client ON reviews(client_id);
CREATE INDEX idx_reviews_master ON reviews(master_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) - for Supabase
-- =====================================================

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.masters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.request_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.master_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- BASIC RLS POLICIES (to be expanded)
-- =====================================================

-- Allow admins to read all clients
CREATE POLICY "Admins can read all clients" ON public.clients
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.admin_users
        WHERE id = current_setting('request.jwt.claims', true)::json->>'sub'
        AND role IN ('admin', 'manager')
    )
);

-- Allow masters to read their own profile
CREATE POLICY "Masters can read own profile" ON public.masters
FOR SELECT USING (id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Similar policies needed for other tables...
-- (Detailed RLS policies to be defined based on security requirements)

-- =====================================================
-- SAMPLE DATA (for testing)
-- =====================================================

-- Sample admin user
INSERT INTO public.admin_users (id, email, whatsapp_id, first_name, last_name, role)
VALUES ('aid_web_admin_at_assetcare_dot_org', 'admin@assetcare.org', 'whatsapp_admin_789', 'System', 'Admin', 'admin');

-- Sample client status (новая сессия)
INSERT INTO public.client_status (client_id, current_state, state_data)
VALUES ('cid_wa_491510416555', 'start', '{"last_action": "greeting_sent"}'::jsonb);

-- Sample master status (активный мастер)
INSERT INTO public.master_status (master_id, current_state, is_on_shift, state_data)
VALUES ('mid_wa_491510416556', 'idle', true, '{"available_for_jobs": true}'::jsonb);

-- Sample client
INSERT INTO public.clients (id, phone, whatsapp_id, first_name, last_name, category, subcategory, source)
VALUES ('cid_wa_491510416555', '+491510416555', 'whatsapp_user_123', 'Иван', 'Петров', 'existing_client', 'house_1', 'qr_code');

-- Sample master
INSERT INTO public.masters (id, phone, whatsapp_id, first_name, last_name, status, specializations)
VALUES ('mid_wa_491510416556', '+491510416556', 'whatsapp_master_456', 'Алексей', 'Мастеров', 'active', ARRAY['elektrik', 'sanitär']);

-- =====================================================
-- END OF SCHEMA
-- =====================================================
