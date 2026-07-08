/**
 * Haversine Formula — Computes the great-circle distance between two GPS coordinates.
 * Used for fraud-proof geolocation check-in validation.
 */

const EARTH_RADIUS_METERS = 6_371_000;

export function toRadians(deg: number): number {
  return (deg * Math.PI) / 180;
}

/**
 * Returns the distance in meters between two coordinate pairs.
 */
export function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
    Math.cos(toRadians(lat2)) *
    Math.sin(dLng / 2) *
    Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_METERS * c;
}

/**
 * Returns true if the user's coordinates are within `radiusMeters` of the ground.
 */
export function isWithinRadius(
  userLat: number,
  userLng: number,
  groundLat: number,
  groundLng: number,
  radiusMeters = 100
): boolean {
  const dist = haversineDistance(userLat, userLng, groundLat, groundLng);
  return dist <= radiusMeters;
}

// ─── VIT Campus Grounds Coordinates ───────────────────────────────────────────
// Real approximate coordinates for VIT Vellore campus sports grounds.
export const VIT_GROUNDS: Record<string, { lat: number; lng: number; name: string }> = {
  'main-ground': { lat: 12.9718, lng: 79.1588, name: 'Main Ground (Football/Cricket)' },
  'cricket-net': { lat: 12.9722, lng: 79.1580, name: 'MH Cricket Net' },
  'basketball-court': { lat: 12.9712, lng: 79.1592, name: 'Basketball Court' },
  'badminton-hall': { lat: 12.9708, lng: 79.1601, name: 'Indoor Badminton Hall' },
  'table-tennis': { lat: 12.9705, lng: 79.1605, name: 'Table Tennis Room' },
  'volleyball-court': { lat: 12.9724, lng: 79.1585, name: 'Volleyball Court' },
  'swimming-pool': { lat: 12.9700, lng: 79.1610, name: 'Swimming Pool' },
  'gymkhana-hall': { lat: 12.9715, lng: 79.1598, name: 'Gymkhana Hall' },
  'outdoor-courts': { lat: 12.9720, lng: 79.1595, name: 'Outdoor Multi-Courts' },
};
