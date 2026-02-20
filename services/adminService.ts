
import { Grievance, DeveloperPricing, PaymentGatewayConfig, SystemSettings, AIProviderConfig, DatabaseConfig, AdminNotification } from "../types";

const GRIEVANCE_KEY = 'neta_grievances';
const SETTINGS_KEY = 'neta_system_settings';

// --- NOTIFICATIONS ---

export const getNotifications = (): AdminNotification[] => {
    // Mock notifications for demo
    return [
        {
            id: '1',
            type: 'alert',
            message: 'High load detected on Vector Database (92% CPU).',
            timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
            read: false,
            link: '/superadmin/ai'
        },
        {
            id: '2',
            type: 'success',
            message: 'Daily RSS Sync completed successfully (128 items).',
            timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
            read: false,
            link: '/superadmin/scraper'
        },
        {
            id: '3',
            type: 'info',
            message: 'New volunteer "Rajesh" requested profile verification.',
            timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
            read: true,
            link: '/superadmin/volunteers'
        },
        {
            id: '4',
            type: 'alert',
            message: '5 Pending RTI Responses require manual review.',
            timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
            read: false,
            link: '/superadmin/rti'
        }
    ];
};

// --- GRIEVANCES ---

export const submitGrievance = (data: Omit<Grievance, 'id' | 'status' | 'date'>) => {
    const current = getGrievances();
    const newGrievance: Grievance = {
        ...data,
        id: Date.now().toString(),
        status: 'open',
        date: new Date().toISOString()
    };
    localStorage.setItem(GRIEVANCE_KEY, JSON.stringify([newGrievance, ...current]));
    return newGrievance;
};

export const getGrievances = (): Grievance[] => {
    try {
        const data = localStorage.getItem(GRIEVANCE_KEY);
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
};

export const resolveGrievance = (id: string) => {
    const current = getGrievances();
    const updated = current.map(g => g.id === id ? { ...g, status: 'resolved' as const } : g);
    localStorage.setItem(GRIEVANCE_KEY, JSON.stringify(updated));
    return updated;
};

// --- SYSTEM SETTINGS (Unified) ---

const DEFAULT_AI_PROVIDERS: AIProviderConfig[] = [
    {
        id: 'google-gemini',
        name: 'Google Gemini',
        baseUrl: 'https://generativelanguage.googleapis.com',
        apiKey: '', // User must provide via env or settings
        enabled: true,
        priority: 1,
        models: ['gemini-2.5-flash', 'gemini-3-pro-preview']
    },
    {
        id: 'openrouter',
        name: 'OpenRouter',
        baseUrl: 'https://openrouter.ai/api/v1',
        apiKey: '',
        enabled: false,
        priority: 2,
        models: ['anthropic/claude-3.5-sonnet', 'meta-llama/llama-3-70b-instruct']
    }
];

const DEFAULT_DATABASES: DatabaseConfig[] = [
    {
        type: 'supabase',
        name: 'Primary App DB',
        connectionString: '',
        apiKey: '',
        enabled: false,
        status: 'disconnected'
    },
    {
        type: 'pinecone',
        name: 'Vector Search',
        connectionString: '',
        apiKey: '',
        enabled: false,
        status: 'disconnected'
    }
];

const DEFAULT_SETTINGS: SystemSettings = {
    general: {
        siteName: 'Neta',
        maintenanceMode: false,
        allowSignups: true,
        supportEmail: 'help@neta.ink',
        systemVersion: '3.1.0',
        timezone: 'Asia/Kolkata',
        translation: {
            provider: 'google',
            apiKey: '',
            autoDetect: true
        }
    },
    ai: {
        failoverEnabled: true,
        defaultProviderId: 'google-gemini',
        providers: DEFAULT_AI_PROVIDERS,
        systemPrompt: "You are NetaAI, a neutral political analyst for India.",
        safetyFilterLevel: 'medium',
        temperature: 0.4,
        maxTokens: 4096,
        topP: 0.95,
        topK: 40
    },
    data: {
        databases: DEFAULT_DATABASES,
        backupFrequency: 'daily',
        retentionDays: 90,
        storageQuota: 5, // GB
        encryptionEnabled: true,
        lastBackup: new Date().toISOString()
    },
    features: {
        enableNyayFauj: true,
        enableLiveVoice: true,
        enableComparison: true,
        enableOpenData: true,
        enableDeveloperAPI: true,
        enableGuestBrowsing: true,
        enableAdvancedAnalytics: true,
        enableBetaFeatures: false,
        enableMaintenanceAlert: false
    },
    security: {
        apiRateLimit: 100,
        requireEmailVerification: false,
        adminIpWhitelist: [],
        sessionTimeout: 60
    },
    billing: {
        monthly: 4999,
        yearly: 49999,
        currency: '₹'
    },
    gateways: [
        { provider: 'razorpay', enabled: false, apiKey: '', apiSecret: '', mode: 'sandbox' },
        { provider: 'payu', enabled: false, apiKey: '', apiSecret: '', mode: 'sandbox' },
        { provider: 'cashfree', enabled: false, apiKey: '', apiSecret: '', mode: 'sandbox' },
        { provider: 'paypal', enabled: false, apiKey: '', apiSecret: '', mode: 'sandbox' },
    ]
};

export const getSystemSettings = (): SystemSettings => {
    try {
        const data = localStorage.getItem(SETTINGS_KEY);
        if (!data) return DEFAULT_SETTINGS;
        
        // Deep Merge logic to ensure new fields in updated schema are not undefined
        const parsed = JSON.parse(data);
        return {
            ...DEFAULT_SETTINGS,
            ...parsed,
            general: { 
                ...DEFAULT_SETTINGS.general, 
                ...parsed.general,
                translation: parsed.general?.translation || DEFAULT_SETTINGS.general.translation
            },
            ai: { 
                ...DEFAULT_SETTINGS.ai, 
                ...parsed.ai,
                providers: parsed.ai?.providers || DEFAULT_SETTINGS.ai.providers
            },
            data: {
                ...DEFAULT_SETTINGS.data,
                ...parsed.data,
                databases: parsed.data?.databases || DEFAULT_SETTINGS.data.databases
            },
            features: { ...DEFAULT_SETTINGS.features, ...parsed.features },
            security: { ...DEFAULT_SETTINGS.security, ...parsed.security },
            billing: { ...DEFAULT_SETTINGS.billing, ...parsed.billing },
            gateways: parsed.gateways || DEFAULT_SETTINGS.gateways
        };
    } catch {
        return DEFAULT_SETTINGS;
    }
};

export const saveSystemSettings = (settings: SystemSettings) => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
};

// Helpers
export const getDeveloperPricing = (): DeveloperPricing => getSystemSettings().billing;
export const getPaymentConfigs = (): PaymentGatewayConfig[] => getSystemSettings().gateways;
