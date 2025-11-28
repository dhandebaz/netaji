
export const PROJECT_CONTEXT = `
APP ARCHITECTURE CONTEXT:
The application is "Neta", a political accountability platform built with React 19, TypeScript, TailwindCSS, and Vite.

INTEGRATION CAPABILITIES (NEW):
- Vector DB: Pinecone (Supported via Settings)
- Backend/Auth: Supabase (Supported via Settings)
- Agent Orchestration: CrewAI (Supported via Settings)
- Scraping: Jina Reader, Firecrawl (Supported via Settings)
- AI Providers: Google Gemini, Groq, HuggingFace, OpenRouter (Multi-provider fallback supported)

TYPE DEFINITIONS (CRITICAL - USE THESE EXACTLY):
\`\`\`typescript
export interface NewsItem {
  id: number;
  headline: string;
  source: string;
  date: string;
  snippet: string;
  url: string;
}

export interface RSSSource {
  id: string;
  name: string;
  url: string;
  enabled: boolean;
}

export interface Politician {
  id: number;
  name: string;
  slug: string;
  party: string;
  partyLogo: string; // Emoji or URL
  state: string;
  constituency: string;
  photoUrl: string;
  mynetaId?: string; // ID for myneta.info
  electionSlug?: string; // e.g., 'LokSabha2024' or 'Delhi2025'
  age: number;
  approvalRating: number; // 0-100
  totalAssets: number; // in Crores
  criminalCases: number;
  education: string;
  attendance: number; // 0-100
  verified: boolean;
  status: 'active' | 'retired' | 'deceased';
  votes: {
    up: number;
    down: number;
  };
  history: {
    year: number;
    position: string;
    result: string;
  }[];
  assetsBreakdown: {
    movable: number;
    immovable: number;
    liabilities: number;
  }[];
  news: NewsItem[];
}

export interface Volunteer {
  id: number;
  name: string;
  rank: number;
  rtisFiled: number;
  points: number;
  state: string;
}

export interface RTITask {
  id: number;
  politicianName: string;
  topic: string;
  deadline: string; // ISO date
  status: 'available' | 'locked' | 'filed' | 'completed';
  daysLeft: number;
  pioDetails?: {
    name: string;
    address: string;
  };
}

export enum SortOption {
  RANDOM = 'Random',
  BEST_APPROVAL = 'Best Approval',
  WORST_APPROVAL = 'Worst Approval',
  MOST_ASSETS = 'Most Assets',
  MOST_CRIMINAL = 'Most Criminal Cases'
}

export interface AIJob {
  id: string;
  request: string;
  model: string;
  status: 'pending' | 'approved' | 'deployed' | 'rejected';
  cost: number;
  timestamp: string;
  diff?: string;
  analysis?: string;
}

export interface CronJob {
  id: string;
  name: string;
  description: string;
  interval: number; // in milliseconds
  lastRun: number | null;
  status: 'idle' | 'running' | 'success' | 'failed';
  autoRun: boolean;
}

export interface JobLog {
  id: string;
  jobId: string;
  timestamp: string;
  message: string;
  type: 'info' | 'error' | 'success';
}
\`\`\`

CORE FILE CONTENT (REFERENCE FOR DIFFS):

File: /pages/SuperAdmin.tsx
\`\`\`tsx
// ... SuperAdmin Code provided in prompt (Updated version exists in app now) ...
// Uses services: geminiService, rssService, scraperService, schedulerService.
\`\`\`

CODING RULES:
- Use 'lucide-react' for icons.
- Use CSS variables for colors.
- If you modify a file, provide a valid 'diff --git' patch based on the content above.
- When using libraries, assume standard react patterns.
`;