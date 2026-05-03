import React from 'react';

export const Skeleton = ({ className = '', variant = 'text' }) => {
  const baseClasses = 'animate-pulse bg-slate-200 rounded';
  
  const variants = {
    text: 'h-4 w-full',
    title: 'h-6 w-3/4',
    avatar: 'h-12 w-12 rounded-full',
    card: 'h-32 w-full rounded-xl',
    image: 'h-48 w-full rounded-lg',
    button: 'h-10 w-24 rounded-lg',
    input: 'h-10 w-full rounded-lg',
  };

  return (
    <div className={`${baseClasses} ${variants[variant]} ${className}`} />
  );
};

export const SkeletonCard = ({ children, className = '' }) => {
  return (
    <div className={`card p-6 ${className}`}>
      {children}
    </div>
  );
};

export const DocumentCardSkeleton = () => (
  <div className="card p-5 animate-pulse">
    <div className="flex items-center gap-4 mb-4">
      <Skeleton variant="avatar" />
      <div className="flex-1">
        <Skeleton variant="title" className="mb-2" />
        <Skeleton variant="text" className="w-1/2" />
      </div>
    </div>
    <div className="flex gap-2">
      <Skeleton variant="button" />
      <Skeleton variant="button" />
    </div>
  </div>
);

export const TableRowSkeleton = ({ columns = 4 }) => (
  <tr className="border-b border-slate-100">
    {Array.from({ length: columns }).map((_, idx) => (
      <td key={idx} className="px-6 py-4">
        <Skeleton variant="text" />
      </td>
    ))}
  </tr>
);

export const StatCardSkeleton = () => (
  <div className="card p-6 animate-pulse">
    <div className="flex items-center justify-between">
      <div>
        <Skeleton variant="text" className="w-20 mb-2" />
        <Skeleton variant="title" className="w-16" />
      </div>
      <Skeleton variant="avatar" />
    </div>
  </div>
);

export const ChartSkeleton = () => (
  <div className="card p-6 animate-pulse">
    <Skeleton variant="title" className="w-40 mb-4" />
    <div className="h-48 flex items-end gap-2">
      {[1, 2, 3, 4, 5, 6, 7].map((i) => (
        <Skeleton key={i} variant="card" className="flex-1" />
      ))}
    </div>
  </div>
);

export const ProfileSkeleton = () => (
  <div className="card p-6 animate-pulse">
    <div className="flex items-center gap-6 mb-6">
      <Skeleton variant="avatar" className="w-20 h-20" />
      <div>
        <Skeleton variant="title" className="w-40 mb-2" />
        <Skeleton variant="text" className="w-60" />
      </div>
    </div>
    <div className="space-y-4">
      <Skeleton variant="input" />
      <Skeleton variant="input" />
      <Skeleton variant="button" className="w-32" />
    </div>
  </div>
);