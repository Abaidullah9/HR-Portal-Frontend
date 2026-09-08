import { Employee } from './employee';

export interface LeaveRequest {
  _id: string;
  employeeId: string | Employee;
  leaveType: string;
  fromDate: string;
  toDate: string;
  leaveStatus: 'pending' | 'approved' | 'rejected' | 'cancelled';
  approvedById?: string | Employee;
  rejectionReason?: string;
  reasonForLeave: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LeaveBalance {
  _id: string;
  employeeId: string | Employee;
  leaveType: string;
  totalAllocated: number;
  used: number;
  remaining: number;
  year: number;
}

export interface CreateLeaveRequestPayload {
  employeeId: string;
  leaveType: string;
  fromDate: string;
  toDate: string;
  reasonForLeave: string;
}

export interface ApproveRejectLeavePayload {
  _id: string;
  leaveStatus: 'approved' | 'rejected';
  rejectionReason?: string;
}

export interface LeaveState {
  requests: LeaveRequest[];
  balances: LeaveBalance[];
  loading: boolean;
  error: string | null;
}
