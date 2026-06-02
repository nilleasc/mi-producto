'use client';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  count?: number;
}

/**
 * Componente Skeleton para estados de carga
 * 
 * Muestra placeholders animados mientras se cargan datos.
 */
export function Skeleton({
  className = '',
  variant = 'text',
  width,
  height,
  count = 1,
}: SkeletonProps) {
  const getVariantClass = () => {
    switch (variant) {
      case 'circular':
        return 'rounded-full';
      case 'rectangular':
        return 'rounded-md';
      case 'text':
        return 'rounded';
    }
  };

  const getDefaultHeight = () => {
    switch (variant) {
      case 'text':
        return '1rem';
      case 'circular':
        return '3rem';
      case 'rectangular':
        return '8rem';
    }
  };

  const style = {
    width: width || (variant === 'circular' ? '3rem' : '100%'),
    height: height || getDefaultHeight(),
  };

  const skeletonElement = (
    <div
      className={`
        bg-gray-200 animate-pulse
        ${getVariantClass()}
        ${className}
      `}
      style={style}
      aria-hidden="true"
    />
  );

  if (count === 1) {
    return skeletonElement;
  }

  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index}>{skeletonElement}</div>
      ))}
    </div>
  );
}

/**
 * Skeleton para CartItem
 */
export function CartItemSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <Skeleton width="60%" height="1.25rem" />
          <Skeleton width="40%" height="0.75rem" className="mt-1" />
        </div>
        <Skeleton variant="circular" width="1.5rem" height="1.5rem" />
      </div>
      <div className="space-y-2 mt-4">
        <Skeleton width="100%" height="1rem" />
        <Skeleton width="80%" height="1rem" />
      </div>
    </div>
  );
}

/**
 * Skeleton para ProductSearch
 */
export function ProductSearchSkeleton() {
  return (
    <div className="bg-green-50 border border-green-200 rounded-md p-4">
      <Skeleton width="50%" height="1rem" className="mb-2" />
      <div className="space-y-2">
        <Skeleton width="100%" height="0.875rem" />
        <Skeleton width="100%" height="0.875rem" />
        <Skeleton width="80%" height="0.875rem" />
      </div>
      <Skeleton width="100%" height="2.5rem" className="mt-4" />
    </div>
  );
}
