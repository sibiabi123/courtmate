'use server';

/**
 * Vercel AI SDK Agent — VIT-G-Hub OMNI
 *
 * Functions:
 * 1. generatePostDescription  — Creates hype post descriptions from sport/ground/time.
 * 2. moderateMessage          — Auto-flags inappropriate chat messages.
 * 3. generateTournamentRecap  — Creates a 50-word matchday review from match scores.
 */

import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';

const MODEL = openai('gpt-4o-mini');

// ─── Post Description Generator ───────────────────────────────────────────────
export async function generatePostDescription(params: {
  sport: string;
  ground: string;
  time: string;
  maxPlayers: number;
}): Promise<string> {
  try {
    const { text } = await generateText({
      model: MODEL,
      system: `You are a hype writer for VIT University campus sports. Write extremely engaging, 
emoji-filled one-liners (max 25 words) for student pickup game announcements. 
Be campus-specific, energetic and use sports slang.`,
      prompt: `Generate a hype match post for: Sport="${params.sport}", Ground="${params.ground}", 
Time="${params.time}", Players Needed="${params.maxPlayers}". 
Write one punchy sentence with 2-3 relevant emojis.`,
      maxTokens: 60,
      temperature: 0.9,
    });
    return text.trim();
  } catch {
    return `🔥 Epic ${params.sport} session at ${params.ground}! Come dominate! ⚡`;
  }
}

// ─── Chat Moderation ──────────────────────────────────────────────────────────
export interface ModerationResult {
  flagged: boolean;
  score: number;
  reason?: string;
}

export async function moderateMessage(message: string): Promise<ModerationResult> {
  try {
    const { text } = await generateText({
      model: MODEL,
      system: `You are a strict content moderator for a college sports app. 
Respond ONLY with JSON: {"flagged": boolean, "score": 0.0-1.0, "reason": string or null}.
Flag if score > 0.8. Reasons: harassment, hate_speech, spam, explicit_content.
Normal sports banter is allowed.`,
      prompt: `Moderate this message: "${message}"`,
      maxTokens: 80,
      temperature: 0,
    });

    const parsed = JSON.parse(text.trim()) as ModerationResult;
    return parsed;
  } catch {
    // If AI fails, allow the message
    return { flagged: false, score: 0 };
  }
}

// ─── Tournament Recap Generator ────────────────────────────────────────────────
export async function generateTournamentRecap(params: {
  tournamentName: string;
  sport: string;
  winnerName: string;
  scores: Record<string, number>;
  participantCount: number;
}): Promise<string> {
  const scoresStr = Object.entries(params.scores)
    .map(([k, v]) => `${k}: ${v}`)
    .join(', ');

  try {
    const { text } = await generateText({
      model: MODEL,
      system: `You are a sports journalist writing for VIT University's campus newsletter. 
Write concise, exciting match recaps in exactly 50 words. Use past tense.`,
      prompt: `Write a 50-word recap for: Tournament="${params.tournamentName}", 
Sport="${params.sport}", Winner="${params.winnerName}", 
Scores="${scoresStr}", Total Players="${params.participantCount}". 
Include the winner and key highlights.`,
      maxTokens: 100,
      temperature: 0.7,
    });
    return text.trim();
  } catch {
    return `${params.winnerName} claimed the ${params.tournamentName} championship in an exciting ${params.sport} showdown, defeating ${params.participantCount} competitors with outstanding skill and determination. Congratulations! 🏆`;
  }
}

// ─── Quest Generator ──────────────────────────────────────────────────────────
export async function generateQuestObjective(sport: string, targetCount: number): Promise<string> {
  try {
    const { text } = await generateText({
      model: MODEL,
      system: `You write short, fun daily quest objectives for a campus sports app. Max 12 words. Use action verbs.`,
      prompt: `Quest for ${sport}, complete ${targetCount} time(s). Write the objective text.`,
      maxTokens: 30,
      temperature: 0.8,
    });
    return text.trim().replace(/^["']|["']$/g, '');
  } catch {
    return `Play ${targetCount} ${sport} match${targetCount > 1 ? 'es' : ''} today`;
  }
}
