import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiClient } from '@/lib/api/client';
import {
  PerformanceCycle,
  Appraisal,
  Feedback,
  CreateFeedbackPayload,
  PerformanceState,
} from '@/types/performance';

const initialState: PerformanceState = {
  cycles: [],
  appraisals: [],
  feedback: [],
  loading: false,
  error: null,
};

// Async Thunk: Fetch Performance Cycles
export const fetchPerformanceCycles = createAsyncThunk<
  PerformanceCycle[],
  void,
  { rejectValue: string }
>('performance/fetchPerformanceCycles', async (_, { rejectWithValue }) => {
  try {
    const res = await apiClient.get<PerformanceCycle[]>('/performance-cycles/paginated');
    return res.data || [];
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch performance cycles';
    return rejectWithValue(message);
  }
});

// Async Thunk: Fetch Appraisals
export const fetchAppraisals = createAsyncThunk<
  Appraisal[],
  void,
  { rejectValue: string }
>('performance/fetchAppraisals', async (_, { rejectWithValue }) => {
  try {
    const res = await apiClient.get<Appraisal[]>('/appraisals/paginated');
    return res.data || [];
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch appraisals';
    return rejectWithValue(message);
  }
});

// Async Thunk: Fetch Feedback
export const fetchFeedback = createAsyncThunk<
  Feedback[],
  void,
  { rejectValue: string }
>('performance/fetchFeedback', async (_, { rejectWithValue }) => {
  try {
    const res = await apiClient.get<Feedback[]>('/feedback/paginated');
    return res.data || [];
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch feedback';
    return rejectWithValue(message);
  }
});

// Async Thunk: Submit Feedback
export const submitFeedback = createAsyncThunk<
  Feedback,
  CreateFeedbackPayload,
  { rejectValue: string }
>('performance/submitFeedback', async (payload, { rejectWithValue }) => {
  try {
    const res = await apiClient.post<Feedback, CreateFeedbackPayload>('/feedback', payload);
    if (!res.data) throw new Error('Feedback submission failed');
    return res.data;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to submit feedback';
    return rejectWithValue(message);
  }
});

export const performanceSlice = createSlice({
  name: 'performance',
  initialState,
  reducers: {
    clearPerformanceError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchPerformanceCycles
      .addCase(fetchPerformanceCycles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPerformanceCycles.fulfilled, (state, action: PayloadAction<PerformanceCycle[]>) => {
        state.loading = false;
        state.cycles = action.payload;
      })
      .addCase(fetchPerformanceCycles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Failed to load performance cycles';
      })

      // fetchAppraisals
      .addCase(fetchAppraisals.fulfilled, (state, action: PayloadAction<Appraisal[]>) => {
        state.appraisals = action.payload;
      })

      // fetchFeedback
      .addCase(fetchFeedback.fulfilled, (state, action: PayloadAction<Feedback[]>) => {
        state.feedback = action.payload;
      })

      // submitFeedback
      .addCase(submitFeedback.fulfilled, (state, action: PayloadAction<Feedback>) => {
        state.feedback.unshift(action.payload);
      });
  },
});

export const { clearPerformanceError } = performanceSlice.actions;
export default performanceSlice.reducer;
