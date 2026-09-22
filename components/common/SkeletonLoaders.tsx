"use client";

import React from "react";

export function SkeletonBox({ className = "" }: { className?: string }) {
  return <div className={`skeleton-shimmer rounded-xl ${className}`} />;
}

export function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-[#e8e1d8] bg-white p-5 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <SkeletonBox className="h-4 w-1/3" />
        <SkeletonBox className="h-5 w-16 rounded-full" />
      </div>
      <SkeletonBox className="h-6 w-3/4" />
      <SkeletonBox className="h-4 w-1/2" />
      <div className="pt-2 flex gap-2">
        <SkeletonBox className="h-8 flex-1 rounded-xl" />
        <SkeletonBox className="h-8 flex-1 rounded-xl" />
      </div>
    </div>
  );
}

export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-[#e8e1d8] bg-white p-4 shadow-sm space-y-2">
          <SkeletonBox className="h-8 w-8 rounded-xl" />
          <SkeletonBox className="h-3 w-20" />
          <SkeletonBox className="h-6 w-16" />
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="rounded-2xl border border-[#e8e1d8] bg-white overflow-hidden p-4 space-y-3">
      <div className="flex justify-between pb-2 border-b border-gray-100">
        <SkeletonBox className="h-4 w-24" />
        <SkeletonBox className="h-4 w-32" />
        <SkeletonBox className="h-4 w-20" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
          <div className="space-y-1 w-1/3">
            <SkeletonBox className="h-4 w-full" />
            <SkeletonBox className="h-3 w-2/3" />
          </div>
          <SkeletonBox className="h-4 w-20" />
          <SkeletonBox className="h-6 w-16 rounded-full" />
        </div>
      ))}
    </div>
  );
}

export function ListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}
