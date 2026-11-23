import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  EMPLOYEE_FIELD_IDS,
  FieldError,
  POSITIONS,
  describedBy,
  labelClass,
  type EmployeeField,
  type EmployeeFormValues,
} from './employee-field-shared'
import { DepartmentSelectField } from './department-select-field'

export { EMPLOYEE_FIELD_IDS, POSITIONS }
export type { EmployeeField, EmployeeFormValues }

interface EmployeeFormFieldsProps {
  formData: EmployeeFormValues
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  onSelectChange: (name: 'departmentId' | 'position' | 'employmentType', value: string) => void
  departments: { _id: string; name: string }[]
  errors?: Partial<Record<EmployeeField, string>>
}

export function EmployeeFormFields({
  formData,
  onChange,
  onSelectChange,
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

      <DepartmentSelectField
        value={formData.departmentId}
        departments={departments}
        onChange={(value) => onSelectChange('departmentId', value)}
        error={errors.departmentId}
      />

      <div>
        <label htmlFor="employee-position" className={labelClass}>
          Position
        </label>
        <Select
          items={POSITIONS.map((position) => ({ value: position, label: position }))}
          value={formData.position}
          onValueChange={(value) => onSelectChange('position', value ?? '')}
        >
          <SelectTrigger id="employee-position" className="h-10 w-full">
            <SelectValue placeholder="Select a position" />
          </SelectTrigger>
          <SelectContent>
            {POSITIONS.map((pos) => (
              <SelectItem key={pos} value={pos}>
                {pos}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
        <Select
          items={[
            { value: 'full-time', label: 'Full time' },
            { value: 'part-time', label: 'Part time' },
            { value: 'contract', label: 'Contract' },
            { value: 'intern', label: 'Intern' },
          ]}
          value={formData.employmentType}
          onValueChange={(value) => onSelectChange('employmentType', value ?? '')}
        >
          <SelectTrigger id="employee-employment-type" className="h-10 w-full">
            <SelectValue placeholder="Select employment type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="full-time">Full time</SelectItem>
            <SelectItem value="part-time">Part time</SelectItem>
            <SelectItem value="contract">Contract</SelectItem>
            <SelectItem value="intern">Intern</SelectItem>
          </SelectContent>
        </Select>
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
