import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiClient } from '@/lib/api/client';
import { Department } from '@/types/employee';
import {
  OrganizationSetting,
  Team,
  OrganizationState,
} from '@/types/organization';

const initialState: OrganizationState = {
  settings: null,
  departments: [],
  teams: [],
  loading: false,
  error: null,
};

// Async Thunk: Fetch Organization Settings
export const fetchOrganizationSettings = createAsyncThunk<
  OrganizationSetting,
  void,
  { rejectValue: string }
>('organization/fetchOrganizationSettings', async (_, { rejectWithValue }) => {
  try {
    const res = await apiClient.get<OrganizationSetting>('/organization-settings');
    if (!res.data) throw new Error('Settings not found');
    return res.data;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch settings';
    return rejectWithValue(message);
  }
});

// Async Thunk: Fetch Departments
export const fetchOrgDepartments = createAsyncThunk<
  Department[],
  void,
  { rejectValue: string }
>('organization/fetchOrgDepartments', async (_, { rejectWithValue }) => {
  try {
    const res = await apiClient.get<Department[]>('/departments/paginated');
    return res.data || [];
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch departments';
    return rejectWithValue(message);
  }
});

// Async Thunk: Fetch Teams
export const fetchTeams = createAsyncThunk<
  Team[],
  void,
  { rejectValue: string }
>('organization/fetchTeams', async (_, { rejectWithValue }) => {
  try {
    const res = await apiClient.get<Team[]>('/teams/paginated');
    return res.data || [];
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch teams';
    return rejectWithValue(message);
  }
});

export const organizationSlice = createSlice({
  name: 'organization',
  initialState,
  reducers: {
    clearOrganizationError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchOrganizationSettings
      .addCase(fetchOrganizationSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrganizationSettings.fulfilled, (state, action: PayloadAction<OrganizationSetting>) => {
        state.loading = false;
        state.settings = action.payload;
      })
      .addCase(fetchOrganizationSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Failed to load organization settings';
      })

      // fetchOrgDepartments
      .addCase(fetchOrgDepartments.fulfilled, (state, action: PayloadAction<Department[]>) => {
        state.departments = action.payload;
      })

      // fetchTeams
      .addCase(fetchTeams.fulfilled, (state, action: PayloadAction<Team[]>) => {
        state.teams = action.payload;
      });
  },
});

export const { clearOrganizationError } = organizationSlice.actions;
export default organizationSlice.reducer;
