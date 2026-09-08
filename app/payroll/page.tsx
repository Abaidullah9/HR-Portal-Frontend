'use client';

import { useEffect, useMemo } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { SectionHeader } from '@/components/common/section-header';
import { StatCard } from '@/components/common/stat-card';
import { Badge } from '@/components/common/badge';
import { DataTable } from '@/components/common/data-table';
import { Button } from '@/components/ui/button';
import { DollarSign, TrendingUp, CheckCircle } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/lib/redux/store';
import { fetchPayroll, updatePayrollStatus } from '@/lib/redux/slices/payrollSlice';
import { EmployeePayroll } from '@/types/payroll';

export default function PayrollPage() {
  const dispatch = useAppDispatch();
  const { records, loading, error } = useAppSelector((state) => state.payroll);

  useEffect(() => {
    dispatch(fetchPayroll());
  }, [dispatch]);

  // Compute live payroll stats
  const stats = useMemo(() => {
    const totalPayroll = records.reduce((sum, r) => sum + (r.netPay || r.baseSalary || 0), 0);
    const completedCount = records.filter((r) => r.status === 'completed').length;
    const completionRate = records.length > 0 ? ((completedCount / records.length) * 100).toFixed(0) : '100';

    return [
      {
        title: 'Total Net Payroll',
        value: `$${totalPayroll.toLocaleString()}`,
        icon: DollarSign,
        trend: { direction: 'up' as const, percentage: 5 },
      },
      {
        title: 'Active Records',
        value: records.length.toString(),
        icon: TrendingUp,
        trend: { direction: 'up' as const, percentage: 2 },
      },
      {
        title: 'Processed Rate',
        value: `${completionRate}%`,
        icon: CheckCircle,
        trend: { direction: 'up' as const, percentage: 1 },
      },
    ];
  }, [records]);

  const handleMarkCompleted = async (id: string) => {
    await dispatch(updatePayrollStatus({ id, status: 'completed' }));
  };

  const getStatusBadge = (status: string) => {
    if (status === 'completed') return <Badge variant="success">Completed</Badge>;
    if (status === 'failed') return <Badge variant="destructive">Failed</Badge>;
    return <Badge variant="warning">Pending</Badge>;
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '--';
    try {
      return new Date(dateStr).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <AppLayout>
      <div className="space-y-8">
        <SectionHeader
          title="Payroll Management"
          description="Manage salaries, allowances, deductions, and payment statuses"
        />

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.map((stat) => (
            <StatCard
              key={stat.title}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              trend={stat.trend}
            />
          ))}
        </div>

        {/* Payroll Table */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          {loading && records.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">Loading payroll records...</div>
          ) : records.length > 0 ? (
            <DataTable<EmployeePayroll>
              columns={[
                {
                  header: 'Employee',
                  accessor: 'employeeId',
                  render: (emp) =>
                    typeof emp === 'object' && emp !== null ? emp.name : 'Diana Employee',
                },
                {
                  header: 'Base Salary',
                  accessor: 'baseSalary',
                  render: (val) => `$${Number(val).toLocaleString()}`,
                },
                {
                  header: 'Net Pay',
                  accessor: 'netPay',
                  render: (val) => <span className="font-semibold text-foreground">${Number(val).toLocaleString()}</span>,
                },
                {
                  header: 'Period Start',
                  accessor: 'payPeriodStart',
                  render: (date) => formatDate(date),
                  className: 'text-muted-foreground text-sm',
                },
                {
                  header: 'Payment Method',
                  accessor: 'paymentMethod',
                  render: (m) => <span className="capitalize">{m}</span>,
                },
                {
                  header: 'Status',
                  accessor: 'status',
                  render: (status) => getStatusBadge(status),
                },
                {
                  header: 'Actions',
                  accessor: '_id',
                  render: (id, row) => (
                    row.status === 'pending' ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleMarkCompleted(id as string)}
                        className="text-xs"
                      >
                        Mark Paid
                      </Button>
                    ) : null
                  ),
                  className: 'text-right',
                },
              ]}
              data={records}
            />
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              No payroll records found.
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
