/**
 * Glicko-2 ELO calculation engine wrapper.
 * Uses the `glicko2` npm package.
 * Ref: http://www.glicko.net/glicko/glicko2.pdf
 */

// GlickoRating type defined inline (schema uses separate columns)
export interface GlickoRating {
  rating: number;
  rd: number;
  vol: number;
}

// Default Glicko-2 system constants
const GLICKO_SETTINGS = {
  tau: 0.5,      // Constraint on rating volatility — lower = more conservative
  rating: 1500,  // Default starting rating
  rd: 350,       // Default rating deviation
  vol: 0.06,     // Default volatility
};

// Singleton ranking engine (Glicko2 may not be typed — use any)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _engine: any | null = null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getEngine(): any {
  if (!_engine) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Glicko2 = require('glicko2');
    _engine = new Glicko2(GLICKO_SETTINGS);
  }
  return _engine;
}


// ─── Types ────────────────────────────────────────────────────────────────────
export interface PlayerMatchResult {
  userId: string;
  rating: GlickoRating;
  wins: number;   // Number of opponents they beat
  losses: number; // Number of opponents who beat them
  draws: number;  // Number of draws
}

export interface EloUpdateResult {
  userId: string;
  oldRating: GlickoRating;
  newRating: GlickoRating;
  delta: number;
}

// ─── Core ELO update ─────────────────────────────────────────────────────────
/**
 * Compute new Glicko-2 ratings for a list of match results.
 * Supports team vs team logic by splitting winners/losers.
 *
 * @param winnerRatings - Array of GlickoRating for winning team
 * @param loserRatings  - Array of GlickoRating for losing team
 * @returns Array of EloUpdateResult for all players
 */
export function computeMatchElo(
  winners: Array<{ userId: string; rating: GlickoRating }>,
  losers: Array<{ userId: string; rating: GlickoRating }>
): EloUpdateResult[] {
  const engine = getEngine();

  // Create Glicko2 player objects
  const winnerPlayers = winners.map(({ userId, rating }) => ({
    userId,
    oldRating: rating,
    player: engine.makePlayer(rating.rating, rating.rd, rating.vol),
  }));

  const loserPlayers = losers.map(({ userId, rating }) => ({
    userId,
    oldRating: rating,
    player: engine.makePlayer(rating.rating, rating.rd, rating.vol),
  }));

  // Build match results: every winner beat every loser
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const results: [any, any, 1 | 0 | 0.5][] = [];

  for (const w of winnerPlayers) {
    for (const l of loserPlayers) {
      results.push([w.player, l.player, 1]); // winner beat loser
    }
  }

  // Run the period update
  engine.updateRatings(results);

  // Collect results
  const allResults: EloUpdateResult[] = [];

  for (const { userId, oldRating, player } of winnerPlayers) {
    const newRating: GlickoRating = {
      rating: Math.round(player.getRating()),
      rd: Math.round(player.getRd() * 100) / 100,
      vol: Math.round(player.getVol() * 10000) / 10000,
    };
    allResults.push({
      userId,
      oldRating,
      newRating,
      delta: newRating.rating - oldRating.rating,
    });
  }

  for (const { userId, oldRating, player } of loserPlayers) {
    const newRating: GlickoRating = {
      rating: Math.round(player.getRating()),
      rd: Math.round(player.getRd() * 100) / 100,
      vol: Math.round(player.getVol() * 10000) / 10000,
    };
    allResults.push({
      userId,
      oldRating,
      newRating,
      delta: newRating.rating - oldRating.rating,
    });
  }

  // Reset engine for next match computation
  _engine = null;

  return allResults;
}

/**
 * Compute ELO for a single player after a match.
 * Used when we only know individual win/loss/draw outcomes.
 */
export function computeSingleElo(
  player: { userId: string; rating: GlickoRating },
  opponents: Array<{ rating: GlickoRating; result: 1 | 0 | 0.5 }>
): EloUpdateResult {
  const engine = getEngine();

  const p = engine.makePlayer(player.rating.rating, player.rating.rd, player.rating.vol);
  const opponentData = opponents.map(({ rating, result }) => ({
    opponent: engine.makePlayer(rating.rating, rating.rd, rating.vol),
    result,
  }));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const matchResults: [any, any, 1 | 0 | 0.5][] = opponentData.map(({ opponent, result }) => [p, opponent, result]);

  engine.updateRatings(matchResults);

  const newRating: GlickoRating = {
    rating: Math.round(p.getRating()),
    rd: Math.round(p.getRd() * 100) / 100,
    vol: Math.round(p.getVol() * 10000) / 10000,
  };

  _engine = null;

  return {
    userId: player.userId,
    oldRating: player.rating,
    newRating,
    delta: newRating.rating - player.rating.rating,
  };
}

/**
 * Returns human-readable rank tier based on Glicko2 rating.
 */
export function getRankTier(rating: number): { label: string; color: string; emoji: string } {
  if (rating >= 2200) return { label: 'Legendary', color: '#ffd60a', emoji: '👑' };
  if (rating >= 2000) return { label: 'Diamond', color: '#00f5d4', emoji: '💎' };
  if (rating >= 1800) return { label: 'Platinum', color: '#7b2ff7', emoji: '⚡' };
  if (rating >= 1650) return { label: 'Gold', color: '#f59e0b', emoji: '🏆' };
  if (rating >= 1500) return { label: 'Silver', color: '#94a3b8', emoji: '🥈' };
  return { label: 'Bronze', color: '#a16207', emoji: '🥉' };
}
