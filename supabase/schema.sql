-- AnyTradesman.com Database Schema
-- Run this in Supabase SQL Editor

-- Enable PostGIS extension for geographic queries
CREATE EXTENSION IF NOT EXISTS postgis;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ENUMS
-- ============================================

CREATE TYPE user_role AS ENUM ('customer', 'business_owner', 'admin');
CREATE TYPE subscription_tier AS ENUM ('free', 'basic', 'professional', 'enterprise');
CREATE TYPE subscription_status AS ENUM ('active', 'past_due', 'canceled', 'trialing');
CREATE TYPE quote_status AS ENUM ('pending', 'sent', 'accepted', 'rejected', 'expired');
CREATE TYPE service_request_status AS ENUM ('open', 'matched', 'in_progress', 'completed', 'canceled');
CREATE TYPE verification_status AS ENUM ('pending', 'verified', 'rejected');

-- ============================================
-- TABLES
-- ============================================

-- Profiles (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  role user_role DEFAULT 'customer',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categories (for trades/services)
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Businesses
CREATE TABLE businesses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  logo_url TEXT,
  cover_image_url TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  location GEOGRAPHY(POINT, 4326),
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  service_radius_miles INTEGER DEFAULT 25,
  is_verified BOOLEAN DEFAULT false,
  verification_status verification_status DEFAULT 'pending',
  is_active BOOLEAN DEFAULT true,
  rating_average DECIMAL(3,2) DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Business Categories (many-to-many)
CREATE TABLE business_categories (
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (business_id, category_id)
);

-- Business Credentials (licenses, certifications)
CREATE TABLE business_credentials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  credential_type TEXT NOT NULL,
  credential_number TEXT,
  issuing_authority TEXT,
  issue_date DATE,
  expiry_date DATE,
  document_url TEXT,
  verification_status verification_status DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Service Requests (from customers)
CREATE TABLE service_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  location GEOGRAPHY(POINT, 4326),
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  preferred_date DATE,
  budget_min DECIMAL(10,2),
  budget_max DECIMAL(10,2),
  status service_request_status DEFAULT 'open',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quotes (from businesses to service requests)
CREATE TABLE quotes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_request_id UUID NOT NULL REFERENCES service_requests(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  estimated_duration TEXT,
  valid_until DATE,
  status quote_status DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(service_request_id, business_id)
);

-- Leads (businesses seeing service requests)
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  service_request_id UUID NOT NULL REFERENCES service_requests(id) ON DELETE CASCADE,
  is_viewed BOOLEAN DEFAULT false,
  is_contacted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(business_id, service_request_id)
);

-- Conversations
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_request_id UUID REFERENCES service_requests(id) ON DELETE SET NULL,
  customer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(customer_id, business_id, service_request_id)
);

-- Messages
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reviews
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  service_request_id UUID REFERENCES service_requests(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  comment TEXT,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscriptions
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE UNIQUE,
  tier subscription_tier DEFAULT 'free',
  status subscription_status DEFAULT 'active',
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

-- Spatial indexes for geographic queries
CREATE INDEX idx_businesses_location ON businesses USING GIST (location);
CREATE INDEX idx_service_requests_location ON service_requests USING GIST (location);

-- Performance indexes
CREATE INDEX idx_businesses_owner ON businesses(owner_id);
CREATE INDEX idx_businesses_slug ON businesses(slug);
CREATE INDEX idx_businesses_active ON businesses(is_active) WHERE is_active = true;
CREATE INDEX idx_businesses_verified ON businesses(is_verified) WHERE is_verified = true;

CREATE INDEX idx_service_requests_customer ON service_requests(customer_id);
CREATE INDEX idx_service_requests_category ON service_requests(category_id);
CREATE INDEX idx_service_requests_status ON service_requests(status);

CREATE INDEX idx_quotes_service_request ON quotes(service_request_id);
CREATE INDEX idx_quotes_business ON quotes(business_id);

CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_created ON messages(created_at DESC);

CREATE INDEX idx_reviews_business ON reviews(business_id);

CREATE INDEX idx_leads_business ON leads(business_id);
CREATE INDEX idx_leads_service_request ON leads(service_request_id);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update business rating
CREATE OR REPLACE FUNCTION update_business_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE businesses
  SET
    rating_average = (
      SELECT COALESCE(AVG(rating), 0)
      FROM reviews
      WHERE business_id = COALESCE(NEW.business_id, OLD.business_id)
    ),
    rating_count = (
      SELECT COUNT(*)
      FROM reviews
      WHERE business_id = COALESCE(NEW.business_id, OLD.business_id)
    )
  WHERE id = COALESCE(NEW.business_id, OLD.business_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to set location from lat/lng
CREATE OR REPLACE FUNCTION set_location_from_coords()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
    NEW.location = ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to find businesses within radius
CREATE OR REPLACE FUNCTION find_businesses_nearby(
  search_lat DOUBLE PRECISION,
  search_lng DOUBLE PRECISION,
  radius_miles INTEGER DEFAULT 25,
  category_slug TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  slug TEXT,
  description TEXT,
  logo_url TEXT,
  city TEXT,
  state TEXT,
  rating_average DECIMAL,
  rating_count INTEGER,
  distance_miles DOUBLE PRECISION
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    b.id,
    b.name,
    b.slug,
    b.description,
    b.logo_url,
    b.city,
    b.state,
    b.rating_average,
    b.rating_count,
    ST_Distance(
      b.location,
      ST_SetSRID(ST_MakePoint(search_lng, search_lat), 4326)::geography
    ) / 1609.34 AS distance_miles
  FROM businesses b
  LEFT JOIN business_categories bc ON b.id = bc.business_id
  LEFT JOIN categories c ON bc.category_id = c.id
  WHERE
    b.is_active = true
    AND b.is_verified = true
    AND ST_DWithin(
      b.location,
      ST_SetSRID(ST_MakePoint(search_lng, search_lat), 4326)::geography,
      radius_miles * 1609.34
    )
    AND (category_slug IS NULL OR c.slug = category_slug)
  ORDER BY distance_miles;
END;
$$ LANGUAGE plpgsql;

-- Function to match service request to nearby businesses
CREATE OR REPLACE FUNCTION match_service_request_to_businesses(
  request_id UUID
)
RETURNS INTEGER AS $$
DECLARE
  req service_requests%ROWTYPE;
  matched_count INTEGER := 0;
BEGIN
  SELECT * INTO req FROM service_requests WHERE id = request_id;

  IF req.location IS NULL THEN
    RETURN 0;
  END IF;

  INSERT INTO leads (business_id, service_request_id)
  SELECT DISTINCT b.id, request_id
  FROM businesses b
  JOIN business_categories bc ON b.id = bc.business_id
  WHERE
    b.is_active = true
    AND b.is_verified = true
    AND bc.category_id = req.category_id
    AND ST_DWithin(
      b.location,
      req.location,
      b.service_radius_miles * 1609.34
    )
  ON CONFLICT (business_id, service_request_id) DO NOTHING;

  GET DIAGNOSTICS matched_count = ROW_COUNT;
  RETURN matched_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGERS
-- ============================================

-- Updated at triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_businesses_updated_at
  BEFORE UPDATE ON businesses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_service_requests_updated_at
  BEFORE UPDATE ON service_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_quotes_updated_at
  BEFORE UPDATE ON quotes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_business_credentials_updated_at
  BEFORE UPDATE ON business_credentials
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Rating update triggers
CREATE TRIGGER update_rating_on_review_insert
  AFTER INSERT ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_business_rating();

CREATE TRIGGER update_rating_on_review_update
  AFTER UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_business_rating();

CREATE TRIGGER update_rating_on_review_delete
  AFTER DELETE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_business_rating();

-- Location triggers
CREATE TRIGGER set_business_location
  BEFORE INSERT OR UPDATE ON businesses
  FOR EACH ROW EXECUTE FUNCTION set_location_from_coords();

CREATE TRIGGER set_service_request_location
  BEFORE INSERT OR UPDATE ON service_requests
  FOR EACH ROW EXECUTE FUNCTION set_location_from_coords();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Categories policies (public read)
CREATE POLICY "Categories are viewable by everyone"
  ON categories FOR SELECT
  USING (true);

CREATE POLICY "Only admins can modify categories"
  ON categories FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Businesses policies
CREATE POLICY "Active businesses are viewable by everyone"
  ON businesses FOR SELECT
  USING (is_active = true OR owner_id = auth.uid());

CREATE POLICY "Users can create their own business"
  ON businesses FOR INSERT
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update their own business"
  ON businesses FOR UPDATE
  USING (owner_id = auth.uid());

CREATE POLICY "Users can delete their own business"
  ON businesses FOR DELETE
  USING (owner_id = auth.uid());

-- Business categories policies
CREATE POLICY "Business categories are viewable by everyone"
  ON business_categories FOR SELECT
  USING (true);

CREATE POLICY "Business owners can manage their categories"
  ON business_categories FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE id = business_id AND owner_id = auth.uid()
    )
  );

-- Business credentials policies
CREATE POLICY "Business owners can view their credentials"
  ON business_credentials FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE id = business_id AND owner_id = auth.uid()
    )
  );

CREATE POLICY "Business owners can manage their credentials"
  ON business_credentials FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE id = business_id AND owner_id = auth.uid()
    )
  );

-- Service requests policies
CREATE POLICY "Open service requests are viewable by verified businesses"
  ON service_requests FOR SELECT
  USING (
    customer_id = auth.uid()
    OR status = 'open'
    OR EXISTS (
      SELECT 1 FROM quotes
      WHERE service_request_id = service_requests.id
      AND business_id IN (
        SELECT id FROM businesses WHERE owner_id = auth.uid()
      )
    )
  );

CREATE POLICY "Customers can create service requests"
  ON service_requests FOR INSERT
  WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Customers can update their service requests"
  ON service_requests FOR UPDATE
  USING (customer_id = auth.uid());

-- Quotes policies
CREATE POLICY "Quotes viewable by involved parties"
  ON quotes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM service_requests
      WHERE id = service_request_id AND customer_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM businesses
      WHERE id = business_id AND owner_id = auth.uid()
    )
  );

CREATE POLICY "Business owners can create quotes"
  ON quotes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE id = business_id AND owner_id = auth.uid()
    )
  );

CREATE POLICY "Business owners can update their quotes"
  ON quotes FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE id = business_id AND owner_id = auth.uid()
    )
  );

-- Leads policies
CREATE POLICY "Business owners can view their leads"
  ON leads FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE id = business_id AND owner_id = auth.uid()
    )
  );

CREATE POLICY "Business owners can update their leads"
  ON leads FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE id = business_id AND owner_id = auth.uid()
    )
  );

-- Conversations policies
CREATE POLICY "Conversation participants can view"
  ON conversations FOR SELECT
  USING (
    customer_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM businesses
      WHERE id = business_id AND owner_id = auth.uid()
    )
  );

CREATE POLICY "Customers can create conversations"
  ON conversations FOR INSERT
  WITH CHECK (customer_id = auth.uid());

-- Messages policies
CREATE POLICY "Conversation participants can view messages"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE id = conversation_id
      AND (
        customer_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM businesses
          WHERE id = conversations.business_id AND owner_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Conversation participants can send messages"
  ON messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM conversations
      WHERE id = conversation_id
      AND (
        customer_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM businesses
          WHERE id = conversations.business_id AND owner_id = auth.uid()
        )
      )
    )
  );

-- Reviews policies
CREATE POLICY "Reviews are viewable by everyone"
  ON reviews FOR SELECT
  USING (true);

CREATE POLICY "Customers can create reviews"
  ON reviews FOR INSERT
  WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Customers can update their reviews"
  ON reviews FOR UPDATE
  USING (customer_id = auth.uid());

CREATE POLICY "Customers can delete their reviews"
  ON reviews FOR DELETE
  USING (customer_id = auth.uid());

-- Subscriptions policies
CREATE POLICY "Business owners can view their subscription"
  ON subscriptions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE id = business_id AND owner_id = auth.uid()
    )
  );

-- ============================================
-- SEED DATA: Categories
-- ============================================

INSERT INTO categories (name, slug, description, icon) VALUES
('Plumbing', 'plumbing', 'Plumbing services including repairs, installations, and maintenance', 'wrench'),
('Electrical', 'electrical', 'Electrical services including wiring, repairs, and installations', 'zap'),
('HVAC', 'hvac', 'Heating, ventilation, and air conditioning services', 'thermometer'),
('Roofing', 'roofing', 'Roof repair, replacement, and installation services', 'home'),
('Painting', 'painting', 'Interior and exterior painting services', 'paintbrush'),
('Carpentry', 'carpentry', 'Custom carpentry, woodworking, and repairs', 'hammer'),
('Landscaping', 'landscaping', 'Lawn care, garden design, and outdoor maintenance', 'trees'),
('Cleaning', 'cleaning', 'Residential and commercial cleaning services', 'sparkles'),
('Pest Control', 'pest-control', 'Pest extermination and prevention services', 'bug'),
('Appliance Repair', 'appliance-repair', 'Repair services for home appliances', 'settings'),
('Flooring', 'flooring', 'Floor installation, repair, and refinishing', 'layers'),
('Concrete', 'concrete', 'Concrete work including driveways, patios, and foundations', 'construction'),
('Fencing', 'fencing', 'Fence installation and repair services', 'fence'),
('Garage Door', 'garage-door', 'Garage door installation and repair', 'door-open'),
('Locksmith', 'locksmith', 'Lock installation, repair, and emergency services', 'key'),
('Moving', 'moving', 'Local and long-distance moving services', 'truck'),
('Handyman', 'handyman', 'General home repair and maintenance', 'tool'),
('Windows', 'windows', 'Window installation, repair, and replacement', 'square'),
('Drywall', 'drywall', 'Drywall installation, repair, and finishing', 'layout'),
('Masonry', 'masonry', 'Brick, stone, and block work', 'brick-wall');

-- ============================================
-- REALTIME SUBSCRIPTIONS
-- ============================================

-- Enable realtime for specific tables
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE leads;
ALTER PUBLICATION supabase_realtime ADD TABLE quotes;
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
