import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiClient } from '@/lib/api/client';
import { emptyPagination, pageQuery, PICKER_LIMIT, PAGE_SIZE, type Page, type PageArgs } from '@/lib/api/page';
import {
  Employee,
  Department,
  CreateEmployeePayload,
  UpdateEmployeePayload,
  EmployeeState,
} from '@/types/employee';

const initialState: EmployeeState = {
  pagination: emptyPagination(PAGE_SIZE),
  employees: [],
  departments: [],
  selectedEmployee: null,
  loading: false,
  error: null,
};

// Async Thunk: Fetch Employees
export const fetchEmployees = createAsyncThunk<
  Page<Employee>,
  PageArgs | undefined,
  { rejectValue: string }
>('employees/fetchEmployees', async (args, { rejectWithValue }) => {
  try {
    const res = await apiClient.get<Employee[]>(
        `/employees/paginated${pageQuery({ page: args?.page, limit: args?.limit ?? PICKER_LIMIT, search: args?.search })}`,
      );
      return { data: res.data || [], pagination: res.pagination };
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
    const res = await apiClient.get<Department[]>(`/departments/paginated${pageQuery({ limit: PICKER_LIMIT })}`);
    return res.data || [];
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch departments';
    return rejectWithValue(message);
  }
});

// Async Thunk: Create Department
export const createDepartment = createAsyncThunk<
  Department,
  { name: string; description?: string },
  { rejectValue: string }
>('employees/createDepartment', async (payload, { rejectWithValue }) => {
  try {
    const res = await apiClient.post<Department, { name: string; description?: string }>(
      '/departments',
      payload,
    );
    if (!res.data) throw new Error('Department creation failed');
    return res.data;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create department';
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
      .addCase(fetchEmployees.fulfilled, (state, action: PayloadAction<Page<Employee>>) => {
        state.loading = false;
        state.employees = action.payload.data;
        state.pagination = action.payload.pagination ?? emptyPagination();
      })
      .addCase(fetchEmployees.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Failed to load employees';
      })

      // fetchDepartments
      .addCase(fetchDepartments.fulfilled, (state, action: PayloadAction<Department[]>) => {
        state.departments = action.payload;
      })

      // createDepartment — deliberately does not toggle `loading`, which the
      // employee table relies on.
      .addCase(createDepartment.pending, (state) => {
        state.error = null;
      })
      .addCase(createDepartment.fulfilled, (state, action: PayloadAction<Department>) => {
        state.departments.push(action.payload);
      })
      .addCase(createDepartment.rejected, (state, action) => {
        state.error = action.payload ?? 'Failed to create department';
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
