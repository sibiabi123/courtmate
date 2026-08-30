'use client';

// Web Notification permission requester
export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  try {
    const result = await Notification.requestPermission();
    return result === 'granted';
  } catch {
    return false;
  }
}

// Show standard or tactical notification
export function showNotification(
  title: string,
  options: { body: string; icon?: string; tag?: string; badge?: string; data?: any }
) {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;

  try {
    const notif = new Notification(title, {
      body: options.body,
      icon: options.icon || '/icons/icon-192x192.png',
      tag: options.tag,
      badge: options.badge || '/icons/icon-192x192.png',
      ...options.data,
    });

    notif.onclick = () => {
      window.focus();
      notif.close();
    };
  } catch {}
}

// Schedule local alarm countdown for upcoming matches
export function scheduleMatchReminder(
  matchId: string,
  sport: string,
  venue: string,
  scheduledAt: string,
  minutesBefore: number = 30
) {
  if (typeof window === 'undefined') return;
  const matchTime = new Date(scheduledAt).getTime();
  const fireAt = matchTime - minutesBefore * 60 * 1000;
  const delay = fireAt - Date.now();

  // Only schedule if future and within next 24 hours
  if (delay <= 0 || delay > 24 * 60 * 60 * 1000) return;

  const key = `courtmate_alarm_${matchId}_${minutesBefore}m`;
  if (sessionStorage.getItem(key)) return; // Already scheduled this session

  const timerId = window.setTimeout(() => {
    showNotification(
      minutesBefore >= 60 ? `⏰ Match Starting in 1 Hour!` : `🚨 ${minutesBefore} Mins to Match Kickoff!`,
      {
        body: `Your ${sport} match at ${venue} is starting soon. Head to the court!`,
        tag: `match_${matchId}`,
      }
    );
    sessionStorage.removeItem(key);
  }, delay);

  sessionStorage.setItem(key, String(timerId));
}

// Tactical event notifications
export function notifyNewChallenge(challengerName: string, sport: string) {
  showNotification('⚔️ New Ranked Duel Challenge!', {
    body: `${challengerName} issued you a ${sport} duel! Open CourtMate to accept or decline.`,
    tag: 'duel_challenge',
  });
}

export function notifyLobbyFull(sport: string, venue: string) {
  showNotification('🏅 Squad Lobby Complete!', {
    body: `Your ${sport} match at ${venue} is fully locked in with all slots filled.`,
    tag: 'lobby_complete',
  });
}

export function notifyResultPending(opponentName: string, sport: string) {
  showNotification('⚔️ Match Result Awaiting Confirmation', {
    body: `${opponentName} reported the score for your ${sport} duel. Confirm or dispute within 24h!`,
    tag: 'result_handshake',
  });
}
