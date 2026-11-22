export const POSITIONS = [
  'Senior Software Engineer',
  'Software Engineer',
  'Junior Developer',
  'Product Manager',
  'Marketing Manager',
  'Sales Executive',
  'HR Specialist',
  'Financial Analyst',
  'Operations Manager',
  'UI/UX Designer',
]

/** The subset of the modal's form state the fields read and write. */
export interface EmployeeFormValues {
  name: string
  email: string
  employeeCode: string
  departmentId: string
  position: string
  joiningDate: string
  salary: string
  employmentType: string
  phone: string
}

export type EmployeeField =
  | 'name'
  | 'email'
  | 'employeeCode'
  | 'departmentId'
  | 'salary'
  | 'joiningDate'

/** Control ids are shared so validation can focus the first problem. */
export const EMPLOYEE_FIELD_IDS: Record<EmployeeField, string> = {
  name: 'employee-name',
  email: 'employee-email',
  employeeCode: 'employee-code',
  departmentId: 'employee-department',
  salary: 'employee-salary',
  joiningDate: 'employee-joining-date',
}

export const selectClass =
  'w-full h-10 rounded-xl border edge bg-white/80 px-3 text-sm text-foreground shadow-sm backdrop-blur-md aria-invalid:border-[rgb(var(--danger-rgb))] focus:outline-none focus:ring-2 ring-brand focus:border-brand dark:edge dark:surface-70'

export const labelClass = 'block text-sm font-medium text-foreground mb-2'

/** Message tied to its control through aria-describedby, so it is announced. */
export function FieldError({ field, message }: { field: EmployeeField; message?: string }) {
  if (!message) return null
  return (
    <p id={`${EMPLOYEE_FIELD_IDS[field]}-error`} className="mt-1.5 text-xs danger-text">
      {message}
    </p>
  )
}

export const describedBy = (field: EmployeeField, message?: string) =>
  message ? `${EMPLOYEE_FIELD_IDS[field]}-error` : undefined
