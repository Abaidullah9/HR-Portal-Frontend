import { Input } from '@/components/ui/input'
import {
  EMPLOYEE_FIELD_IDS,
  FieldError,
  POSITIONS,
  describedBy,
  labelClass,
  selectClass,
  type EmployeeField,
  type EmployeeFormValues,
} from './employee-field-shared'

export { EMPLOYEE_FIELD_IDS, POSITIONS }
export type { EmployeeField, EmployeeFormValues }

interface EmployeeFormFieldsProps {
  formData: EmployeeFormValues
  onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void
  departments: { _id: string; name: string }[]
  errors?: Partial<Record<EmployeeField, string>>
}

export function EmployeeFormFields({
  formData,
  onChange,
  departments,
  errors = {},
}: EmployeeFormFieldsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div>
        <label htmlFor="employee-name" className={labelClass}>
          Full name *
        </label>
        <Input
          id="employee-name"
          type="text"
          name="name"
          placeholder="John Doe"
          value={formData.name}
          onChange={onChange}
          required
          aria-invalid={errors.name ? true : undefined}
          aria-describedby={describedBy('name', errors.name)}
        />
        <FieldError field="name" message={errors.name} />
      </div>

      <div>
        <label htmlFor="employee-email" className={labelClass}>
          Email address *
        </label>
        <Input
          id="employee-email"
          type="email"
          name="email"
          placeholder="john@example.com"
          value={formData.email}
          onChange={onChange}
          required
          aria-invalid={errors.email ? true : undefined}
          aria-describedby={describedBy('email', errors.email)}
        />
        <FieldError field="email" message={errors.email} />
      </div>

      <div>
        <label htmlFor="employee-code" className={labelClass}>
          Employee code *
        </label>
        <Input
          id="employee-code"
          type="text"
          name="employeeCode"
          placeholder="EMP-0001"
          value={formData.employeeCode}
          onChange={onChange}
          required
          aria-invalid={errors.employeeCode ? true : undefined}
          aria-describedby={describedBy('employeeCode', errors.employeeCode)}
        />
        <FieldError field="employeeCode" message={errors.employeeCode} />
      </div>

      <div>
        <label htmlFor="employee-department" className={labelClass}>
          Department *
        </label>
        <select
          id="employee-department"
          name="departmentId"
          value={formData.departmentId}
          onChange={onChange}
          className={selectClass}
          aria-invalid={errors.departmentId ? true : undefined}
          aria-describedby={describedBy('departmentId', errors.departmentId)}
        >
          <option value="">Select department</option>
          {departments.map((dept) => (
            <option key={dept._id} value={dept._id}>
              {dept.name}
            </option>
          ))}
        </select>
        <FieldError field="departmentId" message={errors.departmentId} />
      </div>

      <div>
        <label htmlFor="employee-position" className={labelClass}>
          Position
        </label>
        <select
          id="employee-position"
          name="position"
          value={formData.position}
          onChange={onChange}
          className={selectClass}
        >
          {POSITIONS.map((pos) => (
            <option key={pos} value={pos}>
              {pos}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="employee-salary" className={labelClass}>
          Salary
        </label>
        <Input
          id="employee-salary"
          type="number"
          name="salary"
          placeholder="50000"
          value={formData.salary}
          onChange={onChange}
          aria-invalid={errors.salary ? true : undefined}
          aria-describedby={describedBy('salary', errors.salary)}
        />
        <FieldError field="salary" message={errors.salary} />
      </div>

      <div>
        <label htmlFor="employee-joining-date" className={labelClass}>
          Joining date
        </label>
        <Input
          id="employee-joining-date"
          type="date"
          name="joiningDate"
          value={formData.joiningDate}
          onChange={onChange}
          aria-invalid={errors.joiningDate ? true : undefined}
          aria-describedby={describedBy('joiningDate', errors.joiningDate)}
        />
        <FieldError field="joiningDate" message={errors.joiningDate} />
      </div>

      <div>
        <label htmlFor="employee-employment-type" className={labelClass}>
          Employment type
        </label>
        <select
          id="employee-employment-type"
          name="employmentType"
          value={formData.employmentType}
          onChange={onChange}
          className={selectClass}
        >
          <option value="full-time">Full time</option>
          <option value="part-time">Part time</option>
          <option value="contract">Contract</option>
          <option value="intern">Intern</option>
        </select>
      </div>

      <div className="sm:col-span-2">
        <label htmlFor="employee-phone" className={labelClass}>
          Phone number
        </label>
        <Input
          id="employee-phone"
          type="tel"
          name="phone"
          placeholder="+1-234-567-8900"
          value={formData.phone}
          onChange={onChange}
        />
      </div>
    </div>
  )
}
