'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getPosts() {
  try {
    const posts = await prisma.post.findMany({
      include: {
        user: true,
        game: true,
        responses: {
          include: { user: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    return { success: true, posts };
  } catch (error) {
    console.error('Failed to fetch posts:', error);
    return { success: false, error: 'Failed to fetch posts' };
  }
}

export async function createPost(data: any) {
  try {
    const post = await prisma.post.create({
      data
    });
    revalidatePath('/feed');
    return { success: true, post };
  } catch (error) {
    console.error('Failed to create post:', error);
    return { success: false, error: 'Failed to create post' };
  }
}

export async function deletePost(id: string) {
  try {
    await prisma.post.delete({
      where: { id }
    });
    revalidatePath('/feed');
    revalidatePath('/super-admin');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete post:', error);
    return { success: false, error: 'Failed to delete post' };
  }
}

export async function rsvpToPost(postId: string, userId: string, status: string) {
  try {
    const existingRsvp = await prisma.postResponse.findFirst({
      where: { postId, userId }
    });

    if (existingRsvp) {
      await prisma.postResponse.update({
        where: { id: existingRsvp.id },
        data: { status }
      });
    } else {
      await prisma.postResponse.create({
        data: { postId, userId, status }
      });
      
      if (status === 'joined') {
        await prisma.post.update({
          where: { id: postId },
          data: { slotsFilled: { increment: 1 } }
        });
      }
    }

    revalidatePath('/feed');
    return { success: true };
  } catch (error) {
    console.error('Failed to RSVP:', error);
    return { success: false, error: 'Failed to RSVP' };
  }
}
