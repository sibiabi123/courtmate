'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getUsers() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { xp: 'desc' }
    });
    return { success: true, users };
  } catch (error) {
    console.error('Failed to get users:', error);
    return { success: false, error: 'Failed to fetch users' };
  }
}

export async function getUserById(id: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        postsCreated: true,
        postResponses: {
          include: { post: true }
        }
      }
    });
    return { success: true, user };
  } catch (error) {
    console.error('Failed to get user:', error);
    return { success: false, error: 'Failed to fetch user' };
  }
}

export async function updateUser(id: string, data: any) {
  try {
    const user = await prisma.user.update({
      where: { id },
      data
    });
    revalidatePath('/super-admin');
    revalidatePath('/leaderboard');
    return { success: true, user };
  } catch (error) {
    console.error('Failed to update user:', error);
    return { success: false, error: 'Failed to update user' };
  }
}

export async function deleteUser(id: string) {
  try {
    await prisma.user.delete({
      where: { id }
    });
    revalidatePath('/super-admin');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete user:', error);
    return { success: false, error: 'Failed to delete user' };
  }
}
