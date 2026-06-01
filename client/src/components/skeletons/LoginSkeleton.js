"use client";

import { Skeleton } from '../Skeleton';

export default function LoginSkeleton() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="border-b border-accent/30 px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center gap-3">
          <Skeleton className="h-11 w-11 rounded-2xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-5 w-28" />
          </div>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center px-6 py-10">
        <div className="w-full max-w-2xl space-y-8 rounded-[32px] border border-accent/40 p-8">
          <div className="space-y-3 text-center">
            <Skeleton className="mx-auto h-4 w-40" />
            <Skeleton className="mx-auto h-10 w-64" />
            <Skeleton className="mx-auto h-4 w-full max-w-md" />
            <Skeleton className="mx-auto h-4 w-[75%] max-w-sm" />
          </div>
          <div className="space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-12 w-full rounded-3xl" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-12 w-full rounded-3xl" />
            </div>
            <Skeleton className="h-12 w-full rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
