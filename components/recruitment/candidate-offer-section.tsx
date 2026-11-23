'use client'

import { useState } from 'react'
import { UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/components/common/toast'
import { apiClient } from '@/lib/api/client'
import { hireCandidate } from '@/lib/api/profile'
import type { Candidate } from '@/types/recruitment'
import type { Department } from '@/types/employee'

interface CandidateOfferSectionProps {
  candidate: Candidate
  departments: Department[]
  canManage: boolean
  onChanged: () => void
  onHired: () => void
}

/** The offer fields plus the conversion into an employee record. */
export function CandidateOfferSection({
  candidate,
  departments,
  canManage,
  onChanged,
  onHired,
}: CandidateOfferSectionProps) {
  const toast = useToast()
  const posting =
    typeof candidate.jobPostingId === 'object' && candidate.jobPostingId !== null
      ? candidate.jobPostingId
      : null

  const [busy, setBusy] = useState(false)
  const [salary, setSalary] = useState('')
  const [startDate, setStartDate] = useState('')
  const [position, setPosition] = useState(posting?.position ?? '')
  const [departmentId, setDepartmentId] = useState(
    typeof posting?.departmentId === 'object' ? posting.departmentId._id : '',
  )

  const save = async () => {
    setBusy(true)
    try {
      await apiClient.patch(`/candidates/${candidate._id}`, {
        offer: {
          ...(salary ? { salary: Number(salary) } : {}),
          ...(position ? { position } : {}),
          ...(startDate ? { startDate } : {}),
        },
      })
      toast('Offer details saved')
      onChanged()
    } catch (problem) {
      toast(problem instanceof Error ? problem.message : 'Could not save the offer', 'error')
    } finally {
      setBusy(false)
    }
  }

  const hire = async () => {
    setBusy(true)
    try {
      const result = await hireCandidate(candidate._id, {
        ...(departmentId ? { departmentId } : {}),
        ...(position ? { position } : {}),
        ...(salary ? { salary: Number(salary) } : {}),
        ...(startDate ? { joiningDate: startDate } : {}),
      })
      toast(`${result.employee.name} added as ${result.employee.employeeCode}`)
      if (result.inviteLink) {
        window.prompt('Employee created. Share this invite link:', result.inviteLink)
      }
      onHired()
    } catch (problem) {
      toast(problem instanceof Error ? problem.message : 'Could not convert the candidate', 'error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section aria-labelledby="offer-heading" className="mt-6 space-y-3">
      <h3 id="offer-heading" className="font-semibold">
        Offer
      </h3>
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label htmlFor="offer-position" className="mb-1 block text-sm font-medium">
            Position
          </label>
          <Input
            id="offer-position"
            value={position}
            onChange={(event) => setPosition(event.target.value)}
          />
        </div>
        <div>
          <label htmlFor="offer-salary" className="mb-1 block text-sm font-medium">
            Base salary
          </label>
          <Input
            id="offer-salary"
            type="number"
            min="0"
            value={salary}
            onChange={(event) => setSalary(event.target.value)}
          />
        </div>
        <div>
          <label htmlFor="offer-start" className="mb-1 block text-sm font-medium">
            Start date
          </label>
          <Input
            id="offer-start"
            type="date"
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
          />
        </div>
      </div>
      {canManage && (
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" disabled={busy} onClick={() => void save()}>
            Save offer
          </Button>
          <Button
            size="sm"
            className="gap-2"
            disabled={busy || Boolean(candidate.hiredEmployeeId)}
            onClick={() => void hire()}
          >
            <UserPlus size={15} />
            {candidate.hiredEmployeeId ? 'Already hired' : 'Convert to employee'}
          </Button>
        </div>
      )}
      {departments.length > 0 && (
        <div>
          <label htmlFor="hire-department" className="mb-1 block text-sm font-medium">
            Department for the employee record
          </label>
          <Select
            items={departments.map((department) => ({
              value: department._id,
              label: department.name,
            }))}
            value={departmentId || null}
            onValueChange={(value) => setDepartmentId(value ?? '')}
          >
            <SelectTrigger id="hire-department" className="h-10 w-full">
              <SelectValue placeholder="Use the job posting's department" />
            </SelectTrigger>
            <SelectContent>
              {departments.map((department) => (
                <SelectItem key={department._id} value={department._id}>
                  {department.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </section>
  )
}
