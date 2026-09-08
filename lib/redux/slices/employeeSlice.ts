import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiClient } from '@/lib/api/client';
import {
  Employee,
  Department,
  CreateEmployeePayload,
  UpdateEmployeePayload,
  EmployeeState,
} from '@/types/employee';

const initialState: EmployeeState = {
  employees: [],
  departments: [],
  selectedEmployee: null,
  loading: false,
  error: null,
};

// Async Thunk: Fetch Employees
export const fetchEmployees = createAsyncThunk<
  Employee[],
  void,
  { rejectValue: string }
>('employees/fetchEmployees', async (_, { rejectWithValue }) => {
  try {
    const res = await apiClient.get<Employee[]>('/employees/paginated');
    return res.data || [];
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch employees';
    return rejectWithValue(message);
  }
});

// Async Thunk: Fetch Departments
export const fetchDepartments = createAsyncThunk<
  Department[],
  void,
  { rejectValue: string }
>('employees/fetchDepartments', async (_, { rejectWithValue }) => {
  try {
    const res = await apiClient.get<Department[]>('/departments/paginated');
    return res.data || [];
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch departments';
    return rejectWithValue(message);
  }
});

// Async Thunk: Add Employee
export const addEmployee = createAsyncThunk<
  Employee,
  CreateEmployeePayload,
  { rejectValue: string }
>('employees/addEmployee', async (payload, { rejectWithValue }) => {
  try {
    const res = await apiClient.post<Employee, CreateEmployeePayload>('/employees', payload);
    if (!res.data) throw new Error('Employee creation failed');
    return res.data;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to add employee';
    return rejectWithValue(message);
  }
});

// Async Thunk: Update Employee
export const updateEmployee = createAsyncThunk<
  Employee,
  { id: string; payload: UpdateEmployeePayload },
  { rejectValue: string }
>('employees/updateEmployee', async ({ id, payload }, { rejectWithValue }) => {
  try {
    const res = await apiClient.patch<Employee, UpdateEmployeePayload>(`/employees/${id}`, payload);
    if (!res.data) throw new Error('Employee update failed');
    return res.data;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update employee';
    return rejectWithValue(message);
  }
});

// Async Thunk: Delete Employee
export const deleteEmployee = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>('employees/deleteEmployee', async (id, { rejectWithValue }) => {
  try {
    await apiClient.delete<Employee>(`/employees/${id}`);
    return id;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete employee';
    return rejectWithValue(message);
  }
});

export const employeeSlice = createSlice({
  name: 'employee',
  initialState,
  reducers: {
    clearEmployeeError: (state) => {
      state.error = null;
    },
    setSelectedEmployee: (state, action: PayloadAction<Employee | null>) => {
      state.selectedEmployee = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchEmployees
      .addCase(fetchEmployees.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEmployees.fulfilled, (state, action: PayloadAction<Employee[]>) => {
        state.loading = false;
        state.employees = action.payload;
      })
      .addCase(fetchEmployees.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Failed to load employees';
      })

      // fetchDepartments
      .addCase(fetchDepartments.fulfilled, (state, action: PayloadAction<Department[]>) => {
        state.departments = action.payload;
      })

      // addEmployee
      .addCase(addEmployee.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addEmployee.fulfilled, (state, action: PayloadAction<Employee>) => {
        state.loading = false;
        state.employees.push(action.payload);
      })
      .addCase(addEmployee.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Failed to add employee';
      })

      // updateEmployee
      .addCase(updateEmployee.fulfilled, (state, action: PayloadAction<Employee>) => {
        const index = state.employees.findIndex((e) => e._id === action.payload._id);
        if (index !== -1) {
          state.employees[index] = action.payload;
        }
      })

      // deleteEmployee
      .addCase(deleteEmployee.fulfilled, (state, action: PayloadAction<string>) => {
        state.employees = state.employees.filter((e) => e._id !== action.payload);
      });
  },
});

export const { clearEmployeeError, setSelectedEmployee } = employeeSlice.actions;
export default employeeSlice.reducer;
