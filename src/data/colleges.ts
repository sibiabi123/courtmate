export interface CollegeVenue {
  id: string;
  name: string;
  type: 'indoor' | 'outdoor' | 'ground' | 'court' | 'pool' | 'track';
  sports: string[];
}

export interface College {
  id: string;
  name: string;
  shortName: string;
  country: string;
  city: string;
  emblem: string;
  color: string;
  verifiedDomains: string[];
  residences: string[];
  venues: CollegeVenue[];
}

export const GLOBAL_COLLEGES: College[] = [
  // ── INDIA ─────────────────────────────────────────────────────────────
  {
    id: 'vit-vellore',
    name: 'Vellore Institute of Technology (VIT)',
    shortName: 'VIT Vellore',
    country: 'India',
    city: 'Vellore',
    emblem: '🏛️',
    color: '#CCFF00',
    verifiedDomains: ['vitstudent.ac.in', 'vit.ac.in'],
    residences: [
      'Day Scholar', 'MH-A Block', 'MH-B Block', 'MH-C Block', 'MH-D Block',
      'MH-E Block', 'MH-F Block', 'MH-G Block', 'MH-H Block', 'MH-J Block',
      'MH-K Block', 'MH-L Block', 'MH-M Block', 'MH-N Block', 'MH-P Block',
      'MH-Q Block', 'MH-R Block', 'LH-A Block', 'LH-B Block', 'LH-C Block',
      'LH-D Block', 'LH-E Block', 'LH-F Block'
    ],
    venues: [
      { id: 'v1', name: 'Main Sports Arena', type: 'outdoor', sports: ['Football', 'Cricket', 'Athletics'] },
      { id: 'v2', name: 'Indoor Badminton Complex', type: 'indoor', sports: ['Badminton'] },
      { id: 'v3', name: 'Basketball Center Court', type: 'court', sports: ['Basketball'] },
      { id: 'v4', name: 'Table Tennis Hall', type: 'indoor', sports: ['Table Tennis'] },
      { id: 'v5', name: 'Cricket Nets Arena', type: 'outdoor', sports: ['Cricket'] },
      { id: 'v6', name: 'Volleyball Court', type: 'court', sports: ['Volleyball'] },
      { id: 'v7', name: 'Olympic Swimming Pool', type: 'pool', sports: ['Swimming'] },
      { id: 'v8', name: 'Outdoor Multi-Courts', type: 'court', sports: ['Tennis', 'Basketball'] },
    ],
  },
  {
    id: 'iit-madras',
    name: 'Indian Institute of Technology Madras (IITM)',
    shortName: 'IIT Madras',
    country: 'India',
    city: 'Chennai',
    emblem: '⚡',
    color: '#00F0FF',
    verifiedDomains: ['smail.iitm.ac.in', 'iitm.ac.in'],
    residences: [
      'Day Scholar', 'Alakananda', 'Brahmaputra', 'Cauvery', 'Ganga',
      'Godavari', 'Jamuna', 'Krishna', 'Mahanadi', 'Mandakini',
      'Narmada', 'Pampa', 'Saraswathi', 'Sarayu', 'Sharavathi',
      'Sindhu', 'Tamiraparani', 'Tapti', 'Bhadra'
    ],
    venues: [
      { id: 'im1', name: 'IITM Sports Complex Stadium', type: 'ground', sports: ['Cricket', 'Football', 'Athletics'] },
      { id: 'im2', name: 'SAC Badminton Courts', type: 'indoor', sports: ['Badminton'] },
      { id: 'im3', name: 'Hostel Quad Basketball Courts', type: 'court', sports: ['Basketball'] },
      { id: 'im4', name: 'Synthetic Tennis Arena', type: 'court', sports: ['Tennis'] },
      { id: 'im5', name: 'Gymkhana Table Tennis Room', type: 'indoor', sports: ['Table Tennis'] },
      { id: 'im6', name: 'Aquatic Center', type: 'pool', sports: ['Swimming'] },
    ],
  },
  {
    id: 'iit-bombay',
    name: 'Indian Institute of Technology Bombay (IITB)',
    shortName: 'IIT Bombay',
    country: 'India',
    city: 'Mumbai',
    emblem: '🔥',
    color: '#FF2A55',
    verifiedDomains: ['iitb.ac.in'],
    residences: [
      'Day Scholar', 'Hostel 1 (Queen of the Campus)', 'Hostel 2 (Wild West)',
      'Hostel 3', 'Hostel 4 (Madhouse)', 'Hostel 5', 'Hostel 12', 'Hostel 13',
      'Hostel 14', 'Hostel 15', 'Hostel 16', 'Hostel 17', 'Hostel 18'
    ],
    venues: [
      { id: 'ib1', name: 'Gymkhana Main Ground', type: 'ground', sports: ['Cricket', 'Football'] },
      { id: 'ib2', name: 'SAC Indoor Badminton Arena', type: 'indoor', sports: ['Badminton'] },
      { id: 'ib3', name: 'Amla Court (Basketball)', type: 'court', sports: ['Basketball'] },
      { id: 'ib4', name: 'Tennis Courts Complex', type: 'court', sports: ['Tennis'] },
      { id: 'ib5', name: 'Hostel Volleyball Sandpit', type: 'court', sports: ['Volleyball'] },
    ],
  },
  {
    id: 'bits-pilani',
    name: 'BITS Pilani',
    shortName: 'BITS Pilani',
    country: 'India',
    city: 'Pilani',
    emblem: '🎯',
    color: '#FFD700',
    verifiedDomains: ['pilani.bits-pilani.ac.in', 'bits-pilani.ac.in'],
    residences: [
      'Day Scholar', 'Shankar Bhawan', 'Vyas Bhawan', 'Budh Bhawan',
      'Gandhi Bhawan', 'Krishna Bhawan', 'Ram Bhawan', 'Meera Bhawan',
      'Malviya Bhawan', 'Ashok Bhawan', 'Bhagirath Bhawan'
    ],
    venues: [
      { id: 'bp1', name: 'Gym Grounds (BOSM Arena)', type: 'ground', sports: ['Cricket', 'Football'] },
      { id: 'bp2', name: 'Student Activity Centre (SAC)', type: 'indoor', sports: ['Badminton', 'Table Tennis'] },
      { id: 'bp3', name: 'Redi Basketball Courts', type: 'court', sports: ['Basketball'] },
      { id: 'bp4', name: 'Tennis Complex', type: 'court', sports: ['Tennis'] },
    ],
  },
  {
    id: 'iit-delhi',
    name: 'Indian Institute of Technology Delhi (IITD)',
    shortName: 'IIT Delhi',
    country: 'India',
    city: 'New Delhi',
    emblem: '🦅',
    color: '#a855f7',
    verifiedDomains: ['iitd.ac.in'],
    residences: [
      'Day Scholar', 'Aravali', 'Girnar', 'Jwalamukhi', 'Karakoram',
      'Kailash', 'Kumaon', 'Nilgiri', 'Shivalik', 'Vindhyachal',
      'Zanskar', 'Himadri', 'Satpura'
    ],
    venues: [
      { id: 'id1', name: 'Main Athletics Ground', type: 'ground', sports: ['Football', 'Cricket', 'Athletics'] },
      { id: 'id2', name: 'Mittal Indoor Sports Complex', type: 'indoor', sports: ['Badminton', 'Table Tennis'] },
      { id: 'id3', name: 'Synthetic Basketball Courts', type: 'court', sports: ['Basketball'] },
    ],
  },

  // ── UNITED STATES ─────────────────────────────────────────────────────
  {
    id: 'stanford',
    name: 'Stanford University',
    shortName: 'Stanford',
    country: 'United States',
    city: 'Stanford, CA',
    emblem: '🌲',
    color: '#FF2A55',
    verifiedDomains: ['stanford.edu'],
    residences: [
      'Off Campus', 'Wilbur Hall', 'Stern Hall', 'FloMo (Florence Moore)',
      'Roble Hall', 'Lagunita Court', 'GovCo (Governor\'s Corner)', 'Crothers Hall', 'Rains Houses'
    ],
    venues: [
      { id: 'st1', name: 'Arrillaga Center for Sports & Recreation (ACSR)', type: 'indoor', sports: ['Basketball', 'Badminton', 'Table Tennis'] },
      { id: 'st2', name: 'Taube Family Tennis Stadium', type: 'court', sports: ['Tennis'] },
      { id: 'st3', name: 'Maloney Field at Sunken Diamond', type: 'outdoor', sports: ['Baseball', 'Cricket'] },
      { id: 'st4', name: 'Cagan Stadium', type: 'ground', sports: ['Football'] },
      { id: 'st5', name: 'Avery Aquatic Center', type: 'pool', sports: ['Swimming'] },
    ],
  },
  {
    id: 'mit',
    name: 'Massachusetts Institute of Technology (MIT)',
    shortName: 'MIT',
    country: 'United States',
    city: 'Cambridge, MA',
    emblem: '🤖',
    color: '#00F0FF',
    verifiedDomains: ['mit.edu'],
    residences: [
      'Off Campus', 'Maseeh Hall', 'Baker House', 'Simmons Hall',
      'Next House', 'MacGregor House', 'New House', 'McCormick Hall', 'East Campus'
    ],
    venues: [
      { id: 'mit1', name: 'Zesiger Sports and Fitness Center (Z-Center)', type: 'indoor', sports: ['Basketball', 'Badminton', 'Swimming'] },
      { id: 'mit2', name: 'Steinbrenner Stadium', type: 'ground', sports: ['Football', 'Athletics'] },
      { id: 'mit3', name: 'DuPont Tennis Courts', type: 'court', sports: ['Tennis'] },
      { id: 'mit4', name: 'Rockwell Cage', type: 'indoor', sports: ['Volleyball', 'Basketball'] },
    ],
  },
  {
    id: 'harvard',
    name: 'Harvard University',
    shortName: 'Harvard',
    country: 'United States',
    city: 'Cambridge, MA',
    emblem: '🦁',
    color: '#A51C30',
    verifiedDomains: ['harvard.edu'],
    residences: [
      'Off Campus', 'Adams House', 'Cabot House', 'Currier House',
      'Dunster House', 'Eliot House', 'Kirkland House', 'Leverett House',
      'Lowell House', 'Mather House', 'Pforzheimer House', 'Quincy House', 'Winthrop House'
    ],
    venues: [
      { id: 'har1', name: 'Malkin Athletic Center (MAC)', type: 'indoor', sports: ['Basketball', 'Badminton', 'Table Tennis'] },
      { id: 'har2', name: 'Harvard Stadium Turf', type: 'ground', sports: ['Football'] },
      { id: 'har3', name: 'Beren Tennis Center', type: 'court', sports: ['Tennis'] },
      { id: 'har4', name: 'Blodgett Pool', type: 'pool', sports: ['Swimming'] },
    ],
  },
  {
    id: 'uc-berkeley',
    name: 'University of California, Berkeley (UC Berkeley)',
    shortName: 'UC Berkeley',
    country: 'United States',
    city: 'Berkeley, CA',
    emblem: '🐻',
    color: '#003262',
    verifiedDomains: ['berkeley.edu'],
    residences: [
      'Off Campus', 'Unit 1', 'Unit 2', 'Unit 3', 'Clark Kerr Campus',
      'Blackwell Hall', 'Stern Hall', 'Foothill'
    ],
    venues: [
      { id: 'ucb1', name: 'Recreational Sports Facility (RSF)', type: 'indoor', sports: ['Basketball', 'Badminton', 'Table Tennis', 'Volleyball'] },
      { id: 'ucb2', name: 'Underhill Field', type: 'ground', sports: ['Football'] },
      { id: 'ucb3', name: 'Hellman Tennis Complex', type: 'court', sports: ['Tennis'] },
    ],
  },

  // ── UNITED KINGDOM ────────────────────────────────────────────────────
  {
    id: 'oxford',
    name: 'University of Oxford',
    shortName: 'Oxford',
    country: 'United Kingdom',
    city: 'Oxford',
    emblem: '👑',
    color: '#002147',
    verifiedDomains: ['ox.ac.uk'],
    residences: [
      'Off Campus', 'Balliol College', 'Christ Church', 'Magdalen College',
      'St John\'s College', 'Trinity College', 'Keble College', 'Oriel College'
    ],
    venues: [
      { id: 'ox1', name: 'Iffley Road Sports Complex', type: 'ground', sports: ['Athletics', 'Football', 'Cricket'] },
      { id: 'ox2', name: 'Sir Roger Bannister Running Track', type: 'track', sports: ['Athletics'] },
      { id: 'ox3', name: 'University Sports Hall', type: 'indoor', sports: ['Badminton', 'Basketball'] },
      { id: 'ox4', name: 'Iffley Tennis Courts', type: 'court', sports: ['Tennis'] },
    ],
  },
  {
    id: 'cambridge',
    name: 'University of Cambridge',
    shortName: 'Cambridge',
    country: 'United Kingdom',
    city: 'Cambridge',
    emblem: '🎓',
    color: '#A3C1AD',
    verifiedDomains: ['cam.ac.uk'],
    residences: [
      'Off Campus', 'Trinity College', 'King\'s College', 'St John\'s College',
      'Queens\' College', 'Jesus College', 'Pembroke College', 'Gonville & Caius'
    ],
    venues: [
      { id: 'cam1', name: 'University Sports Centre (West Cambridge)', type: 'indoor', sports: ['Badminton', 'Basketball', 'Table Tennis'] },
      { id: 'cam2', name: 'Fenners Cricket Ground', type: 'ground', sports: ['Cricket'] },
      { id: 'cam3', name: 'Grange Road Rugby & Football Ground', type: 'ground', sports: ['Football'] },
    ],
  },

  // ── SINGAPORE / ASIA / AUSTRALIA ──────────────────────────────────────
  {
    id: 'nus',
    name: 'National University of Singapore (NUS)',
    shortName: 'NUS Singapore',
    country: 'Singapore',
    city: 'Singapore',
    emblem: '🦁',
    color: '#EF7C00',
    verifiedDomains: ['u.nus.edu', 'nus.edu.sg'],
    residences: [
      'Off Campus', 'Eusoff Hall', 'Kent Ridge Hall', 'King Edward VII Hall',
      'Raffles Hall', 'Sheares Hall', 'Temasek Hall', 'UTown Residences', 'RC4'
    ],
    venues: [
      { id: 'nus1', name: 'University Sports Centre (USC)', type: 'indoor', sports: ['Badminton', 'Basketball', 'Table Tennis'] },
      { id: 'nus2', name: 'MPSH (Multi-Purpose Sports Hall)', type: 'indoor', sports: ['Volleyball', 'Badminton'] },
      { id: 'nus3', name: 'Sports and Recreation Track & Field', type: 'ground', sports: ['Football', 'Athletics'] },
      { id: 'nus4', name: 'UTown Outdoor Courts', type: 'court', sports: ['Basketball', 'Tennis'] },
    ],
  },
  {
    id: 'unimelb',
    name: 'The University of Melbourne',
    shortName: 'UniMelb',
    country: 'Australia',
    city: 'Melbourne',
    emblem: '🦘',
    color: '#094183',
    verifiedDomains: ['student.unimelb.edu.au', 'unimelb.edu.au'],
    residences: [
      'Off Campus', 'Trinity College', 'Ormond College', 'Queen\'s College',
      'Newman College', 'University College', 'The Lofts', 'Little Hall'
    ],
    venues: [
      { id: 'um1', name: 'Beaurepaire Centre', type: 'indoor', sports: ['Swimming', 'Basketball'] },
      { id: 'um2', name: 'University Oval', type: 'ground', sports: ['Cricket', 'Football'] },
      { id: 'um3', name: 'Sports Centre Squash & Badminton Complex', type: 'indoor', sports: ['Badminton', 'Table Tennis'] },
    ],
  },
];

// Fallback dynamic college for custom / unlisted institutions
export function createCustomCollege(name: string, city: string = 'Campus City', country: string = 'Global'): College {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  return {
    id: slug || 'custom-campus',
    name,
    shortName: name.length > 20 ? name.slice(0, 18) + '...' : name,
    country,
    city,
    emblem: '🏛️',
    color: '#CCFF00',
    verifiedDomains: [],
    residences: ['Off Campus / Day Scholar', 'Campus Dorm A', 'Campus Dorm B', 'Hostel 1', 'Hostel 2'],
    venues: [
      { id: 'cv1', name: 'Campus Main Ground', type: 'ground', sports: ['Football', 'Cricket'] },
      { id: 'cv2', name: 'Indoor Sports Hall', type: 'indoor', sports: ['Badminton', 'Table Tennis', 'Basketball'] },
      { id: 'cv3', name: 'Multi-Sports Courts', type: 'court', sports: ['Basketball', 'Tennis', 'Volleyball'] },
    ],
  };
}

export function getCollegeById(id: string): College {
  const found = GLOBAL_COLLEGES.find(c => c.id === id);
  if (found) return found;
  return GLOBAL_COLLEGES[0]; // Default to VIT Vellore
}

export function searchColleges(query: string): College[] {
  if (!query.trim()) return GLOBAL_COLLEGES;
  const q = query.toLowerCase();
  return GLOBAL_COLLEGES.filter(
    c => c.name.toLowerCase().includes(q) ||
         c.shortName.toLowerCase().includes(q) ||
         c.city.toLowerCase().includes(q) ||
         c.country.toLowerCase().includes(q)
  );
}
