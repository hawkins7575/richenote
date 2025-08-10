-- ============================================================================
-- 스케줄 관리를 위한 테이블 생성 SQL
-- ============================================================================

-- schedules 테이블 생성
CREATE TABLE public.schedules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    all_day BOOLEAN DEFAULT false NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN (
        'property_viewing', 
        'contract_signing', 
        'maintenance', 
        'client_meeting', 
        'team_meeting', 
        'personal', 
        'other'
    )),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN (
        'scheduled', 
        'in_progress', 
        'completed', 
        'cancelled', 
        'postponed'
    )),
    property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
    attendees TEXT[], -- 참석자 user IDs 배열
    location VARCHAR(255),
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 인덱스 생성
CREATE INDEX idx_schedules_tenant_id ON public.schedules(tenant_id);
CREATE INDEX idx_schedules_created_by ON public.schedules(created_by);
CREATE INDEX idx_schedules_start_date ON public.schedules(start_date);
CREATE INDEX idx_schedules_category ON public.schedules(category);
CREATE INDEX idx_schedules_status ON public.schedules(status);
CREATE INDEX idx_schedules_property_id ON public.schedules(property_id) WHERE property_id IS NOT NULL;

-- updated_at 자동 업데이트 트리거
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_schedules_updated_at
    BEFORE UPDATE ON public.schedules
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- RLS (Row Level Security) 정책 설정
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신이 속한 테넌트의 스케줄만 조회 가능
CREATE POLICY "Users can view schedules in their tenant" ON public.schedules
    FOR SELECT USING (
        tenant_id IN (
            SELECT tm.tenant_id FROM public.tenant_members tm
            WHERE tm.user_id = auth.uid() AND tm.status = 'active'
        )
    );

-- 사용자는 자신이 속한 테넌트에 스케줄 생성 가능
CREATE POLICY "Users can create schedules in their tenant" ON public.schedules
    FOR INSERT WITH CHECK (
        tenant_id IN (
            SELECT tm.tenant_id FROM public.tenant_members tm
            WHERE tm.user_id = auth.uid() AND tm.status = 'active'
        )
        AND created_by = auth.uid()
    );

-- 사용자는 자신이 생성한 스케줄 또는 관리자 권한이 있으면 수정 가능
CREATE POLICY "Users can update their own schedules or with admin role" ON public.schedules
    FOR UPDATE USING (
        (created_by = auth.uid() OR 
         EXISTS (
            SELECT 1 FROM public.tenant_members tm
            WHERE tm.user_id = auth.uid() 
            AND tm.tenant_id = schedules.tenant_id
            AND tm.role IN ('owner', 'admin')
            AND tm.status = 'active'
         ))
        AND tenant_id IN (
            SELECT tm.tenant_id FROM public.tenant_members tm
            WHERE tm.user_id = auth.uid() AND tm.status = 'active'
        )
    );

-- 사용자는 자신이 생성한 스케줄 또는 관리자 권한이 있으면 삭제 가능
CREATE POLICY "Users can delete their own schedules or with admin role" ON public.schedules
    FOR DELETE USING (
        (created_by = auth.uid() OR 
         EXISTS (
            SELECT 1 FROM public.tenant_members tm
            WHERE tm.user_id = auth.uid() 
            AND tm.tenant_id = schedules.tenant_id
            AND tm.role IN ('owner', 'admin')
            AND tm.status = 'active'
         ))
        AND tenant_id IN (
            SELECT tm.tenant_id FROM public.tenant_members tm
            WHERE tm.user_id = auth.uid() AND tm.status = 'active'
        )
    );

-- 샘플 데이터 (선택사항)
/*
INSERT INTO public.schedules (
    title, 
    description, 
    start_date, 
    end_date, 
    category, 
    priority, 
    created_by, 
    tenant_id,
    location
) VALUES 
(
    '강남 아파트 매물 보기', 
    '고객과 함께 강남 아파트 내부 확인 예정', 
    '2024-12-20 14:00:00+09', 
    '2024-12-20 15:00:00+09', 
    'property_viewing', 
    'high',
    'user-uuid-here', 
    'tenant-uuid-here',
    '서울시 강남구'
);
*/