import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FieldError, describedBy, labelClass } from './employee-field-shared'

interface DepartmentSelectFieldProps {
  value: string
  departments: { _id: string; name: string }[]
  onChange: (value: string) => void
  error?: string
}

export function DepartmentSelectField({
  value,
  departments,
  onChange,
  error,
}: DepartmentSelectFieldProps) {
  return (
    <div>
      <label htmlFor="employee-department" className={labelClass}>
        Department *
      </label>
      <Select
        items={departments.map((department) => ({
          value: department._id,
          label: department.name,
        }))}
        value={value || null}
        onValueChange={(next) => onChange(next ?? '')}
      >
        <SelectTrigger
          id="employee-department"
          className="h-10 w-full"
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy('departmentId', error)}
        >
          <SelectValue placeholder="Select department" />
        </SelectTrigger>
        <SelectContent>
          {departments.map((dept) => (
            <SelectItem key={dept._id} value={dept._id}>
              {dept.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <FieldError field="departmentId" message={error} />
    </div>
  )
}
