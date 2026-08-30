'use client';

import { useEffect } from 'react';
import { useUIStore } from '@/store/uiStore';
import { requestNotificationPermission, scheduleMatchReminder, notifyResultPending } from '@/lib/notifications';

export function SessionBootstrap({ children }: { children: React.ReactNode }) {
  const { setCurrentUser } = useUIStore();

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(data => {
        if (data.success && data.user) {
          setCurrentUser(data.user);

          // Request notification permission if supported
          requestNotificationPermission().then(granted => {
            if (granted) {
              // Sync user's upcoming matches & duels to schedule alarms
              fetch(`/api/challenges?userId=${data.user.id}`)
                .then(cr => cr.json())
                .then(cdata => {
                  if (cdata.success && Array.isArray(cdata.challenges)) {
                    cdata.challenges.forEach((ch: any) => {
                      if (ch.status === 'accepted' && ch.match_time) {
                        scheduleMatchReminder(ch.id, ch.sport, ch.ground, ch.match_time, 60);
                        scheduleMatchReminder(ch.id, ch.sport, ch.ground, ch.match_time, 15);
                      }
                      if (ch.status === 'awaiting_confirmation' && ch.reported_by_id !== data.user.id) {
                        notifyResultPending(ch.reported_by_name || 'Opponent', ch.sport);
                      }
                    });
                  }
                })
                .catch(() => {});
            }
          });
        }
      })
      .catch(() => {});
  }, [setCurrentUser]);

  return <>{children}</>;
}
