'use client'

import { Input } from '@/components/ui/input'

export interface JobFormValues {
  position: string
  departmentId: string
  description: string
  numberOfOpenings: string
  closingDate: string
}

interface JobFormFieldsProps {
  values: JobFormValues
  departments: { _id: string; name: string }[]
  onChange: (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => void
}

export function JobFormFields({ values, departments, onChange }: JobFormFieldsProps) {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="job-position" className="mb-2 block text-sm font-medium text-foreground">
            Position *
          </label>
          <Input
            id="job-position"
            type="text"
            name="position"
            placeholder="e.g. Senior software engineer"
            value={values.position}
            onChange={onChange}
            required
          />
        </div>

        <div>
          <label
            htmlFor="job-department"
            className="mb-2 block text-sm font-medium text-foreground"
          >
            Department *
          </label>
          <select
            id="job-department"
            name="departmentId"
            value={values.departmentId}
            onChange={onChange}
            required
            className="h-10 w-full rounded-xl border edge bg-white/80 px-3 text-sm text-foreground shadow-sm backdrop-blur-md focus:border-brand focus:outline-none focus:ring-2 ring-brand dark:edge dark:surface-70"
          >
            <option value="">Select department</option>
            {departments.map((department) => (
              <option key={department._id} value={department._id}>
                {department.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="job-openings" className="mb-2 block text-sm font-medium text-foreground">
            Openings
          </label>
          <Input
            id="job-openings"
            type="number"
            name="numberOfOpenings"
            min={1}
            value={values.numberOfOpenings}
            onChange={onChange}
          />
        </div>

        <div>
          <label htmlFor="job-closing" className="mb-2 block text-sm font-medium text-foreground">
            Closing date
          </label>
          <Input
            id="job-closing"
            type="date"
            name="closingDate"
            value={values.closingDate}
            onChange={onChange}
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="job-description"
          className="mb-2 block text-sm font-medium text-foreground"
        >
          Description *
        </label>
        <textarea
          id="job-description"
          name="description"
          rows={4}
          placeholder="Role summary, responsibilities, and requirements..."
          value={values.description}
          onChange={onChange}
          required
          className="h-28 w-full resize-y rounded-xl border edge bg-white/80 px-3 py-2 text-sm text-foreground placeholder:text-foreground/60 shadow-sm backdrop-blur-md focus:border-brand focus:outline-none focus:ring-2 ring-brand dark:edge dark:surface-70"
        />
      </div>
    </>
  )
}
