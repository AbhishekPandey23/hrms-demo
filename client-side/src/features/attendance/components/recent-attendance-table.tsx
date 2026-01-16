'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

import { useState, useEffect } from 'react';
import { fetchClient } from '@/src/lib/api-client';

interface Employee {
  id: string;
  employee_id: string;
  full_name: string;
  email: string;
  department: string;
}

export function RecentAttendanceTable({
  isLoading: parentLoading,
}: {
  isLoading: boolean;
}) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRecords = async () => {
      try {
        setLoading(true);
        const data = await fetchClient<Employee[]>(
          '/api/dashboard/not-marked',
          'GET',
        );
        setEmployees(data || []);
      } catch (error) {
        console.error('Failed to load not marked employees:', error);
      } finally {
        setLoading(false);
      }
    };
    loadRecords();
  }, []);

  const isLoading = parentLoading || loading;

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted border-b border-border">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                Employee Name
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                Employee ID
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                Department
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ?
              Array.from({ length: 5 }).map((_, i) => (
                <tr
                  key={i}
                  className="border-b border-border hover:bg-muted/50"
                >
                  <td className="px-6 py-4">
                    <Skeleton className="h-4 w-32" />
                  </td>
                  <td className="px-6 py-4">
                    <Skeleton className="h-4 w-20" />
                  </td>
                  <td className="px-6 py-4">
                    <Skeleton className="h-4 w-24" />
                  </td>
                  <td className="px-6 py-4">
                    <Skeleton className="h-4 w-20" />
                  </td>
                </tr>
              ))
            : employees.length === 0 ?
              <tr>
                <td
                  colSpan={4}
                  className="px-6 py-8 text-center text-foreground/60"
                >
                  All employees have marked attendance today! 🎉
                </td>
              </tr>
            : employees.map((emp) => (
                <tr
                  key={emp.id}
                  className="border-b border-border hover:bg-muted/50 transition-colors"
                >
                  <td className="px-6 py-4 text-sm font-medium text-foreground">
                    {emp.full_name}
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground/60">
                    {emp.employee_id}
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground/60">
                    <Badge variant="outline">{emp.department}</Badge>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="secondary" className="text-xs">
                      Not Marked
                    </Badge>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
    </Card>
  );
}
