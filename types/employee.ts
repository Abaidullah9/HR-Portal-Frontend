export interface Department {
  _id: string;
  name: string;
  description?: string;
  managerId?: string | { _id: string; name: string };
  parentDepartmentId?: string;
}

export interface Employee {
  _id: string;
  employeeCode: string;
  name: string;
  email: string;
  departmentId?: string | Department;
  position: string;
  employmentType: 'full-time' | 'part-time' | 'contract' | 'intern';
  isActive: boolean;
  joiningDate: string;
  reportingManagerId?: string | { _id: string; name: string };
  salary?: number;
  phone?: string;
}

export interface CreateEmployeePayload {
  name: string;
  email: string;
  employeeCode: string;
  departmentId: string;
  position: string;
  employmentType?: 'full-time' | 'part-time' | 'contract' | 'intern';
  isActive?: boolean;
  joiningDate: string;
  reportingManagerId?: string;
  salary?: number;
  phone?: string;
}

export interface UpdateEmployeePayload {
  name?: string;
  email?: string;
  departmentId?: string;
  position?: string;
  employmentType?: 'full-time' | 'part-time' | 'contract' | 'intern';
  isActive?: boolean;
  reportingManagerId?: string;
  salary?: number;
  phone?: string;
}

export interface EmployeeState {
  employees: Employee[];
  departments: Department[];
  selectedEmployee: Employee | null;
  loading: boolean;
  error: string | null;
}
