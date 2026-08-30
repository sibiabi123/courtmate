/**
 * Dynamic Campus Configuration Helper
 * Stores and manages live campus identity, sports venues, and hostel blocks.
 * Enables the Solo Admin to customize grounds and residences on the fly without touching code.
 */

export interface Venue {
  id: string;
  name: string;
  sport: string;
  type: 'indoor' | 'outdoor';
  hasLighting: boolean;
  active: boolean;
}

export interface HostelBlock {
  id: string;
  name: string;
  gender: 'mens' | 'ladies' | 'co-ed' | 'off-campus';
  active: boolean;
}

export interface CampusConfig {
  collegeName: string;
  shortName: string;
  emblem: string;
  country: string;
  verifiedDomain: string;
  announcement: string;
  venues: Venue[];
  hostels: HostelBlock[];
  supportedSports: Array<{ name: string; emoji: string; defaultPlayers: number }>;
}

export const DEFAULT_CAMPUS_CONFIG: CampusConfig = {
  collegeName: 'Vellore Institute of Technology',
  shortName: 'VIT Vellore',
  emblem: '🏛️',
  country: 'India',
  verifiedDomain: 'vitstudent.ac.in',
  announcement: '🏆 Inter-Hostel Athletic Cup 2026 Live · Stake 1v1 Duels to Earn Hostel Points!',
  venues: [
    { id: 'v1', name: 'Main Sports Arena (Indoor Court 1-4)', sport: 'Badminton', type: 'indoor', hasLighting: true, active: true },
    { id: 'v2', name: 'Basketball Center Court (Floodlit)', sport: 'Basketball', type: 'outdoor', hasLighting: true, active: true },
    { id: 'v3', name: 'Main Football & Athletics Stadium', sport: 'Football', type: 'outdoor', hasLighting: true, active: true },
    { id: 'v4', name: 'Cricket Practice Nets & Turf Pitch', sport: 'Cricket', type: 'outdoor', hasLighting: true, active: true },
    { id: 'v5', name: 'Table Tennis Hall (Student Center)', sport: 'Table Tennis', type: 'indoor', hasLighting: true, active: true },
    { id: 'v6', name: 'Olympic Swimming Pool Complex', sport: 'Swimming', type: 'outdoor', hasLighting: true, active: true },
    { id: 'v7', name: 'Outdoor Tennis Courts 1 & 2', sport: 'Tennis', type: 'outdoor', hasLighting: true, active: true },
    { id: 'v8', name: 'Volleyball Court (Block D)', sport: 'Volleyball', type: 'outdoor', hasLighting: true, active: true },
  ],
  hostels: [
    { id: 'h1', name: 'MH-A Block', gender: 'mens', active: true },
    { id: 'h2', name: 'MH-B Block', gender: 'mens', active: true },
    { id: 'h3', name: 'MH-C Block', gender: 'mens', active: true },
    { id: 'h4', name: 'MH-D Block', gender: 'mens', active: true },
    { id: 'h5', name: 'MH-E Block', gender: 'mens', active: true },
    { id: 'h6', name: 'MH-F Block', gender: 'mens', active: true },
    { id: 'h7', name: 'MH-G Block', gender: 'mens', active: true },
    { id: 'h8', name: 'MH-H Block', gender: 'mens', active: true },
    { id: 'h9', name: 'MH-J Block', gender: 'mens', active: true },
    { id: 'h10', name: 'MH-K Block', gender: 'mens', active: true },
    { id: 'h11', name: 'MH-L Block', gender: 'mens', active: true },
    { id: 'h12', name: 'MH-M Block', gender: 'mens', active: true },
    { id: 'h13', name: 'MH-N Block', gender: 'mens', active: true },
    { id: 'h14', name: 'MH-P Block', gender: 'mens', active: true },
    { id: 'h15', name: 'MH-Q Block', gender: 'mens', active: true },
    { id: 'h16', name: 'MH-R Block', gender: 'mens', active: true },
    { id: 'h17', name: 'LH-A Block', gender: 'ladies', active: true },
    { id: 'h18', name: 'LH-B Block', gender: 'ladies', active: true },
    { id: 'h19', name: 'LH-C Block', gender: 'ladies', active: true },
    { id: 'h20', name: 'LH-D Block', gender: 'ladies', active: true },
    { id: 'h21', name: 'LH-E Block', gender: 'ladies', active: true },
    { id: 'h22', name: 'LH-F Block', gender: 'ladies', active: true },
    { id: 'h23', name: 'Day Scholar / Off-Campus', gender: 'off-campus', active: true },
  ],
  supportedSports: [
    { name: 'Cricket', emoji: '🏏', defaultPlayers: 11 },
    { name: 'Football', emoji: '⚽', defaultPlayers: 14 },
    { name: 'Badminton', emoji: '🏸', defaultPlayers: 4 },
    { name: 'Basketball', emoji: '🏀', defaultPlayers: 10 },
    { name: 'Table Tennis', emoji: '🏓', defaultPlayers: 4 },
    { name: 'Volleyball', emoji: '🏐', defaultPlayers: 12 },
    { name: 'Tennis', emoji: '🎾', defaultPlayers: 4 },
    { name: 'Chess', emoji: '♟️', defaultPlayers: 2 },
    { name: 'Kabaddi', emoji: '🤼', defaultPlayers: 14 },
  ],
};

let _memoryConfig: CampusConfig = { ...DEFAULT_CAMPUS_CONFIG };

export function getActiveCampusConfig(): CampusConfig {
  return _memoryConfig;
}

export function updateActiveCampusConfig(updates: Partial<CampusConfig>): CampusConfig {
  _memoryConfig = { ..._memoryConfig, ...updates };
  return _memoryConfig;
}
