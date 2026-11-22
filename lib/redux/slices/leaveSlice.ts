import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiClient } from '@/lib/api/client';
import { emptyPagination, pageQuery, PICKER_LIMIT, PAGE_SIZE, type Page, type PageArgs } from '@/lib/api/page';
import type { RootState } from '@/lib/redux/store';
import {
  LeaveRequest,
  LeaveBalance,
  CreateLeaveRequestPayload,
  ApproveRejectLeavePayload,
  LeaveState,
} from '@/types/leave';

const initialState: LeaveState = {
  pagination: emptyPagination(PAGE_SIZE),
  requests: [],
  balances: [],
  loading: false,
  error: null,
};

// Async Thunk: Fetch Leave Requests
export const fetchLeaveRequests = createAsyncThunk<
  Page<LeaveRequest>,
  PageArgs | undefined,
  { rejectValue: string; state: RootState }
>(
  'leaves/fetchLeaveRequests',
  async (args, { rejectWithValue }) => {
    try {
      const res = await apiClient.get<LeaveRequest[]>(
        `/leave-requests/paginated${pageQuery({ page: args?.page, limit: args?.limit ?? PICKER_LIMIT })}`,
      );
      return { data: res.data || [], pagination: res.pagination };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to fetch leave requests';
      return rejectWithValue(message);
    }
  },
  {
    // The header and the dashboard both need this list on mount. Skipping an
    // identical dispatch while that request is in flight keeps that to one call,
    // without dropping a page change whose previous page is still loading.
    condition: (args, { getState }) => {
      const { loading, pagination } = getState().leaves;
      if (!loading) return true;
      const page = args?.page ?? 1;
      const limit = args?.limit ?? PICKER_LIMIT;
      return page !== pagination.page || limit !== pagination.limit;
    },
  },
);

// Async Thunk: Fetch Leave Balances
export const fetchLeaveBalances = createAsyncThunk<
  LeaveBalance[],
  void,
  { rejectValue: string }
>('leaves/fetchLeaveBalances', async (_, { rejectWithValue }) => {
  try {
    // The caller's own balances: self-service, so a plain employee can see them.
    const res = await apiClient.get<LeaveBalance[]>('/leave-balances/me');
    return res.data || [];
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch leave balances';
    return rejectWithValue(message);
  }
});

// Async Thunk: Create Leave Request
export const createLeaveRequest = createAsyncThunk<
  LeaveRequest,
  CreateLeaveRequestPayload,
  { rejectValue: string }
>('leaves/createLeaveRequest', async (payload, { rejectWithValue }) => {
  try {
    const res = await apiClient.post<LeaveRequest, CreateLeaveRequestPayload>('/leave-requests', payload);
    if (!res.data) throw new Error('Leave request creation failed');
    return res.data;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to submit leave request';
    return rejectWithValue(message);
  }
});

// Async Thunk: Approve/Reject Leave Request
export const approveRejectLeave = createAsyncThunk<
  LeaveRequest,
  ApproveRejectLeavePayload,
  { rejectValue: string }
>('leaves/approveRejectLeave', async ({ _id, leaveStatus, rejectionReason }, { rejectWithValue }) => {
  try {
    const res = await apiClient.patch<LeaveRequest, { leaveStatus: string; rejectionReason?: string }>(
      `/leave-requests/${_id}/approve-reject`,
      { leaveStatus, rejectionReason }
    );
    if (!res.data) throw new Error('Leave request update failed');
    return res.data;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update leave status';
    return rejectWithValue(message);
  }
});

export const leaveSlice = createSlice({
  name: 'leaves',
  initialState,
  reducers: {
    clearLeaveError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchLeaveRequests
      .addCase(fetchLeaveRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLeaveRequests.fulfilled, (state, action: PayloadAction<Page<LeaveRequest>>) => {
        state.loading = false;
        state.requests = action.payload.data;
        state.pagination = action.payload.pagination ?? emptyPagination();
      })
      .addCase(fetchLeaveRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Failed to load leave requests';
      })

      // fetchLeaveBalances
      .addCase(fetchLeaveBalances.fulfilled, (state, action: PayloadAction<LeaveBalance[]>) => {
        state.balances = action.payload;
      })

      // createLeaveRequest
      .addCase(createLeaveRequest.fulfilled, (state, action: PayloadAction<LeaveRequest>) => {
        state.requests.unshift(action.payload);
      })

      // approveRejectLeave
      .addCase(approveRejectLeave.fulfilled, (state, action: PayloadAction<LeaveRequest>) => {
        const index = state.requests.findIndex((r) => r._id === action.payload._id);
        if (index !== -1) {
          state.requests[index] = action.payload;
        }
      });
  },
});

export const { clearLeaveError } = leaveSlice.actions;
export default leaveSlice.reducer;
