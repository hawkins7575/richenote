// ============================================================================
// UI 관련 타입 정의
// ============================================================================

// 일반적인 UI 상태
export type LoadingState = "idle" | "loading" | "success" | "error";

export type AlertType = "info" | "success" | "warning" | "error";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "danger"
  | "ghost"
  | "outline";

export type ButtonSize = "sm" | "md" | "lg";

export type InputSize = "sm" | "md" | "lg";

export type ModalSize = "sm" | "md" | "lg" | "xl" | "full";

// 테마 관련
export interface Theme {
  mode: "light" | "dark" | "system";
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
    muted: string;
    border: string;
  };
  fonts: {
    sans: string[];
    mono: string[];
  };
  spacing: Record<string, string>;
}

// 알림/토스트
export interface Toast {
  id: string;
  type: AlertType;
  title: string;
  message?: string;
  duration?: number; // ms, 0 = 자동 닫기 없음
  action?: {
    label: string;
    onClick: () => void;
  };
  closable?: boolean;
}

// 모달 상태
export interface ModalState {
  isOpen: boolean;
  title?: string;
  content?: React.ReactNode;
  size?: ModalSize;
  closable?: boolean;
  onClose?: () => void;
}

// 페이지네이션
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
  has_previous: boolean;
  has_next: boolean;
}

// 정렬
export interface SortOption {
  field: string;
  label: string;
  direction: "asc" | "desc";
}

// 필터 옵션
export interface FilterOption {
  value: string | number | boolean;
  label: string;
  count?: number;
}

// 테이블 컬럼
export interface TableColumn<T = any> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  width?: string | number;
  align?: "left" | "center" | "right";
  render?: (value: any, row: T) => React.ReactNode;
}

// 폼 필드 상태
export interface FormFieldState {
  value: any;
  error?: string;
  touched: boolean;
  dirty: boolean;
}

// 폼 상태
export interface FormState<T = Record<string, any>> {
  values: T;
  errors: Record<keyof T, string | undefined>;
  touched: Record<keyof T, boolean>;
  dirty: Record<keyof T, boolean>;
  isValid: boolean;
  isSubmitting: boolean;
}

// 뷰 모드 (MVP에서 가져온 개념)
export type ViewMode = "card" | "list" | "grid" | "map";

// 사이드바 상태
export interface SidebarState {
  isOpen: boolean;
  isCollapsed: boolean;
  activeItem?: string;
}

// 브레드크럼
export interface BreadcrumbItem {
  label: string;
  href?: string;
  isActive?: boolean;
}

// 검색 상태
export interface SearchState {
  query: string;
  filters: Record<string, any>;
  sort: SortOption;
  view_mode: ViewMode;
  pagination: Pagination;
  isLoading: boolean;
  results: any[];
  total: number;
}

// 대시보드 위젯
export interface DashboardWidget {
  id: string;
  type: "stat" | "chart" | "table" | "map" | "calendar";
  title: string;
  size: "sm" | "md" | "lg" | "xl";
  position: { x: number; y: number; w: number; h: number };
  data?: any;
  config?: Record<string, any>;
  is_visible: boolean;
}

// 차트 데이터
export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
  }[];
}

// 통계 카드
export interface StatCard {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: "increase" | "decrease";
    period: string;
  };
  icon?: React.ReactNode;
  color?: string;
}

// 드롭다운 메뉴 아이템
export interface DropdownItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  separator?: boolean;
}

// 탭
export interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
  disabled?: boolean;
  badge?: string | number;
}

// 파일 업로드 상태
export interface FileUploadState {
  files: File[];
  uploading: boolean;
  progress: number;
  error?: string;
  uploaded_files: {
    name: string;
    url: string;
    size: number;
    type: string;
  }[];
}

// 무한 스크롤
export interface InfiniteScrollState<T> {
  items: T[];
  hasMore: boolean;
  isLoading: boolean;
  error?: string;
  loadMore: () => void;
}
