// ============================================================================
// Card 컴포넌트 - 카드 레이아웃
// ============================================================================

import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/utils/cn'

const cardVariants = cva(
  'card rounded-lg border bg-white transition-all duration-200',
  {
    variants: {
      variant: {
        default: 'border-gray-200 shadow-sm hover:shadow-md',
        elevated: 'border-gray-200 shadow-lg hover:shadow-xl',
        outline: 'border-gray-300',
        ghost: 'border-transparent shadow-none',
      },
      padding: {
        none: '',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
      },
      clickable: {
        true: 'cursor-pointer hover:border-gray-300 transform hover:-translate-y-0.5',
      },
    },
    defaultVariants: {
      variant: 'default',
      padding: 'md',
    },
  }
)

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  children: React.ReactNode
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, clickable, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(cardVariants({ variant, padding, clickable }), className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'

// 카드 헤더 컴포넌트
export const CardHeader: React.FC<{
  children: React.ReactNode
  className?: string
}> = ({ children, className }) => (
  <div className={cn('flex flex-col space-y-1.5 p-6 pb-4', className)}>
    {children}
  </div>
)

// 카드 타이틀 컴포넌트
export const CardTitle: React.FC<{
  children: React.ReactNode
  className?: string
}> = ({ children, className }) => (
  <h3 className={cn('text-lg font-semibold leading-none tracking-tight', className)}>
    {children}
  </h3>
)

// 카드 설명 컴포넌트
export const CardDescription: React.FC<{
  children: React.ReactNode
  className?: string
}> = ({ children, className }) => (
  <p className={cn('text-sm text-gray-600', className)}>
    {children}
  </p>
)

// 카드 컨텐츠 컴포넌트
export const CardContent: React.FC<{
  children: React.ReactNode
  className?: string
}> = ({ children, className }) => (
  <div className={cn('p-6 pt-0', className)}>
    {children}
  </div>
)

// 카드 푸터 컴포넌트
export const CardFooter: React.FC<{
  children: React.ReactNode
  className?: string
}> = ({ children, className }) => (
  <div className={cn('flex items-center p-6 pt-0', className)}>
    {children}
  </div>
)

export { Card, cardVariants }