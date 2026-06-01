"use client";

import { Skeleton } from '../Skeleton';

export default function HomeSkeleton() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="w-full max-w-3xl space-y-8 rounded-[40px] border border-accent/40 p-10">
        <div className="flex flex-col items-center gap-6">
          <Skeleton className="h-20 w-20 rounded-3xl" />
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-12 w-full max-w-md" />
          <Skeleton className="h-4 w-full max-w-lg" />
          <Skeleton className="h-4 w-[80%] max-w-md" />
          <Skeleton className="h-12 w-48 rounded-full" />
        </div>
      </div>
    </div>
  );
}
