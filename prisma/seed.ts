import { PrismaClient } from '@prisma/client';
import { 
  mockUsers, 
  mockGames, 
  mockPosts, 
  mockTournaments, 
  mockGroups 
} from '../src/data/mock-data';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database with mock data...');

  // 1. Seed Games
  for (const game of mockGames) {
    await prisma.game.upsert({
      where: { id: game.id },
      update: {},
      create: {
        id: game.id,
        name: game.name,
        icon: game.icon,
        category: game.category,
        description: game.description,
        playerCount: game.playerCount,
        isPhysical: game.isPhysical,
        popularity: game.popularity,
        color: game.color,
      }
    });
  }

  // 2. Seed Users
  for (const user of mockUsers) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: {
        id: user.id,
        name: user.name,
        email: user.email,
        vitId: user.vitId,
        hostel: user.hostel,
        avatar: user.avatar,
        bio: user.bio,
        preferredGames: JSON.stringify(user.preferredGames),
        skillLevel: user.skillLevel,
        role: user.role,
        isBanned: user.isBanned,
        xp: user.xp,
        level: user.level,
        stats: JSON.stringify(user.stats),
        joinedAt: new Date(user.joinedAt),
      }
    });
  }

  console.log('Database seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
