import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiClient } from '@/lib/api/client';
import { emptyPagination, pageQuery, PICKER_LIMIT, PAGE_SIZE, type Page, type PageArgs } from '@/lib/api/page';
import {
  EmployeePayroll,
  CreatePayrollPayload,
  PayrollState,
} from '@/types/payroll';

const initialState: PayrollState = {
  pagination: emptyPagination(PAGE_SIZE),
  records: [],
  loading: false,
  error: null,
};

// Async Thunk: Fetch Payroll
export const fetchPayroll = createAsyncThunk<
  Page<EmployeePayroll>,
  PageArgs | undefined,
  { rejectValue: string }
>('payroll/fetchPayroll', async (args, { rejectWithValue }) => {
  try {
    const res = await apiClient.get<EmployeePayroll[]>(
        `/payroll/paginated${pageQuery({ page: args?.page, limit: args?.limit ?? PICKER_LIMIT })}`,
      );
      return { data: res.data || [], pagination: res.pagination };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch payroll';
    return rejectWithValue(message);
  }
});

// Async Thunk: Create Payroll
export const createPayroll = createAsyncThunk<
  EmployeePayroll,
  CreatePayrollPayload,
  { rejectValue: string }
>('payroll/createPayroll', async (payload, { rejectWithValue }) => {
  try {
    const res = await apiClient.post<EmployeePayroll, CreatePayrollPayload>('/payroll', payload);
    if (!res.data) throw new Error('Payroll creation failed');
    return res.data;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create payroll record';
    return rejectWithValue(message);
  }
});

// Async Thunk: Update Payroll Status
export const updatePayrollStatus = createAsyncThunk<
  EmployeePayroll,
  { id: string; status: 'pending' | 'completed' | 'failed' },
  { rejectValue: string }
>('payroll/updatePayrollStatus', async ({ id, status }, { rejectWithValue }) => {
  try {
    const res = await apiClient.patch<EmployeePayroll, { status: string }>(`/payroll/${id}/status`, { status });
    if (!res.data) throw new Error('Payroll status update failed');
    return res.data;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update payroll status';
    return rejectWithValue(message);
  }
});

export const payrollSlice = createSlice({
  name: 'payroll',
  initialState,
  reducers: {
    clearPayrollError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchPayroll
      .addCase(fetchPayroll.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPayroll.fulfilled, (state, action: PayloadAction<Page<EmployeePayroll>>) => {
        state.loading = false;
        state.records = action.payload.data;
        state.pagination = action.payload.pagination ?? emptyPagination();
      })
      .addCase(fetchPayroll.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Failed to load payroll records';
      })

      // createPayroll
      .addCase(createPayroll.fulfilled, (state, action: PayloadAction<EmployeePayroll>) => {
        state.records.unshift(action.payload);
      })

      // updatePayrollStatus
      .addCase(updatePayrollStatus.fulfilled, (state, action: PayloadAction<EmployeePayroll>) => {
        const index = state.records.findIndex((p) => p._id === action.payload._id);
        if (index !== -1) {
          state.records[index] = action.payload;
        }
      });
  },
});

export const { clearPayrollError } = payrollSlice.actions;
export default payrollSlice.reducer;
