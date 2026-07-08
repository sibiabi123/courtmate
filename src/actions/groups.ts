'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getGroups() {
  try {
    const groups = await prisma.group.findMany({
      include: {
        owner: true,
        game: true,
        members: {
          include: { user: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    return { success: true, groups };
  } catch (error) {
    console.error('Failed to fetch groups:', error);
    return { success: false, error: 'Failed to fetch groups' };
  }
}

export async function createGroup(data: any) {
  try {
    const group = await prisma.group.create({
      data
    });
    revalidatePath('/groups');
    return { success: true, group };
  } catch (error) {
    console.error('Failed to create group:', error);
    return { success: false, error: 'Failed to create group' };
  }
}

export async function joinGroup(groupId: string, userId: string) {
  try {
    await prisma.groupMember.create({
      data: { groupId, userId }
    });
    
    await prisma.group.update({
      where: { id: groupId },
      data: { memberCount: { increment: 1 } }
    });

    revalidatePath(`/groups/${groupId}`);
    return { success: true };
  } catch (error) {
    console.error('Failed to join group:', error);
    return { success: false, error: 'Failed to join group' };
  }
}
