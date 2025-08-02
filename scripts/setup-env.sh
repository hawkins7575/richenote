#!/bin/bash

# ============================================================================
# PropertyDesk Vercel 환경변수 설정 스크립트
# ============================================================================

echo "🚀 PropertyDesk Vercel 환경변수 설정을 시작합니다..."

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 프로젝트 정보
PROJECT_NAME="propertydesk-saas"
VERCEL_TEAM="daesung75-6440s-projects"

echo -e "${BLUE}📋 설정할 환경변수 목록:${NC}"
echo "  ✅ VITE_SUPABASE_URL"
echo "  ✅ VITE_SUPABASE_ANON_KEY"
echo "  ✅ VITE_APP_ENV"
echo "  ✅ VITE_APP_NAME"
echo "  ✅ VITE_APP_VERSION"
echo "  ✅ VITE_APP_DESCRIPTION"
echo "  ✅ VITE_ENABLE_ANALYTICS"
echo "  ✅ VITE_ENABLE_BETA_FEATURES"

echo ""
echo -e "${YELLOW}⚠️  먼저 Supabase 프로젝트를 생성하고 API Keys를 준비해주세요!${NC}"
echo ""

# Supabase 정보 입력 받기
read -p "🔗 Supabase Project URL을 입력하세요 (예: https://xyz.supabase.co): " SUPABASE_URL
read -p "🔑 Supabase Anon Key를 입력하세요: " SUPABASE_ANON_KEY

# 입력 검증
if [[ -z "$SUPABASE_URL" || -z "$SUPABASE_ANON_KEY" ]]; then
    echo -e "${RED}❌ Supabase URL과 Anon Key는 필수입니다!${NC}"
    exit 1
fi

# URL 형식 검증
if [[ ! "$SUPABASE_URL" =~ ^https://.*\.supabase\.co$ ]]; then
    echo -e "${RED}❌ 올바른 Supabase URL 형식이 아닙니다!${NC}"
    echo "   예시: https://abcdefghijk.supabase.co"
    exit 1
fi

echo ""
echo -e "${BLUE}🔧 Vercel 환경변수를 설정합니다...${NC}"

# Vercel CLI로 환경변수 설정
echo "Setting VITE_SUPABASE_URL..."
vercel env add VITE_SUPABASE_URL production "$SUPABASE_URL" --yes

echo "Setting VITE_SUPABASE_ANON_KEY..."
vercel env add VITE_SUPABASE_ANON_KEY production "$SUPABASE_ANON_KEY" --yes

echo "Setting VITE_APP_ENV..."
vercel env add VITE_APP_ENV production "production" --yes

echo "Setting VITE_APP_NAME..."
vercel env add VITE_APP_NAME production "PropertyDesk" --yes

echo "Setting VITE_APP_VERSION..."
vercel env add VITE_APP_VERSION production "1.0.0-beta" --yes

echo "Setting VITE_APP_DESCRIPTION..."
vercel env add VITE_APP_DESCRIPTION production "부동산 중개업소 전용 매물관리 SaaS" --yes

echo "Setting VITE_ENABLE_ANALYTICS..."
vercel env add VITE_ENABLE_ANALYTICS production "true" --yes

echo "Setting VITE_ENABLE_BETA_FEATURES..."
vercel env add VITE_ENABLE_BETA_FEATURES production "true" --yes

echo ""
echo -e "${GREEN}✅ 환경변수 설정이 완료되었습니다!${NC}"

echo ""
echo -e "${BLUE}🔄 재배포를 시작합니다...${NC}"

# 재배포 실행
vercel --prod

echo ""
echo -e "${GREEN}🎉 PropertyDesk 설정이 완료되었습니다!${NC}"
echo ""
echo -e "${BLUE}📍 배포된 URL:${NC}"
echo "   https://propertydesk-saas-rbkfizen2-daesung75-6440s-projects.vercel.app"
echo ""
echo -e "${YELLOW}📋 다음 단계:${NC}"
echo "   1. Supabase에서 데이터베이스 스키마 실행"
echo "   2. Authentication 설정 확인"
echo "   3. 배포된 사이트에서 회원가입 테스트"
echo "   4. 전체 기능 테스트"
echo ""
echo -e "${GREEN}🚀 베타 테스트를 시작하세요!${NC}"