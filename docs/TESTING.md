# 테스팅 가이드

이 문서는 PropertyDesk 프로젝트의 테스트 설정과 실행 방법을 설명합니다.

## 테스트 도구

- **Vitest**: 빠른 단위 테스트 및 통합 테스트
- **Testing Library**: React 컴포넌트 테스트
- **jsdom**: 브라우저 환경 시뮬레이션
- **V8**: 코드 커버리지 측정

## 테스트 명령어

```bash
# 테스트 실행 (watch 모드)
npm test

# 테스트 한 번 실행
npm run test:run

# 커버리지 포함 테스트 실행
npm run test:coverage

# 테스트 UI (브라우저에서 확인)
npm run test:ui

# 테스트 watch 모드 (파일 변경 시 자동 실행)
npm run test:watch
```

## 테스트 구조

### 디렉토리 구조
```
src/
├── lib/
│   └── repository/
│       └── __tests__/
│           └── BaseRepository.test.ts
├── services/
│   └── __tests__/
│       └── propertyServiceV2.test.ts
├── utils/
│   └── __tests__/
│       └── logger.test.ts
└── test/
    ├── setup.ts
    └── mocks/
        └── supabase.ts
```

### 테스트 파일 명명 규칙
- 단위 테스트: `*.test.ts`
- 통합 테스트: `*.integration.test.ts`
- 컴포넌트 테스트: `*.test.tsx`

## 코드 커버리지

### 커버리지 임계값
- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 80%
- **Statements**: 80%

### 커버리지 제외 파일
- `node_modules/`
- `src/test/`
- `src/**/*.d.ts`
- `src/**/*.stories.{ts,tsx}`
- `dist/`
- 설정 파일들
- `src/main.tsx`

## Mock 설정

### Supabase Mock
`src/test/mocks/supabase.ts`에서 Supabase 클라이언트 mock을 제공합니다.

```typescript
import { mockSupabaseClient, mockProperty, mockUser } from '@/test/mocks/supabase'

// 테스트에서 사용
mockSupabaseClient.from().select.mockResolvedValue({
  data: [mockProperty],
  error: null
})
```

### 환경 변수 Mock
`src/test/setup.ts`에서 테스트 환경 변수를 설정합니다.

## 테스트 작성 가이드

### 1. 단위 테스트 (Repository)

```typescript
describe('BaseRepository', () => {
  let repository: TestRepository

  beforeEach(() => {
    repository = new TestRepository()
    vi.clearAllMocks()
  })

  it('성공적으로 ID로 레코드를 조회한다', async () => {
    const mockData = { id: '1', name: 'Test Item' }
    mockSupabaseClient.from().single.mockResolvedValue({
      data: mockData,
      error: null
    })

    const result = await repository.findById('1')

    expect(result).toEqual(mockData)
  })
})
```

### 2. 서비스 테스트

```typescript
describe('PropertyServiceV2', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('사용자의 매물 목록을 조회한다', async () => {
    mockPropertyRepository.findByTenantId.mockResolvedValue([mockProperty])

    const result = await PropertyServiceV2.getProperties('user-1')

    expect(result).toEqual([mockProperty])
    expect(mockPropertyRepository.findByTenantId).toHaveBeenCalledWith(
      'tenant-1',
      undefined,
      expect.any(Object)
    )
  })
})
```

### 3. 컴포넌트 테스트

```typescript
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

describe('PropertyCard', () => {
  it('매물 정보를 표시한다', () => {
    render(<PropertyCard property={mockProperty} />)
    
    expect(screen.getByText(mockProperty.title)).toBeInTheDocument()
    expect(screen.getByText(mockProperty.address)).toBeInTheDocument()
  })

  it('클릭 시 상세 페이지로 이동한다', async () => {
    const user = userEvent.setup()
    const onClickMock = vi.fn()
    
    render(<PropertyCard property={mockProperty} onClick={onClickMock} />)
    
    await user.click(screen.getByText(mockProperty.title))
    expect(onClickMock).toHaveBeenCalledWith(mockProperty)
  })
})
```

## 테스트 베스트 프랙티스

### 1. AAA 패턴 사용
- **Arrange**: 테스트 데이터 준비
- **Act**: 테스트 대상 함수 실행
- **Assert**: 결과 검증

### 2. 테스트 격리
- 각 테스트는 독립적이어야 함
- `beforeEach`에서 mock 초기화
- 전역 상태 변경 금지

### 3. 의미 있는 테스트 작성
- 테스트 이름은 무엇을 테스트하는지 명확히 표현
- Edge case와 error case 포함
- 비즈니스 로직 중심으로 테스트

### 4. Mock 사용 가이드
- 외부 의존성(API, DB)은 mock 사용
- Mock은 실제 API와 동일한 형태로 작성
- 과도한 mock 사용 지양

## CI/CD 통합

### GitHub Actions 설정 예시
```yaml
- name: Run tests
  run: npm run test:run

- name: Generate coverage
  run: npm run test:coverage

- name: Upload coverage
  uses: codecov/codecov-action@v3
```

## 트러블슈팅

### 자주 발생하는 문제

1. **Import 경로 오류**
   - `vitest.config.ts`의 alias 설정 확인
   - 절대 경로(`@/`) 사용 권장

2. **Mock이 작동하지 않음**
   - `vi.clearAllMocks()` 호출 확인
   - Mock 설정 순서 확인

3. **환경 변수 관련 오류**
   - `setup.ts`의 환경 변수 설정 확인
   - `vi.stubEnv()` 사용

4. **비동기 테스트 오류**
   - `async/await` 올바른 사용
   - Promise rejection 처리

## 성능 최적화

- 불필요한 테스트 파일 제외
- Mock 데이터 재사용
- 테스트 병렬 실행 활용
- 커버리지 측정 최적화

이 가이드를 통해 효과적인 테스트를 작성하고 품질 높은 코드를 유지하시기 바랍니다.