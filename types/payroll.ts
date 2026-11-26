import type { PaginationMeta } from '@/lib/api/client';
import { Employee } from './employee';

export interface PayrollAllowance {
  type: string;
  amount: number;
  taxable: boolean;
}

export interface PayrollDeduction {
  type: string;
  amount: number;
  note?: string;
}

export interface PayrollBonus {
  type: string;
  amount: number;
  note?: string;
}

export interface EmployeePayroll {
  _id: string;
  employeeId: string | Employee;
  baseSalary: number;
  allowances: PayrollAllowance[];
  deductions: PayrollDeduction[];
  bonuses: PayrollBonus[];
  netPay: number;
  /** Issued when the record is paid; the human-readable PS-YYYYMM-NNNN number. */
  payslipNumber?: string;
  /** Present when a payroll run owns this record, which makes it read-only here. */
  payRunId?: string;
  payPeriodStart: string;
  payPeriodEnd: string;
  datePaid?: string;
  currency?: string;
  paymentMethod: 'bank transfer' | 'cheque' | 'cash';
  status: 'pending' | 'completed' | 'failed';
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePayrollPayload {
  employeeId: string;
  baseSalary: number;
  allowances?: PayrollAllowance[];
  deductions?: PayrollDeduction[];
  bonuses?: PayrollBonus[];
  payPeriodStart: string;
  payPeriodEnd: string;
  paymentMethod: 'bank transfer' | 'cheque' | 'cash';
  status?: 'pending' | 'completed' | 'failed';
}

export interface PayrollState {
  pagination: PaginationMeta;
  records: EmployeePayroll[];
  loading: boolean;
  error: string | null;
}
