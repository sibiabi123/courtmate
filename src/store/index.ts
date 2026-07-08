'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  User,
  Notification,
  ArcadeScore,
  Post,
  Tournament,
  Group,
  Report,
  AdminAction,
  Conversation,
  Message,
  Game,
  Achievement,
} from '@/types';
import { mockGames, mockAchievements, mockUsers, mockPosts, mockTournaments, mockGroups, mockNotifications } from '@/data/mock-data';

interface AppState {
  currentUser: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  adminSession: boolean;
  login: (user: User) => void;
  logout: () => void;
  setAdminSession: (val: boolean) => void;

  theme: 'dark' | 'light';
  toggleTheme: () => void;

  // Persistent lists
  users: User[];
  games: Game[];
  achievements: Achievement[];
  posts: Post[];
  tournaments: Tournament[];
  groups: Group[];
  reports: Report[];
  adminActions: AdminAction[];
  notifications: Notification[];
  conversations: Conversation[];
  arcadeScores: ArcadeScore[];

  // User Actions
  updateUser: (userId: string, updatedData: Partial<User>) => void;
  deleteUser: (userId: string) => void;
  addXpToUser: (userId: string, xpGained: number) => void;

  // Post Actions
  addPost: (post: Post) => void;
  deletePost: (postId: string) => void;
  rsvpPost: (postId: string, userId: string, status: 'joined' | 'interested' | 'declined') => void;

  // Tournament Actions
  createTournament: (tournament: Tournament) => void;
  updateTournament: (tournamentId: string, updatedData: Partial<Tournament>) => void;
  deleteTournament: (tournamentId: string) => void;
  registerTournament: (tournamentId: string, userId: string) => void;
  generateBracket: (tournamentId: string) => void;
  updateMatchScore: (tournamentId: string, matchId: string, p1Score: number, p2Score: number) => void;

  // Group Actions
  joinGroup: (groupId: string, userId: string) => void;
  deleteGroup: (groupId: string) => void;

  // Moderation / Reports Actions
  addReport: (report: Report) => void;
  resolveReport: (reportId: string, adminId: string, actionType: 'resolve' | 'ban' | 'dismiss') => void;

  // Notification Actions
  addNotification: (notification: Notification) => void;
  broadcastNotification: (title: string, message: string, icon: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  unreadCount: () => number;

  // Arcade Scores Actions
  addArcadeScore: (score: ArcadeScore) => void;
  getHighScore: (gameSlug: string) => number;

  // Simulated DMs
  sendMessageToConversation: (convId: string, content: string, senderId: string) => void;

  // UI state
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  isMobileMenuOpen: boolean;
  toggleMobileMenu: () => void;
  closeMobileMenu: () => void;
  onlineCount: number;
  setOnlineCount: (count: number) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentUser: null, // Start unauthenticated
      isAuthenticated: false,
      isAdmin: false,
      adminSession: false,

      login: (user: User) =>
        set({
          currentUser: user,
          isAuthenticated: true,
          isAdmin: user.role === 'super_admin',
        }),
      logout: () =>
        set({
          currentUser: null,
          isAuthenticated: false,
          isAdmin: false,
          adminSession: false,
        }),
      setAdminSession: (val) => set({ adminSession: val }),

      theme: 'dark',
      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === 'dark' ? 'light' : 'dark',
        })),

      // Lists populated from cloud database
      users: mockUsers,
      games: mockGames,
      achievements: mockAchievements,
      posts: mockPosts,
      tournaments: mockTournaments,
      groups: mockGroups,
      reports: [],
      adminActions: [],
      notifications: mockNotifications,
      conversations: [],
      arcadeScores: [],

      // User Management
      updateUser: (userId, updatedData) =>
        set((state) => {
          const updatedUsers = state.users.map((u) =>
            u.id === userId ? { ...u, ...updatedData } : u
          );
          // If the updated user is the current user, sync their info
          const updatedCurrentUser =
            state.currentUser?.id === userId
              ? { ...state.currentUser, ...updatedData }
              : state.currentUser;

          const actionDetail = `Updated user profiles details for ${
            updatedUsers.find((u) => u.id === userId)?.name
          }`;

          const newAction: AdminAction = {
            id: `act-${Date.now()}`,
            adminId: 'admin-0',
            action: 'Updated User',
            targetTable: 'users',
            targetId: userId,
            details: actionDetail,
            timestamp: new Date().toISOString(),
          };

          return {
            users: updatedUsers,
            currentUser: updatedCurrentUser,
            adminActions: [newAction, ...state.adminActions],
          };
        }),

      deleteUser: (userId) =>
        set((state) => {
          const deletedUser = state.users.find((u) => u.id === userId);
          const updatedUsers = state.users.filter((u) => u.id !== userId);

          const newAction: AdminAction = {
            id: `act-${Date.now()}`,
            adminId: 'admin-0',
            action: 'Deleted User',
            targetTable: 'users',
            targetId: userId,
            details: `Removed user ${deletedUser?.name || userId} from campus database`,
            timestamp: new Date().toISOString(),
          };

          return {
            users: updatedUsers,
            adminActions: [newAction, ...state.adminActions],
          };
        }),

      addXpToUser: (userId, xpGained) =>
        set((state) => {
          const updatedUsers = state.users.map((u) => {
            if (u.id !== userId) return u;
            const newXp = u.xp + xpGained;
            const newLevel = Math.floor(newXp / 200) + 1;
            return {
              ...u,
              xp: newXp,
              level: newLevel,
            };
          });
          return { users: updatedUsers };
        }),

      // Post Actions
      addPost: (post) =>
        set((state) => ({
          posts: [post, ...state.posts],
          users: state.users.map((u) =>
            u.id === post.userId
              ? {
                  ...u,
                  xp: u.xp + 50,
                  stats: { ...u.stats, postsCreated: u.stats.postsCreated + 1 },
                }
              : u
          ),
        })),

      deletePost: (postId) =>
        set((state) => {
          const updatedPosts = state.posts.filter((p) => p.id !== postId);
          const newAction: AdminAction = {
            id: `act-${Date.now()}`,
            adminId: 'admin-0',
            action: 'Deleted Feed Post',
            targetTable: 'posts',
            targetId: postId,
            details: 'Removed game request post from feed',
            timestamp: new Date().toISOString(),
          };

          return {
            posts: updatedPosts,
            adminActions: [newAction, ...state.adminActions],
          };
        }),

      rsvpPost: (postId, userId, rsvpStatus) =>
        set((state) => {
          const updatedPosts = state.posts.map((p) => {
            if (p.id !== postId) return p;
            const alreadyResponded = p.responses.some((r) => r.userId === userId);
            const newResponses = alreadyResponded
              ? p.responses.map((r) => (r.userId === userId ? { ...r, status: rsvpStatus } : r))
              : [
                  ...p.responses,
                  {
                    id: `resp-${Date.now()}`,
                    postId,
                    userId,
                    status: rsvpStatus,
                    createdAt: new Date().toISOString(),
                  },
                ];

            const filledCount = newResponses.filter((r) => r.status === 'joined').length;

            return {
              ...p,
              responses: newResponses,
              slotsFilled: Math.min(p.slotsTotal, filledCount),
              status: (filledCount >= p.slotsTotal ? 'filled' : 'active') as any,
            };
          });

          return { posts: updatedPosts };
        }),

      // Tournament Actions
      createTournament: (tournament) =>
        set((state) => {
          const newAction: AdminAction = {
            id: `act-${Date.now()}`,
            adminId: 'admin-0',
            action: 'Created Tournament',
            targetTable: 'tournaments',
            targetId: tournament.id,
            details: `Organized tournament: ${tournament.name}`,
            timestamp: new Date().toISOString(),
          };
          return {
            tournaments: [tournament, ...state.tournaments],
            adminActions: [newAction, ...state.adminActions],
          };
        }),

      updateTournament: (tournamentId, updatedData) =>
        set((state) => {
          const updatedTournaments = state.tournaments.map((t) =>
            t.id === tournamentId ? { ...t, ...updatedData } : t
          );

          const newAction: AdminAction = {
            id: `act-${Date.now()}`,
            adminId: 'admin-0',
            action: 'Updated Tournament',
            targetTable: 'tournaments',
            targetId: tournamentId,
            details: `Modified status/settings for tournament ID ${tournamentId}`,
            timestamp: new Date().toISOString(),
          };

          return {
            tournaments: updatedTournaments,
            adminActions: [newAction, ...state.adminActions],
          };
        }),

      deleteTournament: (tournamentId) =>
        set((state) => {
          const updatedTournaments = state.tournaments.filter((t) => t.id !== tournamentId);
          const newAction: AdminAction = {
            id: `act-${Date.now()}`,
            adminId: 'admin-0',
            action: 'Deleted Tournament',
            targetTable: 'tournaments',
            targetId: tournamentId,
            details: `Cancelled and removed tournament ID ${tournamentId}`,
            timestamp: new Date().toISOString(),
          };

          return {
            tournaments: updatedTournaments,
            adminActions: [newAction, ...state.adminActions],
          };
        }),

      registerTournament: (tournamentId, userId) =>
        set((state) => {
          const updatedTournaments = state.tournaments.map((t) => {
            if (t.id !== tournamentId) return t;
            if (t.registrations.some((r) => r.userId === userId)) return t;

            const newReg = {
              id: `reg-${Date.now()}`,
              tournamentId,
              userId,
              registeredAt: new Date().toISOString(),
              status: 'confirmed' as const,
            };

            return {
              ...t,
              currentParticipants: Math.min(t.maxParticipants, t.currentParticipants + 1),
              registrations: [...t.registrations, newReg],
            };
          });

          const updatedUsers = state.users.map((u) =>
            u.id === userId
              ? {
                  ...u,
                  xp: u.xp + 100,
                  stats: { ...u.stats, tournamentsPlayed: u.stats.tournamentsPlayed + 1 },
                }
              : u
          );

          return { tournaments: updatedTournaments, users: updatedUsers };
        }),

      generateBracket: (tournamentId) =>
        set((state) => {
          const updatedTournaments = state.tournaments.map((t) => {
            if (t.id !== tournamentId) return t;

            const regUserIds = t.registrations.map((r) => r.userId);
            const matches = [];

            // Generate single elimination matches
            let matchIndex = 1;
            for (let i = 0; i < regUserIds.length; i += 2) {
              if (i + 1 < regUserIds.length) {
                matches.push({
                  id: `match-${tournamentId}-${matchIndex}`,
                  tournamentId,
                  round: 1,
                  matchNumber: matchIndex,
                  player1Id: regUserIds[i],
                  player2Id: regUserIds[i + 1],
                  status: 'scheduled' as const,
                });
                matchIndex++;
              }
            }

            return {
              ...t,
              status: 'ongoing' as const,
              matches,
            };
          });

          const newAction: AdminAction = {
            id: `act-${Date.now()}`,
            adminId: 'admin-0',
            action: 'Generated Bracket',
            targetTable: 'tournaments',
            targetId: tournamentId,
            details: `Constructed matchmaking grid and locked registrations for tournament ID ${tournamentId}`,
            timestamp: new Date().toISOString(),
          };

          return {
            tournaments: updatedTournaments,
            adminActions: [newAction, ...state.adminActions],
          };
        }),

      updateMatchScore: (tournamentId, matchId, p1Score, p2Score) =>
        set((state) => {
          const updatedTournaments = state.tournaments.map((t) => {
            if (t.id !== tournamentId) return t;

            const updatedMatches = t.matches.map((m) => {
              if (m.id !== matchId) return m;

              const winnerId = p1Score > p2Score ? m.player1Id : m.player2Id;
              return {
                ...m,
                player1Score: p1Score,
                player2Score: p2Score,
                winnerId,
                status: 'completed' as const,
              };
            });

            return {
              ...t,
              matches: updatedMatches,
            };
          });

          return { tournaments: updatedTournaments };
        }),

      // Group Actions
      joinGroup: (groupId, userId) =>
        set((state) => {
          const updatedGroups = state.groups.map((g) => {
            if (g.id !== groupId) return g;
            if (g.members.some((m) => m.userId === userId)) return g;

            const newMember = {
              id: `gmem-${Date.now()}`,
              groupId,
              userId,
              role: 'member' as const,
              joinedAt: new Date().toISOString(),
            };

            return {
              ...g,
              memberCount: Math.min(g.maxMembers, g.memberCount + 1),
              members: [...g.members, newMember],
            };
          });

          const updatedUsers = state.users.map((u) =>
            u.id === userId
              ? {
                  ...u,
                  xp: u.xp + 75,
                  stats: { ...u.stats, groupsJoined: u.stats.groupsJoined + 1 },
                }
              : u
          );

          return { groups: updatedGroups, users: updatedUsers };
        }),

      deleteGroup: (groupId) =>
        set((state) => {
          const updatedGroups = state.groups.filter((g) => g.id !== groupId);
          const newAction: AdminAction = {
            id: `act-${Date.now()}`,
            adminId: 'admin-0',
            action: 'Deleted Group',
            targetTable: 'groups',
            targetId: groupId,
            details: `Dissolved group ID ${groupId}`,
            timestamp: new Date().toISOString(),
          };

          return {
            groups: updatedGroups,
            adminActions: [newAction, ...state.adminActions],
          };
        }),

      // Moderation / Reports Actions
      addReport: (report) => set((state) => ({ reports: [report, ...state.reports] })),

      resolveReport: (reportId, adminId, actionType) =>
        set((state) => {
          const report = state.reports.find((r) => r.id === reportId);
          if (!report) return {};

          const updatedReports = state.reports.map((r) =>
            r.id === reportId
              ? {
                  ...r,
                  status: (actionType === 'dismiss' ? 'dismissed' : 'resolved') as any,
                  resolvedAt: new Date().toISOString(),
                  resolvedBy: adminId,
                }
              : r
          );

          let updatedUsers = state.users;
          if (actionType === 'ban') {
            updatedUsers = state.users.map((u) =>
              u.id === report.reportedId ? { ...u, isBanned: true } : u
            );
          }

          const newAdminAction: AdminAction = {
            id: `act-${Date.now()}`,
            adminId,
            action: actionType === 'ban' ? 'Banned user' : actionType === 'dismiss' ? 'Dismissed report' : 'Resolved report',
            targetTable: 'reports',
            targetId: reportId,
            details: `Moderation action taken on report ${reportId}`,
            timestamp: new Date().toISOString(),
          };

          return {
            reports: updatedReports,
            users: updatedUsers,
            adminActions: [newAdminAction, ...state.adminActions],
          };
        }),

      // Notification Actions
      addNotification: (notification) =>
        set((state) => ({
          notifications: [notification, ...state.notifications],
        })),

      broadcastNotification: (title, message, icon) =>
        set((state) => {
          const newNotifications: Notification[] = state.users.map((u) => ({
            id: `noti-bc-${u.id}-${Date.now()}`,
            userId: u.id,
            type: 'broadcast',
            title,
            message,
            icon,
            isRead: false,
            createdAt: new Date().toISOString(),
          }));

          const newAction: AdminAction = {
            id: `act-${Date.now()}`,
            adminId: 'admin-0',
            action: 'Broadcasted Notification',
            targetTable: 'notifications',
            targetId: 'all',
            details: `Sent global broadcast: "${title}"`,
            timestamp: new Date().toISOString(),
          };

          return {
            notifications: [...newNotifications, ...state.notifications],
            adminActions: [newAction, ...state.adminActions],
          };
        }),

      markAsRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, isRead: true } : n
          ),
        })),

      markAllAsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
        })),

      unreadCount: () => {
        return get().notifications.filter((n) => !n.isRead).length;
      },

      // Arcade Scores Actions
      addArcadeScore: (score) =>
        set((state) => {
          const newState = {
            arcadeScores: [score, ...state.arcadeScores],
          };
          const user = state.users.find((u) => u.id === score.userId);
          if (user) {
            const xpGained = Math.min(200, Math.floor(score.score / 2));
            const newXp = user.xp + xpGained;
            const newLevel = Math.floor(newXp / 200) + 1;

            newState.arcadeScores = [score, ...state.arcadeScores];
            const updatedUsers = state.users.map((u) =>
              u.id === score.userId
                ? {
                    ...u,
                    xp: newXp,
                    level: newLevel,
                    stats: {
                      ...u.stats,
                      gamesPlayed: u.stats.gamesPlayed + 1,
                      wins: u.stats.wins + (score.score > 50 ? 1 : 0),
                      winRate: parseFloat(
                        (
                          ((u.stats.wins + (score.score > 50 ? 1 : 0)) /
                            (u.stats.gamesPlayed + 1)) *
                          100
                        ).toFixed(1)
                      ),
                    },
                  }
                : u
            );
            return { ...newState, users: updatedUsers };
          }
          return newState;
        }),

      getHighScore: (gameSlug: string) => {
        const scores = get().arcadeScores.filter((s) => s.gameSlug === gameSlug);
        return scores.length > 0 ? Math.max(...scores.map((s) => s.score)) : 0;
      },

      // Simulated DMs
      sendMessageToConversation: (convId, content, senderId) =>
        set((state) => {
          const newMessage: Message = {
            id: `msg-${Date.now()}`,
            senderId,
            content,
            timestamp: new Date().toISOString(),
            isRead: true,
            type: 'text',
          };

          const updatedConversations = state.conversations.map((conv) => {
            if (conv.id !== convId) return conv;
            return {
              ...conv,
              lastMessage: newMessage,
              unreadCount: 0,
            };
          });

          return { conversations: updatedConversations };
        }),

      // UI state
      isSidebarOpen: true,
      toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
      isMobileMenuOpen: false,
      toggleMobileMenu: () => set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
      closeMobileMenu: () => set({ isMobileMenuOpen: false }),

      onlineCount: 247,
      setOnlineCount: (count: number) => set({ onlineCount: count }),
    }),
    {
      name: 'vit-g-hub-store-v3',
      partialize: (state) => ({
        currentUser: state.currentUser,
        isAuthenticated: state.isAuthenticated,
        isAdmin: state.isAdmin,
        adminSession: state.adminSession,
        theme: state.theme,
        users: state.users,
        games: state.games,
        achievements: state.achievements,
        posts: state.posts,
        tournaments: state.tournaments,
        groups: state.groups,
        reports: state.reports,
        adminActions: state.adminActions,
        notifications: state.notifications,
        conversations: state.conversations,
        arcadeScores: state.arcadeScores,
      }),
    }
  )
);
