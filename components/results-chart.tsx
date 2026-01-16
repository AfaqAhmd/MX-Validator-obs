'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell
} from 'recharts';
import { Mail, CheckCircle2, XCircle, Shield, AlertTriangle } from 'lucide-react';

interface EmailRecord {
  id: number;
  email: string;
  domain: string;
  mxRecords: string[] | null;
  mxScanStatus: 'pending' | 'completed' | 'failed';
  createdAt: string;
}

interface ResultsChartProps {
  records: EmailRecord[];
}

const COLORS = {
  deliverable: '#22c55e',
  undeliverable: '#ef4444',
  needsAttention: '#eab308',
  excellent: '#22c55e',
  fair: '#eab308',
  poor: '#ef4444',
};

// Helper function to detect email provider from MX records
const detectProvider = (mxRecords: string[] | null): string => {
  if (!mxRecords || mxRecords.length === 0) return 'Other';
  
  const mxString = mxRecords.join(' ').toLowerCase();
  
  if (mxString.includes('google') || mxString.includes('aspmx') || mxString.includes('gmail')) {
    return 'Google Workspace';
  }
  if (mxString.includes('outlook') || mxString.includes('office365') || mxString.includes('microsoft') || mxString.includes('exchange')) {
    return 'Microsoft 365';
  }
  if (mxString.includes('zoho')) {
    return 'Zoho';
  }
  
  return 'Other';
};

export default function ResultsChart({ records }: ResultsChartProps) {
  if (records.length === 0) {
    return null;
  }

  // Calculate summary metrics
  const totalEmails = records.length;
  const deliverable = records.filter(r => r.mxScanStatus === 'completed' && r.mxRecords && r.mxRecords.length > 0).length;
  const undeliverable = records.filter(r => r.mxScanStatus === 'failed' || !r.mxRecords || r.mxRecords.length === 0).length;
  const deliverabilityRate = totalEmails > 0 ? (deliverable / totalEmails) * 100 : 0;
  const withSecurityGateway = 0; // Placeholder - would need additional detection logic

  // Email Deliverability data
  const deliverabilityData = [
    { name: 'Deliverable', value: deliverable, color: COLORS.deliverable },
    { name: 'Undeliverable', value: undeliverable, color: COLORS.undeliverable },
  ];

  // List Quality Score (based on deliverability rate)
  const qualityScore = Math.round(deliverabilityRate);
  const qualityStatus = qualityScore >= 71 ? 'Excellent' : qualityScore >= 41 ? 'Fair' : 'Poor';
  const qualityColor = qualityScore >= 71 ? COLORS.excellent : qualityScore >= 41 ? COLORS.fair : COLORS.poor;

  // Top Domains by Lead Count
  const domainCounts = records.reduce((acc, record) => {
    acc[record.domain] = (acc[record.domain] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topDomains = Object.entries(domainCounts)
    .map(([domain, count]) => ({ domain, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)
    .map((item, idx) => ({
      ...item,
      domain: item.domain.length > 20 ? item.domain.substring(0, 17) + '...' : item.domain,
      color: idx % 2 === 0 ? '#3b82f6' : '#ef4444',
    }));

  // Security Gateway Distribution
  const securityGatewayData = [
    { name: 'No Gateway', value: totalEmails, color: '#6b7280' },
  ];

  // Email Provider Distribution
  const providerCounts = records.reduce((acc, record) => {
    const provider = detectProvider(record.mxRecords);
    acc[provider] = (acc[provider] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const providerData = Object.entries(providerCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  return (
    <div className="space-y-6 w-full">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card/50 border-white/20">
          <CardContent className="p-4 flex items-center gap-3">
            <Mail className="h-8 w-8 text-blue-400" />
            <div>
              <p className="text-sm text-muted-foreground">Total Emails</p>
              <p className="text-2xl font-bold text-white">{totalEmails}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-white/20">
          <CardContent className="p-4 flex items-center gap-3">
            <CheckCircle2 className="h-8 w-8 text-green-500" />
            <div>
              <p className="text-sm text-muted-foreground">Deliverable</p>
              <p className="text-2xl font-bold text-white">
                {deliverable} <span className="text-sm font-normal text-muted-foreground">{deliverabilityRate.toFixed(1)}%</span>
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-white/20">
          <CardContent className="p-4 flex items-center gap-3">
            <XCircle className="h-8 w-8 text-red-500" />
            <div>
              <p className="text-sm text-muted-foreground">Undeliverable</p>
              <p className="text-2xl font-bold text-white">{undeliverable}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-white/20">
          <CardContent className="p-4 flex items-center gap-3">
            <Shield className="h-8 w-8 text-purple-500" />
            <div>
              <p className="text-sm text-muted-foreground">With Security Gateway</p>
              <p className="text-2xl font-bold text-white">{withSecurityGateway}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row - Email Deliverability and List Quality Score */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Email Deliverability Donut Chart */}
        <Card className="bg-card/50 border-white/20">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-white text-lg">Email Deliverability</CardTitle>
            <CardDescription className="text-white/70 text-sm">
              Breakdown of your lead list quality
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={deliverabilityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {deliverabilityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Legend 
                  wrapperStyle={{ color: '#fff' }}
                  iconType="square"
                />
                <text
                  x="50%"
                  y="50%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  style={{ fontSize: '24px', fontWeight: 'bold', fill: '#fff' }}
                >
                  {deliverabilityRate.toFixed(1)}%
                </text>
              </PieChart>
            </ResponsiveContainer>
            <div className="text-center mt-4">
              <p className="text-lg font-semibold text-white">
                {deliverabilityRate.toFixed(1)}% Deliverability Rate
              </p>
            </div>
          </CardContent>
        </Card>

        {/* List Quality Score Gauge */}
        <Card className="bg-card/50 border-white/20">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-white text-lg">List Quality Score</CardTitle>
            <CardDescription className="text-white/70 text-sm">
              Overall health of your email list
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex flex-col items-center justify-center">
              {/* Semi-circular gauge visualization */}
              <div className="relative w-full max-w-xs h-40 mb-4">
                <svg viewBox="0 0 200 100" className="w-full h-full">
                  {/* Background arc */}
                  <path
                    d="M 20 80 A 80 80 0 0 1 180 80"
                    fill="none"
                    stroke="#374151"
                    strokeWidth="20"
                    strokeLinecap="round"
                  />
                  {/* Score arc */}
                  <path
                    d={`M 20 80 A 80 80 0 0 1 ${20 + (qualityScore / 100) * 160} ${80 - Math.sin((qualityScore / 100) * Math.PI) * 80}`}
                    fill="none"
                    stroke={qualityColor}
                    strokeWidth="20"
                    strokeLinecap="round"
                  />
                </svg>
                {/* Score text positioned below gauge */}
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 text-center">
                  <p className="text-5xl font-bold text-white mb-1">{qualityScore}</p>
                  <p className={`text-lg font-semibold ${qualityColor === COLORS.excellent ? 'text-green-500' : qualityColor === COLORS.fair ? 'text-yellow-500' : 'text-red-500'}`}>
                    {qualityScore} {qualityStatus}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 w-full max-w-md mt-6">
                <div className="bg-red-500/20 border border-red-500 rounded p-2 text-center">
                  <p className="text-xs text-red-400">0-40</p>
                  <p className="text-xs font-semibold text-white">Poor</p>
                </div>
                <div className="bg-yellow-500/20 border border-yellow-500 rounded p-2 text-center">
                  <p className="text-xs text-yellow-400">41-70</p>
                  <p className="text-xs font-semibold text-white">Fair</p>
                </div>
                <div className="bg-green-500/20 border border-green-500 rounded p-2 text-center">
                  <p className="text-xs text-green-400">71-100</p>
                  <p className="text-xs font-semibold text-white">Excellent</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
