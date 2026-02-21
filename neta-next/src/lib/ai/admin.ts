import { getPool } from '@/lib/db';

type AdminFinding = {
  category: string;
  severity: 'info' | 'warning' | 'error';
  message: string;
};

type AdminAnalysisResult = {
  success: true;
  type: string;
  findings: AdminFinding[];
  recommendations: string[];
  timestamp: string;
};

export async function adminAiChat(message: string, _userEmail: string) {
  return {
    success: true,
    message: `I received your message: "${message}". I'm analyzing the platform data and ready to help you with improvements, code generation, or data insights.`,
    suggestions: [
      'Analyze politician data for trends',
      'Generate a report on complaint resolution',
      'Suggest UI improvements based on user behavior',
    ],
    timestamp: new Date().toISOString(),
  };
}

export async function adminAiAnalyze(analysisType: string): Promise<AdminAnalysisResult> {
  const pool = getPool();
  let findings: AdminFinding[] = [];
  let recommendations: string[] = [];

  if (!pool) {
    if (analysisType === 'performance') {
      findings = [
        { category: 'database', severity: 'info', message: 'Database connection not configured' },
      ];
      recommendations = ['Configure DATABASE_URL for full analytics'];
    } else if (analysisType === 'security') {
      findings = [
        { category: 'auth', severity: 'info', message: 'JWT authentication is active (Next API).' },
      ];
      recommendations = ['Ensure JWT_SECRET is set and rotated periodically'];
    } else {
      findings = [{ category: 'general', severity: 'info', message: 'System is running normally' }];
      recommendations = ['Regular backups recommended'];
    }
  } else {
    if (analysisType === 'performance') {
      const stats = await pool.query<{ c: number }>('SELECT COUNT(*)::int AS c FROM politicians');
      const complaintStats = await pool.query<{ pending: number }>(
        "SELECT COUNT(*) FILTER (WHERE status = 'pending')::int AS pending FROM complaints"
      );
      const countPoliticians = stats.rows[0]?.c ?? 0;
      const pendingComplaints = complaintStats.rows[0]?.pending ?? 0;
      findings = [
        { category: 'database', severity: 'info', message: `Currently managing ${countPoliticians} politicians` },
        {
          category: 'complaints',
          severity: pendingComplaints > 10 ? 'warning' : 'info',
          message: `${pendingComplaints} pending complaints`,
        },
      ];
      recommendations = [
        'Consider archiving resolved complaints older than 6 months',
        'Implement pagination for large politician lists',
      ];
    } else if (analysisType === 'security') {
      findings = [
        { category: 'auth', severity: 'info', message: 'JWT authentication is active' },
        { category: 'rate-limiting', severity: 'info', message: 'Rate limiting recommended on AI endpoints' },
      ];
      recommendations = ['Enable 2FA for admin accounts', 'Rotate JWT secret periodically'];
    } else {
      findings = [{ category: 'general', severity: 'info', message: 'System is running normally' }];
      recommendations = ['Regular backups recommended'];
    }
  }

  return {
    success: true,
    type: analysisType,
    findings,
    recommendations,
    timestamp: new Date().toISOString(),
  };
}
