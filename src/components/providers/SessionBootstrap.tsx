'use client';

import { useEffect } from 'react';
import { useUIStore } from '@/store/uiStore';

export function SessionBootstrap({ children }: { children: React.ReactNode }) {
  const { setCurrentUser } = useUIStore();

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(data => {
        if (data.success && data.user) {
          setCurrentUser(data.user);
        }
      })
      .catch(() => {});
  }, [setCurrentUser]);

  return <>{children}</>;
}
