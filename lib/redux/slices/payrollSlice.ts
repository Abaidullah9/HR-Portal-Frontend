import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiClient } from '@/lib/api/client';
import {
  EmployeePayroll,
  CreatePayrollPayload,
  PayrollState,
} from '@/types/payroll';

const initialState: PayrollState = {
  records: [],
  loading: false,
  error: null,
};

// Async Thunk: Fetch Payroll
export const fetchPayroll = createAsyncThunk<
  EmployeePayroll[],
  void,
  { rejectValue: string }
>('payroll/fetchPayroll', async (_, { rejectWithValue }) => {
  try {
    const res = await apiClient.get<EmployeePayroll[]>('/payroll/paginated');
    return res.data || [];
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
      .addCase(fetchPayroll.fulfilled, (state, action: PayloadAction<EmployeePayroll[]>) => {
        state.loading = false;
        state.records = action.payload;
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
