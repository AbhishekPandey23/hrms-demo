'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Users, CheckCircle, XCircle, Building2, Clock } from 'lucide-react';
import { RecentAttendanceTable } from '@/src/features/attendance/components/recent-attendance-table';
import { Skeleton } from '@/components/ui/skeleton';
import { fetchClient } from '@/src/lib/api-client';

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    presentToday: 0,
    absentToday: 0,
    totalDepartments: 0,
    notMarkedAttendance: 0,
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        setIsLoading(true);
        const data = await fetchClient<any>('/api/dashboard/stats', 'GET');
        setStats({
          totalEmployees: data.total_employees,
          presentToday: data.present_today,
          absentToday: data.absent_today,
          totalDepartments: data.total_departments,
          notMarkedAttendance:
            data.total_employees - (data.present_today + data.absent_today),
        });
      } catch (error) {
        console.error('Failed to load stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, []);

  const metrics = [
    {
      title: 'Total Employees',
      value: stats.totalEmployees,
      icon: Users,
      color: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300',
    },
    {
      title: 'Present Today',
      value: stats.presentToday,
      icon: CheckCircle,
      color:
        'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300',
    },
    {
      title: 'Absent Today',
      value: stats.absentToday,
      icon: XCircle,
      color: 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300',
    },
    {
      title: 'Not Marked Attendance',
      value: stats.notMarkedAttendance,
      icon: Clock,
      color:
        'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-300',
    },
    {
      title: 'Total Departments',
      value: stats.totalDepartments,
      icon: Building2,
      color:
        'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300',
    },
  ];

  return (
    <div className="flex-1 p-4 sm:p-6 md:p-8 pt-20 md:pt-0">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1 sm:mb-2">
            Dashboard
          </h1>
          <p className="text-sm sm:text-base text-foreground/60">
            Welcome back! Here's your HR overview.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <Card key={metric.title} className="overflow-hidden">
                <div className="p-4 sm:p-5 lg:p-6">
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <h3 className="text-xs sm:text-sm font-medium text-foreground/60 truncate">
                      {metric.title}
                    </h3>
                    <div
                      className={`p-1.5 sm:p-2 rounded-lg flex-shrink-0 ${metric.color}`}
                    >
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                  </div>
                  {isLoading ?
                    <Skeleton className="h-8 w-20" />
                  : <div className="text-2xl sm:text-3xl font-bold text-foreground">
                      {metric.value}
                    </div>
                  }
                </div>
              </Card>
            );
          })}
        </div>

        {/* Recent Attendance */}
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-foreground mb-3 sm:mb-4">
            Employees Not Marked Today
          </h2>
          <RecentAttendanceTable isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}
