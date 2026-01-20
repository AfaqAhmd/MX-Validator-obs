'use client';

import { useState, useEffect } from 'react';
import UploadForm from '@/components/upload-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Download, AlertCircle } from 'lucide-react';
import ResultsChart from '@/components/results-chart';

interface EmailRecord {
  id: number;
  email: string;
  domain: string;
  mxRecords: string[] | null;
  mxScanStatus: 'pending' | 'completed' | 'failed';
  createdAt: string;
}

type ViewMode = 'analytics' | 'table';

export default function Home() {
  const [records, setRecords] = useState<EmailRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('analytics');

  // Access gate state
  const [hasAccess, setHasAccess] = useState(false);
  const [gateName, setGateName] = useState('');
  const [gateCompany, setGateCompany] = useState('');
  const [gateEmail, setGateEmail] = useState('');
  const [gateSubmitting, setGateSubmitting] = useState(false);
  const [gateError, setGateError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);

  // Check if user is verified on mount
  useEffect(() => {
    // Check localStorage for verified status
    const verified = localStorage.getItem('mx_validator_verified');
    if (verified === 'true') {
      setHasAccess(true);
    }

    // Check URL params for verification success
    const params = new URLSearchParams(window.location.search);
    if (params.get('verified') === 'true') {
      localStorage.setItem('mx_validator_verified', 'true');
      setHasAccess(true);
      // Clean URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const fetchRecords = async (session: string) => {
    if (!session) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/records/${session}`);
      if (response.ok) {
        const data = await response.json();
        setRecords(data);
      }
    } catch (error) {
      console.error('Error fetching records:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSuccess = (newSessionId: string) => {
    setSessionId(newSessionId);
    fetchRecords(newSessionId);
  };

  const downloadCSV = () => {
    if (records.length === 0) return;

    // Convert records to CSV format
    const headers = ['Email', 'Domain', 'MX Records', 'Status', 'Created At'];
    const csvRows = [
      headers.join(','),
      ...records.map((record) => {
        const mxRecords = record.mxRecords && record.mxRecords.length > 0
          ? record.mxRecords.join('; ')
          : '';
        const email = `"${record.email.replace(/"/g, '""')}"`;
        const domain = `"${record.domain.replace(/"/g, '""')}"`;
        const mx = `"${mxRecords.replace(/"/g, '""')}"`;
        const status = `"${record.mxScanStatus}"`;
        const createdAt = `"${new Date(record.createdAt).toLocaleString()}"`;
        return [email, domain, mx, status, createdAt].join(',');
      }),
    ];

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `mx-scan-results-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600';
      case 'failed':
        return 'text-red-600';
      case 'pending':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  const handleAccessSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setGateError(null);

    if (!gateName.trim() || !gateCompany.trim() || !gateEmail.trim()) {
      setGateError('Please fill in all fields.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(gateEmail.trim())) {
      setGateError('Please enter a valid email address.');
      return;
    }

    setGateSubmitting(true);
    try {
      const response = await fetch('/api/access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: gateName.trim(),
          company: gateCompany.trim(),
          email: gateEmail.trim(),
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        setGateError(data?.error || 'Failed to send verification email. Please try again.');
        return;
      }

      // If email is already verified, grant access immediately
      if (data?.alreadyVerified) {
        localStorage.setItem('mx_validator_verified', 'true');
        setHasAccess(true);
        return;
      }

      // Email sent successfully, show \"check your email\" screen
      setEmailSent(true);
    } catch (error) {
      console.error('Access gate error:', error);
      setGateError('Something went wrong. Please try again.');
    } finally {
      setGateSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-8 max-w-7xl relative">
      {/* Access gate overlay */}
      {!hasAccess && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl bg-card border border-white/20 p-6 shadow-2xl">
            {!emailSent ? (
              <>
                <h2 className="text-2xl font-bold text-white text-center mb-2">Get Access to MX Validator</h2>
                <p className="text-sm text-white/70 text-center mb-4">
                  Enter your details and verify your email to start scanning MX records.
                </p>

                <form onSubmit={handleAccessSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-white/90" htmlFor="gate-name">
                      Name
                    </label>
                    <Input
                      id="gate-name"
                      placeholder="Your full name"
                      value={gateName}
                      onChange={(e) => setGateName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-white/90" htmlFor="gate-company">
                      Company name
                    </label>
                    <Input
                      id="gate-company"
                      placeholder="Your company"
                      value={gateCompany}
                      onChange={(e) => setGateCompany(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-white/90" htmlFor="gate-email">
                      Work email
                    </label>
                    <Input
                      id="gate-email"
                      type="email"
                      placeholder="you@company.com"
                      value={gateEmail}
                      onChange={(e) => setGateEmail(e.target.value)}
                      required
                    />
                  </div>

                  {gateError && (
                    <div className="flex items-start gap-2 rounded-md border border-red-500/60 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                      <AlertCircle className="h-4 w-4 mt-0.5" />
                      <p>{gateError}</p>
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={gateSubmitting}
                  >
                    {gateSubmitting ? 'Sending verification email...' : 'Send Verification Email'}
                  </Button>

                  <p className="text-[11px] text-center text-white/50 mt-1">
                    We only use this information to provide insights and improve your MX validation experience.
                  </p>
                </form>
              </>
            ) : (
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-white">Check Your Email</h2>
                <p className="text-sm text-white/70">
                  We've sent a verification link to <span className="font-semibold text-white">{gateEmail}</span>
                </p>
                <p className="text-xs text-white/60">
                  Click the link in the email to verify your account and access MX Validator.
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setEmailSent(false);
                    setGateError(null);
                  }}
                  className="mt-4"
                >
                  Use Different Email
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
      <div className="mb-10 flex flex-col items-center text-center">
        <h1 className="text-4xl md:text-5xl lg:text-9xl font-extrabold tracking-tight text-white drop-shadow-sm mb-4">
          MX Validator
        </h1>
        <p className="max-w-2xl text-sm md:text-base text-white/80">
          Upload your lead list and instantly verify which email domains have valid MX records.
          Stop wasting time on undeliverable emails.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <div className="md:col-span-2 lg:col-span-3">
          <UploadForm onUploadSuccess={handleUploadSuccess} />
        </div>

        {records.length > 0 && (
          <div className="md:col-span-2 lg:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Scan Results</CardTitle>
                    <CardDescription>
                      View analytics or detailed data table for your scan results
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setViewMode('analytics')}
                      variant={viewMode === 'analytics' ? 'default' : 'outline'}
                      size="sm"
                    >
                      Analytics
                    </Button>
                    <Button
                      onClick={() => setViewMode('table')}
                      variant={viewMode === 'table' ? 'default' : 'outline'}
                      size="sm"
                    >
                      Data Table
                    </Button>
                    {records.length > 0 && (
                      <Button onClick={downloadCSV} variant="outline" size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        Download CSV
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8 text-gray-500">Loading records...</div>
                ) : viewMode === 'analytics' ? (
                  <ResultsChart records={records} />
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Email</TableHead>
                          <TableHead>Domain</TableHead>
                          <TableHead>MX Records</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Created At</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {records.map((record) => (
                          <TableRow key={record.id}>
                            <TableCell className="font-medium">{record.email}</TableCell>
                            <TableCell>{record.domain}</TableCell>
                            <TableCell>
                              {record.mxRecords && record.mxRecords.length > 0 ? (
                                <ul className="list-disc list-inside space-y-1">
                                  {record.mxRecords.map((mx, idx) => (
                                    <li key={idx} className="text-sm">
                                      {mx}
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <span className={getStatusColor(record.mxScanStatus)}>
                                {record.mxScanStatus}
                              </span>
                            </TableCell>
                            <TableCell>
                              {new Date(record.createdAt).toLocaleString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {records.length === 0 && !loading && (
          <div className="md:col-span-2 lg:col-span-3">
            <Card>
              <CardContent className="text-center py-8 text-gray-500">
                No records to display. Upload a CSV file to see scan results.
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
