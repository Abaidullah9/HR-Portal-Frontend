import type { PaginationMeta } from '@/lib/api/client';
import { Employee } from './employee';

export interface AttendanceRecord {
  _id: string;
  employeeId: string | Employee;
  date: string;
  checkIn?: string;
  checkOut?: string;
  status?: 'present' | 'absent' | 'late';
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
  checkIn?: string;
  checkOut?: string;
}

export interface AttendanceState {
  pagination: PaginationMeta;
  records: AttendanceRecord[];
  loading: boolean;
  error: string | null;
}
