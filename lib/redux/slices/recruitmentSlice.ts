import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiClient } from '@/lib/api/client';
import {
  JobPosting,
  Candidate,
  Interview,
  CreateJobPostingPayload,
  CreateCandidatePayload,
  RecruitmentState,
} from '@/types/recruitment';

const initialState: RecruitmentState = {
  jobPostings: [],
  candidates: [],
  interviews: [],
  loading: false,
  error: null,
};

// Async Thunk: Fetch Job Postings
export const fetchJobPostings = createAsyncThunk<
  JobPosting[],
  void,
  { rejectValue: string }
>('recruitment/fetchJobPostings', async (_, { rejectWithValue }) => {
  try {
    const res = await apiClient.get<JobPosting[]>('/job-postings/paginated');
    return res.data || [];
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch job postings';
    return rejectWithValue(message);
  }
});

// Async Thunk: Fetch Candidates
export const fetchCandidates = createAsyncThunk<
  Candidate[],
  void,
  { rejectValue: string }
>('recruitment/fetchCandidates', async (_, { rejectWithValue }) => {
  try {
    const res = await apiClient.get<Candidate[]>('/candidates/paginated');
    return res.data || [];
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch candidates';
    return rejectWithValue(message);
  }
});

// Async Thunk: Fetch Interviews
export const fetchInterviews = createAsyncThunk<
  Interview[],
  void,
  { rejectValue: string }
>('recruitment/fetchInterviews', async (_, { rejectWithValue }) => {
  try {
    const res = await apiClient.get<Interview[]>('/interviews/paginated');
    return res.data || [];
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch interviews';
    return rejectWithValue(message);
  }
});

// Async Thunk: Create Job Posting
export const createJobPosting = createAsyncThunk<
  JobPosting,
  CreateJobPostingPayload,
  { rejectValue: string }
>('recruitment/createJobPosting', async (payload, { rejectWithValue }) => {
  try {
    const res = await apiClient.post<JobPosting, CreateJobPostingPayload>('/job-postings', payload);
    if (!res.data) throw new Error('Job posting creation failed');
    return res.data;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create job posting';
    return rejectWithValue(message);
  }
});

// Async Thunk: Create Candidate
export const createCandidate = createAsyncThunk<
  Candidate,
  CreateCandidatePayload,
  { rejectValue: string }
>('recruitment/createCandidate', async (payload, { rejectWithValue }) => {
  try {
    const res = await apiClient.post<Candidate, CreateCandidatePayload>('/candidates', payload);
    if (!res.data) throw new Error('Candidate creation failed');
    return res.data;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to add candidate';
    return rejectWithValue(message);
  }
});

export const recruitmentSlice = createSlice({
  name: 'recruitment',
  initialState,
  reducers: {
    clearRecruitmentError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchJobPostings
      .addCase(fetchJobPostings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchJobPostings.fulfilled, (state, action: PayloadAction<JobPosting[]>) => {
        state.loading = false;
        state.jobPostings = action.payload;
      })
      .addCase(fetchJobPostings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Failed to load job postings';
      })

      // fetchCandidates
      .addCase(fetchCandidates.fulfilled, (state, action: PayloadAction<Candidate[]>) => {
        state.candidates = action.payload;
      })

      // fetchInterviews
      .addCase(fetchInterviews.fulfilled, (state, action: PayloadAction<Interview[]>) => {
        state.interviews = action.payload;
      })

      // createJobPosting
      .addCase(createJobPosting.fulfilled, (state, action: PayloadAction<JobPosting>) => {
        state.jobPostings.unshift(action.payload);
      })

      // createCandidate
      .addCase(createCandidate.fulfilled, (state, action: PayloadAction<Candidate>) => {
        state.candidates.unshift(action.payload);
      });
  },
});

export const { clearRecruitmentError } = recruitmentSlice.actions;
export default recruitmentSlice.reducer;
