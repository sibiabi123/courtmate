// ============================================
// VIT-G-Hub Type Definitions
// ============================================

// User types
export interface User {
  id: string;
  name: string;
  email: string;
  vitId: string;
  hostel: string;
  avatar: string;
  bio: string;
  preferredGames: string[];
  skillLevel: 'beginner' | 'intermediate' | 'pro';
  role: 'student' | 'moderator' | 'super_admin';
  isBanned: boolean;
  xp: number;
  level: number;
  joinedAt: string;
  isOnline: boolean;
  stats: UserStats;
}

export interface UserStats {
  gamesPlayed: number;
  wins: number;
  losses: number;
  tournamentsWon: number;
  tournamentsPlayed: number;
  groupsJoined: number;
  postsCreated: number;
  winRate: number;
}

// Game types — includes physical, digital, arcade, board
export type GameCategory = 'physical' | 'digital' | 'arcade' | 'board';

export interface Game {
  id: string;
  name: string;
  icon: string;
  category: GameCategory;
  description: string;
  playerCount: string;
  isPhysical: boolean;
  popularity: number;
  color: string;
}

// Post types ("I Want to Play")
export type PostStatus = 'active' | 'filled' | 'expired' | 'cancelled';

export interface Post {
  id: string;
  userId: string;
  user?: User;
  gameId: string;
  game?: Game;
  message: string;
  location: string;
  time: string;
  date: string;
  slotsTotal: number;
  slotsFilled: number;
  responses: PostResponse[];
  createdAt: string;
  isPinned: boolean;
  status: PostStatus;
  contactMethod?: string;
  contactInfo?: string;
}

export interface PostResponse {
  id: string;
  postId: string;
  userId: string;
  user?: User;
  status: 'joined' | 'interested' | 'declined';
  message?: string;
  createdAt: string;
}

// Tournament types
export type TournamentStatus = 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
export type TournamentFormat = 'knockout' | 'round_robin' | 'league';

export interface Tournament {
  id: string;
  name: string;
  gameId: string;
  game?: Game;
  createdBy: string;
  organizer?: User;
  description: string;
  rules: string;
  venue: string;
  dateTime: string;
  endDate?: string;
  prize: string;
  maxParticipants: number;
  currentParticipants: number;
  format: TournamentFormat;
  status: TournamentStatus;
  registrations: TournamentRegistration[];
  matches: TournamentMatch[];
  banner?: string;
  entryFee?: string;
}

export interface TournamentRegistration {
  id: string;
  tournamentId: string;
  userId: string;
  user?: User;
  teamName?: string;
  teamMembers?: string[];
  registeredAt: string;
  status: 'confirmed' | 'waitlisted' | 'cancelled';
}

export interface TournamentMatch {
  id: string;
  tournamentId: string;
  round: number;
  matchNumber: number;
  player1Id: string;
  player1?: User;
  player2Id: string;
  player2?: User;
  player1Score?: number;
  player2Score?: number;
  winnerId?: string;
  status: 'scheduled' | 'ongoing' | 'completed';
  scheduledTime?: string;
}

// Group types
export interface Group {
  id: string;
  name: string;
  gameId: string;
  game?: Game;
  ownerId: string;
  owner?: User;
  description: string;
  logo: string;
  requirements: string;
  memberCount: number;
  maxMembers: number;
  members: GroupMember[];
  isOpen: boolean;
  createdAt: string;
  tags: string[];
}

export interface GroupMember {
  id: string;
  groupId: string;
  userId: string;
  user?: User;
  role: 'leader' | 'co_leader' | 'member';
  joinedAt: string;
}

// Leaderboard types
export interface LeaderboardEntry {
  id: string;
  userId: string;
  user?: User;
  gameId: string;
  game?: Game;
  score: number;
  rank: number;
  gamesPlayed: number;
  wins: number;
  timestamp: string;
}

// Message types
export interface Message {
  id: string;
  senderId: string;
  sender?: User;
  receiverId?: string;
  groupId?: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  type: 'text' | 'system' | 'image';
}

export interface Conversation {
  id: string;
  participants: User[];
  lastMessage?: Message;
  unreadCount: number;
  isGroup: boolean;
  groupName?: string;
  groupAvatar?: string;
}

// Achievement types
export type AchievementTier = 'iron' | 'bronze' | 'silver' | 'gold' | 'diamond' | 'vit_champion';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  tier: AchievementTier;
  unlockedAt?: string;
  isUnlocked: boolean;
}

// Notification types
export type NotificationType = 'tournament' | 'post_reply' | 'group_invite' | 'match_result' | 'achievement' | 'system' | 'broadcast';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
  icon?: string;
}

// Report types
export interface Report {
  id: string;
  reporterId: string;
  reporter?: User;
  reportedId: string;
  reported?: User;
  reportedType: 'user' | 'post' | 'message' | 'group';
  reason: string;
  description: string;
  status: 'pending' | 'resolved' | 'dismissed';
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
}

// Admin types
export interface AdminAction {
  id: string;
  adminId: string;
  action: string;
  targetTable: string;
  targetId: string;
  details: string;
  timestamp: string;
}

// Arcade game score types
export interface ArcadeScore {
  id: string;
  userId: string;
  user?: User;
  gameSlug: string;
  score: number;
  timestamp: string;
}

// ============================================
// VIT-Specific Constants
// ============================================

export const VIT_HOSTELS = [
  "Hostel A (Men's)", "Hostel B (Men's)", "Hostel C (Men's)", "Hostel D (Men's)",
  "Hostel E (Men's)", "Hostel F (Men's)", "Hostel G (Men's)", "Hostel H (Men's)",
  "Hostel J (Men's)", "Hostel K (Men's)", "Hostel L (Men's)", "Hostel M (Men's)",
  "Hostel N (Men's)", "Hostel P (Men's)", "Hostel Q (Men's)", "Hostel R (Men's)",
  "Ladies Hostel A", "Ladies Hostel B", "Ladies Hostel C", "Ladies Hostel D",
  "Ladies Hostel E", "Ladies Hostel F",
  "Day Scholar",
] as const;

export const VIT_VENUES = [
  "Main Ground (Football/Cricket)",
  "Cricket Ground",
  "Basketball Court",
  "Volleyball Court",
  "Badminton Court (Indoor)",
  "Tennis Court",
  "Table Tennis Room",
  "Shuttle Court",
  "Athletic Track",
  "Swimming Pool",
  "Kabaddi Ground",
  "Hockey Ground",
  "Hostel Common Room",
  "Men's Hostel Ground",
  "Ladies Hostel Ground",
  "C-Block Canteen Area",
  "SJT Seminar Hall",
  "Tech Park Lobby",
  "Anna Auditorium",
  "GDN Auditorium",
  "Library Ground Floor",
  "SMV Food Court",
  "Greenos",
  "Gazebo",
  "Online / Virtual",
] as const;

export type VITHostel = (typeof VIT_HOSTELS)[number];
export type VITVenue = (typeof VIT_VENUES)[number];
