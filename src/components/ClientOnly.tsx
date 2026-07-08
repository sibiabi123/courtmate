'use client';

import { useEffect, useState, type ReactNode } from 'react';

interface ClientOnlyProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * ClientOnly — Renders children only after hydration.
 * Use this to wrap Three.js, dynamic forms, and any component that
 * reads browser-only APIs (window, navigator, IndexedDB) to prevent
 * Next.js SSR hydration mismatches.
 */
export function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <>{fallback}</>;
  return <>{children}</>;
}
