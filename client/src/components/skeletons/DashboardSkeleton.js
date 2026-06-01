"use client";

import { Skeleton } from '../Skeleton';

export default function DashboardSkeleton() {
  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-64 shrink-0 border-r border-accent/30 p-5 sm:flex sm:flex-col sm:justify-between lg:w-72">
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <Skeleton className="h-11 w-11 rounded-2xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-12" />
              <Skeleton className="h-5 w-24" />
            </div>
          </div>
          <div className="space-y-2">
            <Skeleton className="h-10 w-full rounded-2xl" />
            <Skeleton className="h-10 w-full rounded-2xl" />
            <Skeleton className="h-10 w-full rounded-2xl" />
          </div>
        </div>
        <div className="space-y-3">
          <Skeleton className="h-20 w-full rounded-2xl" />
          <Skeleton className="h-11 w-full rounded-full" />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="border-b border-accent/30 px-6 py-5 lg:px-10">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="mt-3 h-9 w-72 max-w-full" />
        </header>
        <main className="flex-1 space-y-6 px-6 py-6 lg:px-10 lg:py-8">
          <div className="grid gap-5 sm:grid-cols-2">
            <Skeleton className="h-28 rounded-2xl" />
            <Skeleton className="h-28 rounded-2xl" />
          </div>
          <Skeleton className="h-40 rounded-2xl" />
        </main>
      </div>
    </div>
  );
}
