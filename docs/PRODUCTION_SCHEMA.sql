-- ============================================================================
-- PropertyDesk Production Database Schema
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. TENANTS TABLE (멀티테넌트 업체 관리)
-- ============================================================================
CREATE TABLE tenants (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  domain TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 2. USER PROFILES TABLE (사용자 확장 정보)
-- ============================================================================
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('owner', 'manager', 'agent', 'viewer')),
  company TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 3. PROPERTIES TABLE (매물 관리)
-- ============================================================================
CREATE TABLE properties (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- 기본 정보
  title TEXT NOT NULL,
  address TEXT NOT NULL,
  property_type TEXT NOT NULL CHECK (property_type IN ('아파트', '오피스텔', '빌라', '원룸', '투룸', '기타')),
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('매매', '전세', '월세')),
  
  -- 가격 정보 (단위: 만원)
  price DECIMAL(15,2),
  deposit DECIMAL(15,2),
  monthly_rent DECIMAL(15,2),
  
  -- 상세 정보
  floor_current INTEGER,
  floor_total INTEGER,
  area_exclusive DECIMAL(10,2), -- 전용면적 (㎡)
  rooms INTEGER DEFAULT 1,
  bathrooms INTEGER DEFAULT 1,
  
  -- 추가 정보
  description TEXT,
  images TEXT[] DEFAULT '{}',
  videos TEXT[] DEFAULT '{}',
  virtual_tour_url TEXT,
  
  -- 메타데이터
  is_active BOOLEAN DEFAULT true,
  featured BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 4. USER INVITATIONS TABLE (팀원 초대 관리)
-- ============================================================================
CREATE TABLE user_invitations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  invited_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('manager', 'agent', 'viewer')),
  message TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired')),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 5. ACTIVITY LOGS TABLE (활동 로그)
-- ============================================================================
CREATE TABLE activity_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 6. INDEXES (성능 최적화)
-- ============================================================================

-- 텐넌트 관련 인덱스
CREATE INDEX idx_user_profiles_tenant_id ON user_profiles(tenant_id);
CREATE INDEX idx_properties_tenant_id ON properties(tenant_id);
CREATE INDEX idx_user_invitations_tenant_id ON user_invitations(tenant_id);

-- 매물 검색 최적화
CREATE INDEX idx_properties_type ON properties(property_type);
CREATE INDEX idx_properties_transaction ON properties(transaction_type);
CREATE INDEX idx_properties_active ON properties(is_active);
CREATE INDEX idx_properties_address ON properties USING gin(to_tsvector('korean', address));
CREATE INDEX idx_properties_title ON properties USING gin(to_tsvector('korean', title));

-- 활동 로그 최적화
CREATE INDEX idx_activity_logs_tenant_user ON activity_logs(tenant_id, user_id);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at DESC);

-- ============================================================================
-- 7. ROW LEVEL SECURITY (RLS) 정책
-- ============================================================================

-- RLS 활성화
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- TENANTS 정책
-- ============================================================================
CREATE POLICY "Users can view their own tenant" ON tenants
  FOR SELECT USING (
    id IN (
      SELECT tenant_id FROM user_profiles 
      WHERE user_profiles.id = auth.uid()
    )
  );

CREATE POLICY "Owners can update their tenant" ON tenants
  FOR UPDATE USING (
    id IN (
      SELECT tenant_id FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND role = 'owner'
    )
  );

-- ============================================================================
-- USER_PROFILES 정책
-- ============================================================================
CREATE POLICY "Users can view profiles in their tenant" ON user_profiles
  FOR SELECT USING (
    tenant_id IN (
      SELECT tenant_id FROM user_profiles 
      WHERE user_profiles.id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Managers can insert new profiles" ON user_profiles
  FOR INSERT WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND role IN ('owner', 'manager')
    )
  );

-- ============================================================================
-- PROPERTIES 정책
-- ============================================================================
CREATE POLICY "Users can view properties in their tenant" ON properties
  FOR SELECT USING (
    tenant_id IN (
      SELECT tenant_id FROM user_profiles 
      WHERE user_profiles.id = auth.uid()
    )
  );

CREATE POLICY "Agents can insert properties" ON properties
  FOR INSERT WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND role IN ('owner', 'manager', 'agent')
    )
    AND user_id = auth.uid()
  );

CREATE POLICY "Users can update their own properties" ON properties
  FOR UPDATE USING (
    user_id = auth.uid() 
    OR tenant_id IN (
      SELECT tenant_id FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND role IN ('owner', 'manager')
    )
  );

CREATE POLICY "Users can delete their own properties" ON properties
  FOR DELETE USING (
    user_id = auth.uid() 
    OR tenant_id IN (
      SELECT tenant_id FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND role IN ('owner', 'manager')
    )
  );

-- ============================================================================
-- USER_INVITATIONS 정책
-- ============================================================================
CREATE POLICY "Users can view invitations in their tenant" ON user_invitations
  FOR SELECT USING (
    tenant_id IN (
      SELECT tenant_id FROM user_profiles 
      WHERE user_profiles.id = auth.uid()
    )
  );

CREATE POLICY "Managers can create invitations" ON user_invitations
  FOR INSERT WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND role IN ('owner', 'manager')
    )
    AND invited_by = auth.uid()
  );

-- ============================================================================
-- ACTIVITY_LOGS 정책
-- ============================================================================
CREATE POLICY "Users can view activity logs in their tenant" ON activity_logs
  FOR SELECT USING (
    tenant_id IN (
      SELECT tenant_id FROM user_profiles 
      WHERE user_profiles.id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own activity logs" ON activity_logs
  FOR INSERT WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM user_profiles 
      WHERE user_profiles.id = auth.uid()
    )
    AND user_id = auth.uid()
  );

-- ============================================================================
-- 8. FUNCTIONS (유틸리티 함수들)
-- ============================================================================

-- 텐넌트 생성 시 첫 사용자를 Owner로 설정하는 함수
CREATE OR REPLACE FUNCTION create_tenant_and_owner(
  tenant_name TEXT,
  user_name TEXT,
  user_company TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  new_tenant_id UUID;
BEGIN
  -- 새 테넌트 생성
  INSERT INTO tenants (name) 
  VALUES (tenant_name) 
  RETURNING id INTO new_tenant_id;
  
  -- 현재 사용자를 Owner로 설정
  INSERT INTO user_profiles (id, tenant_id, name, role, company)
  VALUES (auth.uid(), new_tenant_id, user_name, 'owner', user_company);
  
  RETURN new_tenant_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 매물 통계 조회 함수
CREATE OR REPLACE FUNCTION get_property_stats(tenant_uuid UUID)
RETURNS TABLE (
  total_properties BIGINT,
  total_by_type JSONB,
  total_by_transaction JSONB,
  average_price DECIMAL,
  recent_properties BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM properties WHERE tenant_id = tenant_uuid AND is_active = true),
    (SELECT jsonb_object_agg(property_type, count) 
     FROM (SELECT property_type, COUNT(*) as count 
           FROM properties 
           WHERE tenant_id = tenant_uuid AND is_active = true 
           GROUP BY property_type) t),
    (SELECT jsonb_object_agg(transaction_type, count) 
     FROM (SELECT transaction_type, COUNT(*) as count 
           FROM properties 
           WHERE tenant_id = tenant_uuid AND is_active = true 
           GROUP BY transaction_type) t),
    (SELECT COALESCE(AVG(
       CASE 
         WHEN transaction_type = '월세' THEN deposit + (monthly_rent * 12)
         ELSE price 
       END
     ), 0) FROM properties WHERE tenant_id = tenant_uuid AND is_active = true),
    (SELECT COUNT(*) FROM properties 
     WHERE tenant_id = tenant_uuid 
     AND is_active = true 
     AND created_at >= NOW() - INTERVAL '30 days');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 9. TRIGGERS (자동 업데이트)
-- ============================================================================

-- updated_at 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 각 테이블에 updated_at 트리거 추가
CREATE TRIGGER update_tenants_updated_at 
  BEFORE UPDATE ON tenants 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at 
  BEFORE UPDATE ON user_profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_properties_updated_at 
  BEFORE UPDATE ON properties 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 10. INITIAL DATA (기본 데이터)
-- ============================================================================

-- 샘플 테넌트 생성 (개발/테스트용)
INSERT INTO tenants (id, name, domain) VALUES 
  ('00000000-0000-0000-0000-000000000001', 'PropertyDesk Demo', 'demo.propertydesk.com');

-- ============================================================================
-- SCHEMA SETUP COMPLETE ✅
-- ============================================================================

-- 스키마 버전 정보
CREATE TABLE schema_version (
  version TEXT PRIMARY KEY,
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO schema_version (version) VALUES ('1.0.0-beta');

-- 설정 완료 메시지
DO $$
BEGIN
  RAISE NOTICE '🎉 PropertyDesk Production Database Schema 설정 완료!';
  RAISE NOTICE '📊 생성된 테이블: tenants, user_profiles, properties, user_invitations, activity_logs';
  RAISE NOTICE '🔐 RLS 정책 적용 완료';
  RAISE NOTICE '⚡ 인덱스 및 성능 최적화 완료';
  RAISE NOTICE '🔧 유틸리티 함수 및 트리거 설정 완료';
END $$;