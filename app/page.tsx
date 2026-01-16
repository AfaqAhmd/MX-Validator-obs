'use client';

import { useState } from 'react';
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
import { Download } from 'lucide-react';
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

  return (
    <div className="container mx-auto p-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">MX Validator</h1>
        <p className="text-gray-600">
          Upload a CSV file with email and domain columns to automatically scan MX records
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
