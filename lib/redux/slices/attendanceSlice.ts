import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiClient } from '@/lib/api/client';
import {
  AttendanceRecord,
  CreateAttendancePayload,
  UpdateAttendancePayload,
  AttendanceState,
} from '@/types/attendance';

const initialState: AttendanceState = {
  records: [],
  loading: false,
  error: null,
};

// Async Thunk: Fetch Attendance
export const fetchAttendance = createAsyncThunk<
  AttendanceRecord[],
  void,
  { rejectValue: string }
>('attendance/fetchAttendance', async (_, { rejectWithValue }) => {
  try {
    const res = await apiClient.get<AttendanceRecord[]>('/attendance/paginated');
    return res.data || [];
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch attendance';
    return rejectWithValue(message);
  }
});

// Async Thunk: Record Attendance
export const recordAttendance = createAsyncThunk<
  AttendanceRecord,
  CreateAttendancePayload,
  { rejectValue: string }
>('attendance/recordAttendance', async (payload, { rejectWithValue }) => {
  try {
    const res = await apiClient.post<AttendanceRecord, CreateAttendancePayload>('/attendance', payload);
    if (!res.data) throw new Error('Attendance recording failed');
    return res.data;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to record attendance';
    return rejectWithValue(message);
  }
});

// Async Thunk: Update Attendance
export const updateAttendance = createAsyncThunk<
  AttendanceRecord,
  { id: string; payload: UpdateAttendancePayload },
  { rejectValue: string }
>('attendance/updateAttendance', async ({ id, payload }, { rejectWithValue }) => {
  try {
    const res = await apiClient.patch<AttendanceRecord, UpdateAttendancePayload>(`/attendance/${id}`, payload);
    if (!res.data) throw new Error('Attendance update failed');
    return res.data;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update attendance';
    return rejectWithValue(message);
  }
});

export const attendanceSlice = createSlice({
  name: 'attendance',
  initialState,
  reducers: {
    clearAttendanceError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchAttendance
      .addCase(fetchAttendance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAttendance.fulfilled, (state, action: PayloadAction<AttendanceRecord[]>) => {
        state.loading = false;
        state.records = action.payload;
      })
      .addCase(fetchAttendance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Failed to load attendance';
      })

      // recordAttendance
      .addCase(recordAttendance.fulfilled, (state, action: PayloadAction<AttendanceRecord>) => {
        state.records.unshift(action.payload);
      })

      // updateAttendance
      .addCase(updateAttendance.fulfilled, (state, action: PayloadAction<AttendanceRecord>) => {
        const index = state.records.findIndex((r) => r._id === action.payload._id);
        if (index !== -1) {
          state.records[index] = action.payload;
        }
      });
  },
});

export const { clearAttendanceError } = attendanceSlice.actions;
export default attendanceSlice.reducer;
