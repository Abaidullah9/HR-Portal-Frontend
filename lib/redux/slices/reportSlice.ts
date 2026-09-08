import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiClient } from '@/lib/api/client';
import {
  Report,
  CreateReportPayload,
  ReportState,
} from '@/types/report';

const initialState: ReportState = {
  reports: [],
  loading: false,
  error: null,
};

// Async Thunk: Fetch Reports
export const fetchReports = createAsyncThunk<
  Report[],
  void,
  { rejectValue: string }
>('reports/fetchReports', async (_, { rejectWithValue }) => {
  try {
    const res = await apiClient.get<Report[]>('/reports/paginated');
    return res.data || [];
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch reports';
    return rejectWithValue(message);
  }
});

// Async Thunk: Generate Report
export const generateReport = createAsyncThunk<
  Report,
  CreateReportPayload,
  { rejectValue: string }
>('reports/generateReport', async (payload, { rejectWithValue }) => {
  try {
    const res = await apiClient.post<Report, CreateReportPayload>('/reports', payload);
    if (!res.data) throw new Error('Report generation failed');
    return res.data;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to generate report';
    return rejectWithValue(message);
  }
});

export const reportSlice = createSlice({
  name: 'reports',
  initialState,
  reducers: {
    clearReportError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchReports
      .addCase(fetchReports.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReports.fulfilled, (state, action: PayloadAction<Report[]>) => {
        state.loading = false;
        state.reports = action.payload;
      })
      .addCase(fetchReports.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Failed to load reports';
      })

      // generateReport
      .addCase(generateReport.fulfilled, (state, action: PayloadAction<Report>) => {
        state.reports.unshift(action.payload);
      });
  },
});

export const { clearReportError } = reportSlice.actions;
export default reportSlice.reducer;
