'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Eye, Trash2, Plus, Search, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { AddEmployeeModal } from './add-employee-modal';
import { DeleteConfirmDialog } from './delete-confirm-dialog';
import { fetchClient } from '@/src/lib/api-client';

interface Employee {
  id: string;
  email: string;
  full_name: string;
  employee_id: string;
  department: string;
  created_at: string;
}

// Map backend names to UI naming conventions if different
const adaptEmployee = (emp: Employee) => ({
  ...emp,
  id: emp.id,
  employeeId: emp.employee_id,
  fullName: emp.full_name,
  department: emp.department,
});

export function EmployeesTable() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Fetch employees from API
  const loadEmployees = async () => {
    try {
      setLoading(true);
      const data = await fetchClient<Employee[]>('/api/employees/', 'GET');
      setEmployees(data.map(adaptEmployee));
    } catch (error) {
      toast.error('Failed to load employees');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const handleAddEmployee = async (data: any) => {
    try {
      await fetchClient('/api/employees/', 'POST', {
        employee_id:
          data.employeeId || `EMP${Math.floor(Math.random() * 1000)}`,
        full_name: data.fullName,
        email: data.email,
        department: data.department,
      });

      toast.success('Success', { description: 'Employee added successfully' });
      setIsAddModalOpen(false);
      loadEmployees();
    } catch (error: any) {
      toast.error('Error', {
        description: error.message || 'Failed to add employee',
      });
    }
  };

  const handleDeleteEmployee = async (id: string) => {
    try {
      await fetchClient(`/api/employees/${id}`, 'DELETE');
      setEmployees(employees.filter((emp) => emp.id !== id));
      setDeleteId(null);
      toast.success('Success', {
        description: 'Employee deleted successfully',
      });
    } catch (error: any) {
      toast.error('Error', { description: 'Failed to delete' });
    }
  };

  // Filter logic
  const filteredEmployees = employees.filter((employee) => {
    return (
      employee.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
              Employees
            </h1>
            <p className="text-sm sm:text-base text-foreground/60">
              Manage your employee database
            </p>
          </div>
          <Button onClick={() => loadEmployees()} variant="outline" size="sm">
            Refresh
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-4 mb-6 sm:grid-cols-2 md:grid-cols-4 md:gap-4">
          <div className="md:col-span-3 relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-foreground/40" />
            <Input
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-full"
            />
          </div>

          <Button onClick={() => setIsAddModalOpen(true)} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Add Employee
          </Button>
        </div>

        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            {loading ?
              <div className="p-8 text-center flex flex-col items-center justify-center text-foreground/60">
                <Loader2 className="h-8 w-8 animate-spin mb-2" />
                <p>Loading employees...</p>
              </div>
            : <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-4 py-3 text-left font-semibold text-foreground">
                      ID
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-foreground">
                      Name
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-foreground hidden md:table-cell">
                      Email
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.length > 0 ?
                    filteredEmployees.map((employee) => (
                      <tr
                        key={employee.id}
                        className="border-b border-border hover:bg-muted/30 transition-colors"
                      >
                        <td className="px-4 py-3 text-foreground">
                          {employee.employeeId}
                        </td>
                        <td className="px-4 py-3 text-foreground font-medium">
                          {employee.fullName}
                        </td>
                        <td className="px-4 py-3 text-foreground/60 hidden md:table-cell">
                          {employee.email}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <Link href={`/employees/${employee.id}/attendance`}>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0 hover:bg-primary/10"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </Link>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 hover:bg-destructive/10 text-destructive"
                              onClick={() => setDeleteId(employee.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  : <tr>
                      <td
                        colSpan={4}
                        className="px-4 py-8 text-center text-foreground/60"
                      >
                        No employees found.
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            }
          </div>
        </Card>
      </div>

      <AddEmployeeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddEmployee={handleAddEmployee}
      />

      <DeleteConfirmDialog
        isOpen={deleteId !== null}
        title="Delete Employee"
        description="Are you sure you want to delete this employee?"
        onConfirm={() => deleteId && handleDeleteEmployee(deleteId)}
        onClose={() => setDeleteId(null)}
      />
    </div>
  );
}
