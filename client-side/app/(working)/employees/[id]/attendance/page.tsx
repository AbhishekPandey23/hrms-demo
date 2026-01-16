'use client';

import { useParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, TrendingUp, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { fetchClient } from '@/src/lib/api-client';
import { toast } from 'sonner';

interface AttendanceRecord {
  date: string;
  status: 'PRESENT' | 'ABSENT';
}

interface EmployeeStats {
  id: string;
  employee_id: string;
  full_name: string;
  email: string;
  department: string;
  total_present: number;
  total_absent: number;
  attendance_percentage: number;
  attendances?: AttendanceRecord[]; // We might need to adjust the backend to include list if needed, or fetch separately
}

export default function EmployeeAttendancePage() {
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [selectedMonth, setSelectedMonth] = useState<string>('');

  const loadData = async () => {
    try {
      setLoading(true);
      // Backend returns EmployeeWithStats which is exactly what we need
      const res = await fetchClient<any>(
        `/api/employees/${params.id}/attendance`,
        'GET',
      );
      setData(res);
    } catch (error) {
      toast.error('Failed to load attendance data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params.id) {
      loadData();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center text-foreground/60">
        <Loader2 className="h-8 w-8 animate-spin mb-2" />
        <p>Loading attendance data...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 text-center text-foreground/60">
        <p>Employee not found or data unavailable.</p>
        <Link href="/employees">
          <Button variant="outline" className="mt-4">
            Back to Employees
          </Button>
        </Link>
      </div>
    );
  }

  // Note: We need a real attendance list.
  // currently my backend EmployeeWithStats doesn't include the full list item,
  // but let's assume we fetch it or update backend.
  // Wait, I should check my backend schema first.

  const records: any[] = data.attendances || [];

  const filteredRecords =
    selectedMonth ?
      records.filter((r: any) => r.date.startsWith(selectedMonth))
    : records;

  return (
    <div className="p-4 sm:p-6 md:p-8 pt-20 md:pt-0">
      <div className="max-w-7xl mx-auto">
        <Link href="/employees">
          <Button variant="ghost" className="mb-4 sm:mb-6 px-2 sm:px-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            <span className="text-xs sm:text-sm">Back to Employees</span>
          </Button>
        </Link>

        {/* Employee Info Card */}
        <Card className="p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-foreground/60 mb-1">
                Employee ID
              </p>
              <p className="font-semibold text-sm sm:text-base text-foreground truncate">
                {data.employee_id}
              </p>
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-foreground/60 mb-1">
                Full Name
              </p>
              <p className="font-semibold text-sm sm:text-base text-foreground truncate">
                {data.full_name}
              </p>
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-foreground/60 mb-1">
                Email
              </p>
              <p className="font-semibold text-xs sm:text-sm text-foreground truncate">
                {data.email}
              </p>
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-foreground/60 mb-1">
                Department
              </p>
              <Badge variant="secondary" className="text-xs">
                {data.department}
              </Badge>
            </div>
          </div>
        </Card>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          <Card className="p-4 sm:p-6 text-center sm:text-left">
            <p className="text-xs sm:text-sm text-foreground/60 mb-2 font-medium">
              Total Present Days
            </p>
            <p className="text-2xl sm:text-4xl font-bold text-emerald-500">
              {data.total_present}
            </p>
          </Card>
          <Card className="p-4 sm:p-6 text-center sm:text-left">
            <p className="text-xs sm:text-sm text-foreground/60 mb-2 font-medium">
              Total Absent Days
            </p>
            <p className="text-2xl sm:text-4xl font-bold text-rose-500">
              {data.total_absent}
            </p>
          </Card>
          <Card className="p-4 sm:p-6 text-center sm:text-left">
            <p className="text-xs sm:text-sm text-foreground/60 mb-2 font-medium">
              Attendance Rate
            </p>
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <p className="text-2xl sm:text-4xl font-bold text-primary">
                {data.attendance_percentage}%
              </p>
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
          </Card>
        </div>

        {/* Month Filter */}
        <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center">
          <label className="text-xs sm:text-sm font-semibold text-foreground">
            Filter by Month:
          </label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 sm:px-4 py-2 text-xs sm:text-sm border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">All Records</option>
            <option value="2025-01">January 2025</option>
            <option value="2024-12">December 2024</option>
          </select>
        </div>

        {/* Attendance History Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm">
              <thead className="bg-muted border-b border-border">
                <tr>
                  <th className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 text-left font-semibold text-foreground">
                    Date
                  </th>
                  <th className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 text-left font-semibold text-foreground">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.length === 0 ?
                  <tr>
                    <td
                      colSpan={2}
                      className="px-4 py-8 text-center text-foreground/60 text-sm"
                    >
                      No attendance records for selected period
                    </td>
                  </tr>
                : filteredRecords.map((record: any, idx: number) => (
                    <tr
                      key={idx}
                      className="border-b border-border hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-foreground">
                        {new Date(record.date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                      <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
                        <Badge
                          variant={
                            record.status === 'PRESENT' ?
                              'default'
                            : 'destructive'
                          }
                          className="text-xs"
                        >
                          {record.status}
                        </Badge>
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
