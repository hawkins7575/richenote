// ============================================================================
// Badge 컴포넌트 - 상태 표시 뱃지
// ============================================================================

import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/utils/cn";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-gray-100 text-gray-800",
        primary: "bg-primary-100 text-primary-800",
        secondary: "bg-gray-100 text-gray-600",
        success: "bg-green-100 text-green-800",
        warning: "bg-yellow-100 text-yellow-800",
        danger: "bg-red-100 text-red-800",
        info: "bg-blue-100 text-blue-800",
        // 매물 상태별 색상 (MVP 호환)
        available: "bg-green-100 text-green-800", // 판매중
        reserved: "bg-yellow-100 text-yellow-800", // 예약중
        sold: "bg-gray-100 text-gray-600", // 거래완료
        // 거래유형별 색상 (MVP 호환)
        sale: "bg-red-100 text-red-700", // 매매
        jeonse: "bg-green-100 text-green-700", // 전세
        monthly: "bg-blue-100 text-blue-700", // 월세
        // 테넌트 색상
        tenant: "bg-tenant-primary bg-opacity-10 text-tenant-primary",
      },
      size: {
        sm: "px-2 py-0.5 text-xs",
        md: "px-2.5 py-0.5 text-xs",
        lg: "px-3 py-1 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  children: React.ReactNode;
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, size, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(badgeVariants({ variant, size }), className)}
        {...props}
      >
        {children}
      </div>
    );
  },
);

Badge.displayName = "Badge";

// 매물 상태 뱃지 (MVP 호환)
export const PropertyStatusBadge: React.FC<{
  status: "거래중" | "거래완료";
  className?: string;
}> = ({ status, className }) => {
  const variantMap = {
    거래중: "available",
    거래완료: "sold",
  } as const;

  return (
    <Badge variant={variantMap[status]} className={className}>
      {status}
    </Badge>
  );
};

// 거래유형 뱃지 (MVP 호환)
export const TransactionTypeBadge: React.FC<{
  type: "매매" | "전세" | "월세" | "단기임대";
  className?: string;
}> = ({ type, className }) => {
  const variantMap = {
    매매: "sale",
    전세: "jeonse",
    월세: "monthly",
    단기임대: "info",
  } as const;

  return (
    <Badge variant={variantMap[type]} className={className}>
      {type}
    </Badge>
  );
};

export { Badge, badgeVariants };
