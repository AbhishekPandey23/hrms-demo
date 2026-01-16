'use client';
import { useState, useMemo, useEffect } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
  type ColumnDef,
} from '@tanstack/react-table';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { fetchClient } from '@/src/lib/api-client';

interface AttendanceRecord {
  id: string;
  attendanceId?: string;
  employeeId: string;
  employeeName: string;
  date: string;
  status: 'Present' | 'Absent' | 'Not Marked';
}

interface Employee {
  id: string;
  employee_id: string;
  full_name: string;
  email: string;
  department: string;
}

interface AttendanceAPIRecord {
  id: string;
  employee_id: string;
  date: string;
  status: 'PRESENT' | 'ABSENT';
  employee?: Employee;
}

export default function AttendancePage() {
  const todayDate = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayDate);
  const [isMarkingAttendance, setIsMarkingAttendance] = useState<string | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [attendanceRecords, setAttendanceRecords] = useState<
    AttendanceRecord[]
  >([]);
  const [globalFilter, setGlobalFilter] = useState('');

  const isToday = selectedDate === todayDate;
  const selectedDateObj = new Date(selectedDate);
  const formattedDate = selectedDateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  // Fetch employees and their attendance for the selected date
  const loadAttendanceData = async () => {
    try {
      setLoading(true);

      // Fetch all employees
      const employees = await fetchClient<Employee[]>('/api/employees/', 'GET');

      // Fetch attendance for the selected date
      const attendanceData = await fetchClient<AttendanceAPIRecord[]>(
        `/api/attendance/?date=${selectedDate}`,
        'GET',
      );

      // Create a map of employee_id to attendance record
      const attendanceMap = new Map<string, AttendanceAPIRecord>();
      attendanceData.forEach((att) => {
        attendanceMap.set(att.employee_id, att);
      });

      // Combine employees with their attendance status
      const records: AttendanceRecord[] = employees.map((emp) => {
        const attendance = attendanceMap.get(emp.id);
        let status: 'Present' | 'Absent' | 'Not Marked' = 'Not Marked';

        if (attendance) {
          status = attendance.status === 'PRESENT' ? 'Present' : 'Absent';
        }

        return {
          id: emp.id,
          attendanceId: attendance?.id,
          employeeId: emp.employee_id,
          employeeName: emp.full_name,
          date: formattedDate,
          status,
        };
      });

      setAttendanceRecords(records);
    } catch (error) {
      console.error('Failed to load attendance data:', error);
      toast.error('Failed to load attendance data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttendanceData();
  }, [selectedDate]);

  const columnHelper = createColumnHelper<AttendanceRecord>();

  const columns: ColumnDef<AttendanceRecord, any>[] = useMemo(
    () => [
      columnHelper.accessor('employeeName', {
        cell: (info) => (
          <span className="font-medium text-foreground text-xs sm:text-sm">
            {info.getValue()}
          </span>
        ),
        header: 'Employee Name',
      }),
      columnHelper.accessor('employeeId', {
        cell: (info) => (
          <span className="text-foreground/60 text-xs sm:text-sm">
            {info.getValue()}
          </span>
        ),
        header: 'Employee ID',
      }),
      columnHelper.accessor('date', {
        cell: (info) => (
          <span className="text-foreground/60 text-xs sm:text-sm hidden sm:inline">
            {formattedDate}
          </span>
        ),
        header: 'Date',
      }),
      columnHelper.accessor('status', {
        cell: (info) => {
          const status = info.getValue();
          let variant: 'default' | 'destructive' | 'outline' = 'default';

          if (status === 'Present') {
            variant = 'default';
          } else if (status === 'Absent') {
            variant = 'destructive';
          } else {
            variant = 'outline';
          }

          return (
            <Badge variant={variant} className="text-xs sm:text-sm">
              {status}
            </Badge>
          );
        },
        header: 'Status',
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Actions',
        cell: (props) => {
          const record = props.row.original;

          if (!isToday) {
            return (
              <span className="text-xs sm:text-sm text-foreground/60 italic">
                {record.status === 'Not Marked' ?
                  'Past date'
                : 'Already marked'}
              </span>
            );
          }

          const isLoading = isMarkingAttendance === record.id;

          return (
            <div className="flex gap-1 sm:gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleMarkAttendance(record, 'Present')}
                disabled={record.status === 'Present' || isLoading}
                className={`text-xs sm:text-sm ${record.status === 'Present' ? 'opacity-50' : ''}`}
              >
                {isLoading ?
                  <Loader2 className="w-3 h-3 animate-spin" />
                : 'Present'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleMarkAttendance(record, 'Absent')}
                disabled={record.status === 'Absent' || isLoading}
                className={`text-xs sm:text-sm ${record.status === 'Absent' ? 'opacity-50' : ''}`}
              >
                {isLoading ?
                  <Loader2 className="w-3 h-3 animate-spin" />
                : 'Absent'}
              </Button>
            </div>
          );
        },
      }),
    ],
    [columnHelper, isToday, formattedDate, isMarkingAttendance],
  );

  const handleMarkAttendance = async (
    record: AttendanceRecord,
    newStatus: 'Present' | 'Absent',
  ) => {
    try {
      setIsMarkingAttendance(record.id);

      const apiStatus = newStatus === 'Present' ? 'PRESENT' : 'ABSENT';

      // Call the API to mark attendance
      await fetchClient('/api/attendance/', 'POST', {
        employee_id: record.id,
        date: selectedDate,
        status: apiStatus,
      });

      // Update local state
      setAttendanceRecords((prev) =>
        prev.map((r) => (r.id === record.id ? { ...r, status: newStatus } : r)),
      );

      toast.success('Success', {
        description: `${record.employeeName}'s attendance marked as ${newStatus}`,
      });
    } catch (error: any) {
      console.error('Failed to mark attendance:', error);
      toast.error('Error', {
        description: error.message || 'Failed to mark attendance',
      });
    } finally {
      setIsMarkingAttendance(null);
    }
  };

  const table = useReactTable({
    data: attendanceRecords,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  return (
    <div className="p-4 sm:p-6 md:p-8 pt-20 md:pt-0">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1 sm:mb-2">
          Attendance Management
        </h1>
        <p className="text-sm sm:text-base text-foreground/60 mb-6 sm:mb-8">
          Track and manage employee attendance
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-foreground mb-2">
              Select Date
            </label>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full"
            />
            {!isToday && (
              <p className="text-xs text-foreground/60 mt-2">
                Selected date is not today. Attendance is already marked.
              </p>
            )}
            {isToday && (
              <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                Today's date - Mark attendance for your team
              </p>
            )}
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-foreground mb-2">
              Search Employees
            </label>
            <Input
              placeholder="Search by name or ID..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="w-full"
            />
          </div>
        </div>

        {/* Tanstack Table */}
        <Card className="overflow-hidden mb-6">
          <div className="overflow-x-auto">
            {loading ?
              <div className="p-8 flex flex-col items-center justify-center text-foreground/60">
                <Loader2 className="h-8 w-8 animate-spin mb-2" />
                <p>Loading employees...</p>
              </div>
            : <table className="w-full text-xs sm:text-sm">
                <thead className="bg-muted border-b border-border">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-foreground whitespace-nowrap"
                        >
                          {header.isPlaceholder ? null : (
                            flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )
                          )}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody>
                  {table.getRowModel().rows.length === 0 ?
                    <tr>
                      <td
                        colSpan={columns.length}
                        className="px-4 py-8 text-center text-foreground/60"
                      >
                        No employees found
                      </td>
                    </tr>
                  : table.getRowModel().rows.map((row) => (
                      <tr
                        key={row.id}
                        className="border-b border-border hover:bg-muted/50 transition-colors"
                      >
                        {row.getVisibleCells().map((cell) => (
                          <td
                            key={cell.id}
                            className="px-2 sm:px-4 lg:px-6 py-2 sm:py-4"
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
                          </td>
                        ))}
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            }
          </div>
        </Card>

        {!loading && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <p className="text-xs sm:text-sm text-foreground/60">
              Showing{' '}
              {table.getFilteredRowModel().rows.length > 0 ?
                table.getState().pagination.pageIndex *
                  table.getState().pagination.pageSize +
                1
              : 0}{' '}
              to{' '}
              {Math.min(
                (table.getState().pagination.pageIndex + 1) *
                  table.getState().pagination.pageSize,
                table.getFilteredRowModel().rows.length,
              )}{' '}
              of {table.getFilteredRowModel().rows.length} employees
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline ml-1">Previous</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <span className="hidden sm:inline mr-1">Next</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
