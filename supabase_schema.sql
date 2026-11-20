-- NCC Fest Database Schema for Supabase (Direct PostgreSQL)
-- Run this in your Supabase SQL Editor

-- 1. ENUMS
DO $$ BEGIN
  CREATE TYPE division_type AS ENUM ('SD', 'SW', 'JD', 'JW');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE participation_type AS ENUM ('individual', 'team');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE inst_restriction AS ENUM ('none', 'per_institution', 'per_division');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE division_inst_status AS ENUM ('active', 'below_threshold', 'cancelled');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM ('pending', 'verified', 'failed');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('admin', 'volunteer', 'user');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- 2. INSTITUTION HIERARCHY
CREATE TABLE IF NOT EXISTS public.ncc_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.battalions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.ncc_groups(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(group_id, name)
);

CREATE TABLE IF NOT EXISTS public.institutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  battalion_id UUID NOT NULL REFERENCES public.battalions(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(battalion_id, name)
);

-- 3. PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT,
  phone TEXT,
  division division_type,
  institution_id UUID REFERENCES public.institutions(id) ON DELETE SET NULL,
  ncc_unit TEXT,
  photo_url TEXT,
  profile_complete BOOLEAN DEFAULT false,
  role user_role DEFAULT 'user',
  division_locked BOOLEAN DEFAULT false,
  qr_token TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. CATEGORIES & SUB-CATEGORIES
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.sub_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(category_id, name)
);

-- 5. EVENTS
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subcategory_id UUID NOT NULL REFERENCES public.sub_categories(id) ON DELETE RESTRICT,
  title TEXT NOT NULL,
  description TEXT,
  poster_url TEXT,
  rules_content TEXT,
  event_date DATE,
  event_time TEXT,
  venue TEXT,
  fee NUMERIC(10, 2) DEFAULT 0,
  participation_type participation_type NOT NULL,
  eligible_divisions division_type[] NOT NULL DEFAULT '{}',
  team_min INT,
  team_max INT,
  team_fixed BOOLEAN DEFAULT false,
  institution_restriction inst_restriction DEFAULT 'none',
  conflict_alert_enabled BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 6. PARALLEL EVENT LINKS
CREATE TABLE IF NOT EXISTS public.parallel_event_links (
  event_a_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  event_b_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  PRIMARY KEY (event_a_id, event_b_id),
  CONSTRAINT canonical_event_order CHECK (event_a_id < event_b_id)
);

-- 7. PRIZE POOLS
CREATE TABLE IF NOT EXISTS public.prize_pool_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  divisions division_type[] NOT NULL DEFAULT '{}',
  prize_1st NUMERIC(10, 2),
  prize_2nd NUMERIC(10, 2),
  prize_3rd NUMERIC(10, 2),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. DIVISION INSTANCES
CREATE TABLE IF NOT EXISTS public.event_division_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  division division_type NOT NULL,
  min_threshold INT DEFAULT 0,
  status division_inst_status DEFAULT 'active',
  cancel_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(event_id, division)
);

-- 9. REGISTRATIONS & MEMBERS
CREATE TABLE IF NOT EXISTS public.registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE RESTRICT,
  leader_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  team_name TEXT,
  participation_type participation_type NOT NULL,
  division division_type NOT NULL,
  institution_id UUID REFERENCES public.institutions(id) ON DELETE SET NULL,
  payment_status payment_status DEFAULT 'pending',
  razorpay_order_id TEXT UNIQUE,
  razorpay_payment_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.registration_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id UUID NOT NULL REFERENCES public.registrations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  role TEXT NOT NULL DEFAULT 'member',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(registration_id, user_id)
);

-- 10. APP SETTINGS
CREATE TABLE IF NOT EXISTS public.app_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 11. STORAGE BUCKETS
INSERT INTO storage.buckets (id, name, public)
VALUES ('event-posters', 'event-posters', true), ('profile-photos', 'profile-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Public Read Posters" ON storage.objects FOR SELECT USING (bucket_id = 'event-posters');
CREATE POLICY "Public Read Photos" ON storage.objects FOR SELECT USING (bucket_id = 'profile-photos');
CREATE POLICY "Authenticated Upload Posters" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'event-posters' AND auth.role() = 'authenticated');
CREATE POLICY "Authenticated Upload Photos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'profile-photos' AND auth.role() = 'authenticated');

-- 12. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.ncc_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.battalions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sub_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parallel_event_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prize_pool_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_division_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registration_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Public read groups" ON public.ncc_groups FOR SELECT USING (true);
CREATE POLICY "Public read battalions" ON public.battalions FOR SELECT USING (true);
CREATE POLICY "Public read institutions" ON public.institutions FOR SELECT USING (true);
CREATE POLICY "Public read categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Public read sub_categories" ON public.sub_categories FOR SELECT USING (true);
CREATE POLICY "Public read events" ON public.events FOR SELECT USING (is_active = true);
CREATE POLICY "Public read division_instances" ON public.event_division_instances FOR SELECT USING (true);
CREATE POLICY "Public read prize_pools" ON public.prize_pool_groups FOR SELECT USING (true);
CREATE POLICY "Public read parallel_links" ON public.parallel_event_links FOR SELECT USING (true);
CREATE POLICY "Public read settings" ON public.app_settings FOR SELECT USING (true);

-- Profile policies
CREATE POLICY "Users view own profile or public profile" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 13. TRIGGERS
-- Handle new user creation from Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    'user'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enforce institution restriction
CREATE OR REPLACE FUNCTION public.check_institution_restriction()
RETURNS trigger AS $$
DECLARE
  v_restriction inst_restriction;
  v_existing_count INT;
BEGIN
  SELECT institution_restriction INTO v_restriction FROM public.events WHERE id = NEW.event_id;
  
  IF v_restriction = 'none' OR NEW.institution_id IS NULL THEN
    RETURN NEW;
  END IF;

  IF v_restriction = 'per_institution' THEN
    SELECT COUNT(*) INTO v_existing_count
    FROM public.registrations
    WHERE event_id = NEW.event_id
      AND institution_id = NEW.institution_id
      AND payment_status != 'failed'
      AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid);
    
    IF v_existing_count > 0 THEN
      RAISE EXCEPTION 'INSTITUTION_LIMIT_EXCEEDED: Maximum 1 team per institution allowed';
    END IF;
  ELSIF v_restriction = 'per_division' THEN
    SELECT COUNT(*) INTO v_existing_count
    FROM public.registrations
    WHERE event_id = NEW.event_id
      AND institution_id = NEW.institution_id
      AND division = NEW.division
      AND payment_status != 'failed'
      AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid);
      
    IF v_existing_count > 0 THEN
      RAISE EXCEPTION 'INSTITUTION_DIVISION_LIMIT_EXCEEDED: Maximum 1 team per institution per division allowed';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_check_institution_restriction ON public.registrations;
CREATE TRIGGER trg_check_institution_restriction
  BEFORE INSERT OR UPDATE ON public.registrations
  FOR EACH ROW EXECUTE FUNCTION public.check_institution_restriction();
