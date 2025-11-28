
import { Politician, Volunteer, RTITask, ClaimRequest, Language, SatiricalGame, PublicComplaint } from './types';

export const DEFAULT_PLACEHOLDER_IMAGE = "https://via.placeholder.com/200?text=No+Image";

export const INDIAN_LANGUAGES: Language[] = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
    { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
    { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
    { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
    { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
    { code: 'ur', name: 'Urdu', nativeName: 'اُردُو' },
    { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
    { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
    { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
    { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ' },
    { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
    { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া' },
    { code: 'mai', name: 'Maithili', nativeName: 'मैथिली' },
    { code: 'sat', name: 'Santali', nativeName: 'ᱥᱟᱱᱛᱟᱲᱤ' },
    { code: 'ks', name: 'Kashmiri', nativeName: 'कश्मीरी' },
    { code: 'ne', name: 'Nepali', nativeName: 'नेपाली' },
    { code: 'gom', name: 'Konkani', nativeName: 'कोंकणी' },
    { code: 'sd', name: 'Sindhi', nativeName: 'सिन्धी' },
    { code: 'doi', name: 'Dogri', nativeName: 'डोगरी' },
    { code: 'mni', name: 'Manipuri', nativeName: 'ꯃꯅꯤꯄꯨꯔꯤ' },
    { code: 'brx', name: 'Bodo', nativeName: 'बड़ो' },
    { code: 'sa', name: 'Sanskrit', nativeName: 'संस्कृतम्' },
];

const MOCK_NEWS = [
  {
    id: 1,
    headline: "Parliament Session: Debate on Budget Allocation heats up",
    source: "The National Daily",
    date: "2024-08-12",
    snippet: "During the recent parliamentary session, issues regarding rural development funds were raised aggressively...",
    url: "#"
  },
  {
    id: 2,
    headline: "New infrastructure project inaugurated in constituency",
    source: "State Times",
    date: "2024-07-25",
    snippet: "A new highway connecting the district headquarters was inaugurated today, promising better connectivity...",
    url: "#"
  },
  {
    id: 3,
    headline: "Questions raised over MPLAD fund utilization",
    source: "Civic Watch",
    date: "2024-06-10",
    snippet: "Local activists have questioned the delay in the completion of community center projects funded by MPLADS...",
    url: "#"
  }
];

const MOCK_ANNOUNCEMENTS = [
    {
        id: 'ann-1',
        title: "Weekly Janta Darbar Schedule",
        content: "I will be available at the Camp Office every Monday and Thursday from 10 AM to 2 PM to hear public grievances personally.",
        date: "2025-10-24",
        type: 'event' as const,
        likes: 1420
    },
    {
        id: 'ann-2',
        title: "Response to Road Construction Delays",
        content: "I have taken cognizance of the delays in the NH-42 project. A show-cause notice has been issued to the contractor, and work will resume within 48 hours.",
        date: "2025-10-20",
        type: 'response' as const,
        likes: 3200
    }
];

export const MOCK_POLITICIANS: Politician[] = [
  {
    id: 1,
    name: "Narendra Modi",
    slug: "narendra-modi",
    party: "BJP",
    partyLogo: "🪷",
    state: "Uttar Pradesh",
    constituency: "Varanasi",
    photoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Prime_Minister_Narendra_Modi_in_New_Delhi_on_August_08%2C_2024_%28cropped%29.jpg/800px-Prime_Minister_Narendra_Modi_in_New_Delhi_on_August_08%2C_2024_%28cropped%29.jpg",
    mynetaId: "2513",
    electionSlug: "LokSabha2024",
    age: 74,
    approvalRating: 72,
    totalAssets: 3.07,
    criminalCases: 0,
    education: "Post Graduate",
    attendance: 85,
    verified: true,
    status: 'active',
    votes: { up: 15420, down: 6000 },
    history: [
      { year: 2024, position: "Prime Minister", result: "Won" },
      { year: 2019, position: "Prime Minister", result: "Won" }
    ],
    assetsBreakdown: [{ movable: 1.5, immovable: 1.57, liabilities: 0 }],
    news: MOCK_NEWS,
    announcements: MOCK_ANNOUNCEMENTS,
    complaintStats: { total: 120, resolved: 80, pending: 40 }
  },
  {
    id: 2,
    name: "Rahul Gandhi",
    slug: "rahul-gandhi",
    party: "INC",
    partyLogo: "✋",
    state: "Uttar Pradesh",
    constituency: "Raebareli",
    photoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Rahul_Gandhi_in_March_2024.jpg/800px-Rahul_Gandhi_in_March_2024.jpg",
    mynetaId: "2514",
    electionSlug: "LokSabha2024",
    age: 54,
    approvalRating: 48,
    totalAssets: 15.8,
    criminalCases: 5,
    education: "M.Phil",
    attendance: 62,
    verified: true,
    status: 'active',
    votes: { up: 9800, down: 10500 },
    history: [
      { year: 2024, position: "MP", result: "Won" },
      { year: 2019, position: "MP", result: "Won" }
    ],
    assetsBreakdown: [{ movable: 9.2, immovable: 6.6, liabilities: 0.5 }],
    news: MOCK_NEWS,
    announcements: [MOCK_ANNOUNCEMENTS[1]],
    complaintStats: { total: 85, resolved: 20, pending: 65 }
  },
  {
    id: 3,
    name: "Arvind Kejriwal",
    slug: "arvind-kejriwal",
    party: "AAP",
    partyLogo: "🧹",
    state: "Delhi",
    constituency: "New Delhi",
    photoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Arvind_Kejriwal_2022_Official_Portrait.jpg/800px-Arvind_Kejriwal_2022_Official_Portrait.jpg",
    mynetaId: "2515", 
    electionSlug: "Delhi2020",
    age: 56,
    approvalRating: 55,
    totalAssets: 3.44,
    criminalCases: 13,
    education: "Graduate Professional",
    attendance: 90,
    verified: true,
    status: 'active',
    votes: { up: 8500, down: 7000 },
    history: [
       { year: 2020, position: "Chief Minister", result: "Won" }
    ],
    assetsBreakdown: [{ movable: 1.0, immovable: 2.44, liabilities: 0 }],
    news: MOCK_NEWS,
    complaintStats: { total: 200, resolved: 150, pending: 50 }
  },
  {
    id: 4,
    name: "Mamata Banerjee",
    slug: "mamata-banerjee",
    party: "AITC",
    partyLogo: "🌱",
    state: "West Bengal",
    constituency: "Bhabanipur",
    photoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Mamata_Banerjee_CM_WB.jpg/800px-Mamata_Banerjee_CM_WB.jpg",
    mynetaId: "2516",
    electionSlug: "WestBengal2021",
    age: 69,
    approvalRating: 60,
    totalAssets: 0.17,
    criminalCases: 4,
    education: "Post Graduate",
    attendance: 75,
    verified: true,
    status: 'active',
    votes: { up: 12000, down: 8000 },
    history: [
        { year: 2021, position: "Chief Minister", result: "Won" }
    ],
    assetsBreakdown: [{ movable: 0.17, immovable: 0, liabilities: 0 }],
    news: MOCK_NEWS
  },
  {
    id: 5,
    name: "Amit Shah",
    slug: "amit-shah",
    party: "BJP",
    partyLogo: "🪷",
    state: "Gujarat",
    constituency: "Gandhinagar",
    photoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Amit_Shah_New_Delhi_02.jpg/800px-Amit_Shah_New_Delhi_02.jpg",
    mynetaId: "2517",
    electionSlug: "LokSabha2024",
    age: 60,
    approvalRating: 65,
    totalAssets: 38.8,
    criminalCases: 4,
    education: "Graduate",
    attendance: 92,
    verified: true,
    status: 'active',
    votes: { up: 11000, down: 6000 },
    history: [
        { year: 2024, position: "Home Minister", result: "Won" }
    ],
    assetsBreakdown: [{ movable: 20, immovable: 18.8, liabilities: 0.4 }],
    news: MOCK_NEWS
  },
  {
    id: 6,
    name: "Shashi Tharoor",
    slug: "shashi-tharoor",
    party: "INC",
    partyLogo: "✋",
    state: "Kerala",
    constituency: "Thiruvananthapuram",
    photoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Shashi_Tharoor_2024.jpg/800px-Shashi_Tharoor_2024.jpg",
    mynetaId: "2518",
    electionSlug: "LokSabha2024",
    age: 68,
    approvalRating: 82,
    totalAssets: 35.0,
    criminalCases: 2,
    education: "Doctorate",
    attendance: 96,
    verified: true,
    status: 'active',
    votes: { up: 7800, down: 1200 },
    history: [
        { year: 2024, position: "MP", result: "Won" }
    ],
    assetsBreakdown: [{ movable: 30, immovable: 5, liabilities: 0 }],
    news: MOCK_NEWS
  },
  {
    id: 7,
    name: "Yogi Adityanath",
    slug: "yogi-adityanath",
    party: "BJP",
    partyLogo: "🪷",
    state: "Uttar Pradesh",
    constituency: "Gorakhpur Urban",
    photoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ee/Yogi_Adityanath_in_March_2024.jpg/800px-Yogi_Adityanath_in_March_2024.jpg",
    mynetaId: "2519",
    electionSlug: "UttarPradesh2022",
    age: 52,
    approvalRating: 75,
    totalAssets: 1.5,
    criminalCases: 0,
    education: "Graduate",
    attendance: 88,
    verified: true,
    status: 'active',
    votes: { up: 18000, down: 6000 },
    history: [
        { year: 2022, position: "Chief Minister", result: "Won" }
    ],
    assetsBreakdown: [{ movable: 1.5, immovable: 0, liabilities: 0 }],
    news: MOCK_NEWS
  },
  {
    id: 8,
    name: "Akhilesh Yadav",
    slug: "akhilesh-yadav",
    party: "SP",
    partyLogo: "🚲",
    state: "Uttar Pradesh",
    constituency: "Kannauj",
    photoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Akhilesh_Yadav_August_2024.jpg/800px-Akhilesh_Yadav_August_2024.jpg",
    mynetaId: "2520",
    electionSlug: "LokSabha2024",
    age: 51,
    approvalRating: 52,
    totalAssets: 40.0,
    criminalCases: 1,
    education: "Post Graduate",
    attendance: 55,
    verified: true,
    status: 'active',
    votes: { up: 6000, down: 5500 },
    history: [
        { year: 2024, position: "MP", result: "Won" }
    ],
    assetsBreakdown: [{ movable: 15, immovable: 25, liabilities: 1 }],
    news: MOCK_NEWS,
    complaintStats: { total: 45, resolved: 5, pending: 40 }
  },
  {
    id: 9,
    name: "Eknath Shinde",
    slug: "eknath-shinde",
    party: "SHS",
    partyLogo: "🏹",
    state: "Maharashtra",
    constituency: "Kopri-Pachpakhadi",
    photoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Eknath_Shinde_2022.jpg/800px-Eknath_Shinde_2022.jpg",
    mynetaId: "2521",
    electionSlug: "Maharashtra2019",
    age: 60,
    approvalRating: 58,
    totalAssets: 11.5,
    criminalCases: 18,
    education: "Graduate",
    attendance: 90,
    verified: true,
    status: 'active',
    votes: { up: 8500, down: 6200 },
    history: [
        { year: 2019, position: "MLA", result: "Won" },
        { year: 2022, position: "Chief Minister", result: "Appointed" }
    ],
    assetsBreakdown: [{ movable: 2.5, immovable: 9.0, liabilities: 3.2 }],
    news: MOCK_NEWS
  },
  {
    id: 10,
    name: "Nitish Kumar",
    slug: "nitish-kumar",
    party: "JD(U)",
    partyLogo: "🏹",
    state: "Bihar",
    constituency: "Legislative Council",
    photoUrl: DEFAULT_PLACEHOLDER_IMAGE, // Missing photo
    age: 73,
    approvalRating: 45,
    totalAssets: 0.56, // 56 Lakhs
    criminalCases: 1,
    education: "Graduate Professional",
    attendance: 95,
    verified: false,
    status: 'active',
    votes: { up: 4000, down: 8000 },
    history: [
        { year: 2020, position: "Chief Minister", result: "Won" }
    ],
    assetsBreakdown: [{ movable: 0.16, immovable: 0.40, liabilities: 0 }],
    news: []
  }
];

export const STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", 
  "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", 
  "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", 
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", 
  "Uttarakhand", "West Bengal", "Delhi", "Jammu and Kashmir"
];

export const MOCK_VOLUNTEERS: Volunteer[] = [
  { id: 1, name: "Amit Kumar", rank: 23, rtisFiled: 12, points: 156, state: "Delhi" },
  { id: 2, name: "Sneha Reddy", rank: 5, rtisFiled: 45, points: 620, state: "Telangana" },
  { id: 3, name: "Rajesh Singh", rank: 12, rtisFiled: 28, points: 340, state: "Uttar Pradesh" }
];

export const MOCK_RTI_TASKS: RTITask[] = [
  { 
    id: "rti-101", 
    politicianId: 2,
    politicianName: "Rahul Gandhi", 
    topic: "MPLAD Funds FY 2024-25",
    description: "Request detailed utilization certificate for ₹5Cr community hall project.",
    deadline: "2025-12-20", 
    status: "generated", 
    priority: "medium",
    generatedDate: "2025-10-01",
    pioDetails: { name: "District Collector", address: "District Collectorate, Wayanad, Kerala" }
  },
  { 
    id: "rti-102",
    politicianId: 1, 
    politicianName: "Narendra Modi", 
    topic: "Attendance Jan-Nov 2025",
    description: "Verify session attendance records against official bulletin.",
    deadline: "2025-12-15", 
    status: "claimed",
    priority: "high",
    generatedDate: "2025-10-05",
    claimedBy: "Amit Kumar",
    pioDetails: { name: "Secretary", address: "Lok Sabha Secretariat, New Delhi" }
  },
  { 
    id: "rti-103", 
    politicianId: 5,
    politicianName: "Amit Shah", 
    topic: "Questions Raised 2024",
    description: "Fetch transcripts of all unstarred questions raised in winter session.",
    deadline: "2025-12-10", 
    status: "filed", 
    priority: "low",
    generatedDate: "2025-09-20",
    claimedBy: "Sneha Reddy",
    filedDate: "2025-10-10",
    pioDetails: { name: "PIO", address: "Ministry of Home Affairs, North Block, New Delhi" }
  }
];

export const MOCK_CLAIMS: ClaimRequest[] = [
    {
        id: 'claim-001',
        politicianId: 8,
        politicianName: "Akhilesh Yadav",
        email: "office@akhileshyadav.in", 
        phone: "+91 98765 12345",
        designation: "Member of Parliament",
        documentUrl: "#",
        status: 'pending',
        submittedAt: "2025-10-23T10:00:00Z"
    }
];

// --- NEW MOCKS ---

export const MOCK_GAMES: SatiricalGame[] = [
    {
        id: 'g1',
        title: 'Chair Saver',
        description: 'Help the politician dodge accountability and keep their seat! Collect bribes to speed up.',
        targetPoliticianId: 9, // Eknath Shinde
        thumbnailUrl: 'https://images.unsplash.com/photo-1551103782-8ab07afd45c1?auto=format&fit=crop&q=80&w=400',
        playUrl: '#',
        plays: 12450,
        rating: 4.5
    },
    {
        id: 'g2',
        title: 'Scam Dodger',
        description: 'Run through the bureaucray maze without getting caught by the ED or CBI.',
        targetPoliticianId: 3, // Kejriwal
        thumbnailUrl: 'https://images.unsplash.com/photo-1633419461186-7d7507690054?auto=format&fit=crop&q=80&w=400',
        playUrl: '#',
        plays: 8900,
        rating: 4.8
    }
];

export const MOCK_COMPLAINTS: PublicComplaint[] = [
    {
        id: 'c1',
        politicianId: 8,
        userId: 'u123',
        userName: 'Ravi Sharma',
        category: 'Civic',
        description: 'Potholes on Main Road, Kannauj haven\'t been fixed in 6 months despite promises.',
        location: 'Kannauj, UP',
        upvotes: 245,
        status: 'pending',
        filedAt: '2025-10-25'
    },
    {
        id: 'c2',
        politicianId: 8,
        userId: 'u456',
        userName: 'Priya Verma',
        category: 'Promise Broken',
        description: 'Promised free wifi in public parks, but no installation seen yet.',
        location: 'Kannauj, UP',
        upvotes: 120,
        status: 'investigating',
        filedAt: '2025-10-20',
        proofOfWork: "Contract tender has been released. Installation starts Nov 1."
    }
];
