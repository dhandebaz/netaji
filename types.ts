
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

export type UserRole = 'guest' | 'voter' | 'volunteer' | 'developer' | 'superadmin' | 'representative';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  plan?: 'free' | 'pro' | 'enterprise'; // For developers
  apiKey?: string; // For developers
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  type: 'update' | 'achievement' | 'event' | 'response';
  likes: number;
}

// New Types for Complaints & Games
export type ComplaintStatus = 'pending' | 'investigating' | 'resolved' | 'dismissed';

export interface PublicComplaint {
    id: string;
    politicianId: number;
    userId: string;
    userName: string;
    category: 'Civic' | 'Corruption' | 'Conduct' | 'Promise Broken';
    description: string;
    location: string;
    evidenceUrl?: string; // Photo/Video URL
    upvotes: number;
    status: ComplaintStatus;
    filedAt: string;
    proofOfWork?: string; // URL or text response from politician
}

export interface SatiricalGame {
    id: string;
    title: string;
    description: string;
    targetPoliticianId?: number;
    thumbnailUrl: string;
    playUrl: string; // Could be a route or external link
    plays: number;
    rating: number;
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
  designation?: string;
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
  role?: 'elected' | 'candidate';
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
  announcements?: Announcement[];
  complaintStats?: {
      total: number;
      resolved: number;
      pending: number;
  };
}

export interface ClaimRequest {
  id: string;
  politicianId: number;
  politicianName: string;
  email: string;
  phone: string;
  designation: string;
  documentUrl: string; // Mock URL
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
}

export interface Volunteer {
  id: number;
  name: string;
  rank: number;
  rtisFiled: number;
  points: number;
  state: string;
}

export type RTIStatus = 'generated' | 'claimed' | 'filed' | 'response_received' | 'verified' | 'rejected';

export interface RTITask {
  id: string;
  politicianId: number;
  politicianName: string;
  topic: string;
  description: string; // Detailed reasoning (e.g., "Asset spike of 200% detected")
  priority: 'high' | 'medium' | 'low';
  status: RTIStatus;
  
  // Lifecycle fields
  generatedDate: string;
  deadline: string;
  claimedBy?: string; // Volunteer Name
  filedDate?: string;
  responseDate?: string;
  
  // Attachments (Simulated URLs)
  proofOfFilingUrl?: string;
  governmentResponseUrl?: string;

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

export interface Grievance {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'open' | 'resolved';
  date: string;
}

export interface DeveloperPricing {
  monthly: number;
  yearly: number;
  currency: string;
}

export interface PaymentGatewayConfig {
  provider: 'razorpay' | 'payu' | 'cashfree' | 'paypal';
  enabled: boolean;
  apiKey: string;
  apiSecret: string;
  webhookSecret?: string;
  mode: 'sandbox' | 'live';
}

// --- ADVANCED CONFIGURATION TYPES ---

export interface AIProviderConfig {
    id: string;
    name: string; // e.g., 'OpenRouter', 'Gemini', 'Anthropic', 'Local'
    baseUrl: string;
    apiKey: string;
    enabled: boolean;
    priority: number; // 1 is highest priority
    models: string[]; // List of supported model IDs
}

export interface DatabaseConfig {
    type: 'postgres' | 'pinecone' | 'redis' | 'supabase';
    name: string;
    connectionString: string; // or URL
    apiKey?: string;
    enabled: boolean;
    status: 'connected' | 'disconnected' | 'error';
}

export interface TranslationConfig {
    provider: 'google' | 'azure' | 'deepl' | 'none';
    apiKey: string;
    autoDetect: boolean;
}

export interface SystemSettings {
    general: {
        siteName: string;
        maintenanceMode: boolean;
        allowSignups: boolean;
        supportEmail: string;
        systemVersion: string;
        timezone: string;
        translation: TranslationConfig;
    };
    ai: {
        failoverEnabled: boolean; // If true, switches provider on error
        defaultProviderId: string;
        providers: AIProviderConfig[];
        systemPrompt: string; // Global override
        safetyFilterLevel: 'low' | 'medium' | 'high';
        temperature: number;
        maxTokens: number;
        topP: number;
        topK: number;
    };
    data: {
        databases: DatabaseConfig[];
        backupFrequency: 'daily' | 'weekly' | 'off';
        retentionDays: number; // Days to keep logs
        storageQuota: number; // In GB
        encryptionEnabled: boolean;
        lastBackup?: string;
    };
    features: {
        // Core Modules
        enableNyayFauj: boolean;
        enableOpenData: boolean;
        enableDeveloperAPI: boolean;
        
        // AI & Intelligence
        enableLiveVoice: boolean;
        enableComparison: boolean;
        enableAdvancedAnalytics: boolean;
        
        // System & Access
        enableGuestBrowsing: boolean;
        enableBetaFeatures: boolean;
        enableMaintenanceAlert: boolean;
    };
    security: {
        apiRateLimit: number; // Requests per minute
        requireEmailVerification: boolean;
        adminIpWhitelist: string[];
        sessionTimeout: number; // Minutes
    };
    billing: DeveloperPricing;
    seo?: {
        defaultTitle?: string;
        defaultDescription?: string;
        defaultOgImage?: string;
        allowIndexing?: boolean;
    };
    gateways: PaymentGatewayConfig[];
}

export interface AdminNotification {
    id: string;
    type: 'info' | 'alert' | 'success';
    message: string;
    timestamp: string;
    read: boolean;
    link?: string;
}

export interface Language {
    code: string;
    name: string;
    nativeName: string;
}

// --- ELECTION & BLOCKCHAIN ---

export interface VoteTransaction {
    hash: string;
    timestamp: string;
    constituency: string;
    type: 'upvote' | 'downvote';
    blockHeight: number;
}
