import type { PaginationMeta } from '@/lib/api/client';
import { Employee } from './employee';

export interface AttendanceRecord {
  _id: string;
  employeeId: string | Employee;
  date: string;
  checkIn?: string;
  checkOut?: string;
  status?: 'present' | 'absent' | 'late';
  /** Set when a manager corrected the recorded times. */
  regularized?: boolean;
  regularizationNote?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateAttendancePayload {
  employeeId: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
}

export interface UpdateAttendancePayload {
  /** Required whenever the recorded times change; it becomes the audit note. */
  regularizationNote?: string;
  checkIn?: string;
  checkOut?: string;
}

export interface AttendanceState {
  pagination: PaginationMeta;
  records: AttendanceRecord[];
  loading: boolean;
  error: string | null;
}
