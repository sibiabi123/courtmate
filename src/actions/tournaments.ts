'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getTournaments() {
  try {
    const tournaments = await prisma.tournament.findMany({
      include: {
        game: true,
        organizer: true,
        registrations: true,
        matches: true,
      },
      orderBy: { dateTime: 'asc' }
    });
    return { success: true, tournaments };
  } catch (error) {
    console.error('Failed to fetch tournaments:', error);
    return { success: false, error: 'Failed to fetch tournaments' };
  }
}

export async function createTournament(data: any) {
  try {
    const tournament = await prisma.tournament.create({
      data
    });
    revalidatePath('/tournaments');
    revalidatePath('/super-admin');
    return { success: true, tournament };
  } catch (error) {
    console.error('Failed to create tournament:', error);
    return { success: false, error: 'Failed to create tournament' };
  }
}

export async function deleteTournament(id: string) {
  try {
    await prisma.tournament.delete({
      where: { id }
    });
    revalidatePath('/tournaments');
    revalidatePath('/super-admin');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete tournament:', error);
    return { success: false, error: 'Failed to delete tournament' };
  }
}

export async function registerForTournament(tournamentId: string, userId: string) {
  try {
    await prisma.tournamentRegistration.create({
      data: { tournamentId, userId }
    });
    
    // Update participant count
    await prisma.tournament.update({
      where: { id: tournamentId },
      data: {
        currentParticipants: { increment: 1 }
      }
    });

    revalidatePath(`/tournaments/${tournamentId}`);
    return { success: true };
  } catch (error) {
    console.error('Failed to register:', error);
    return { success: false, error: 'Failed to register' };
  }
}
