'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAppDispatch, useAppSelector } from '@/lib/redux/store';
import { addEmployee } from '@/lib/redux/slices/employeeSlice';
import { CreateEmployeePayload } from '@/types/employee';

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const POSITIONS = [
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
];

export function AddEmployeeModal({ isOpen, onClose }: AddEmployeeModalProps) {
  const dispatch = useAppDispatch();
  const { departments } = useAppSelector((state) => state.employee);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    employeeCode: `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
    departmentId: '',
    position: POSITIONS[0] || 'Software Engineer',
    joiningDate: new Date().toISOString().split('T')[0],
    salary: '',
    employmentType: 'full-time' as const,
    phone: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.email || !formData.employeeCode) {
      setError('Please fill in all required fields');
      return;
    }

    const selectedDept = formData.departmentId || departments[0]?._id;
    if (!selectedDept) {
      setError('Please select or create a department first');
      return;
    }

    const salaryNum = formData.salary ? parseFloat(formData.salary) : undefined;

    setLoading(true);
    try {
      const payload: CreateEmployeePayload = {
        name: formData.name,
        email: formData.email,
        employeeCode: formData.employeeCode,
        departmentId: selectedDept,
        position: formData.position,
        joiningDate: formData.joiningDate || new Date().toISOString(),
        employmentType: formData.employmentType,
        salary: salaryNum,
        phone: formData.phone || undefined,
        isActive: true,
      };

      const result = await dispatch(addEmployee(payload));
      if (addEmployee.fulfilled.match(result)) {
        onClose();
        setFormData({
          name: '',
          email: '',
          employeeCode: `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
          departmentId: '',
          position: POSITIONS[0] || 'Software Engineer',
          joiningDate: new Date().toISOString().split('T')[0],
          salary: '',
          employmentType: 'full-time',
          phone: '',
        });
      } else {
        setError(result.payload || 'Failed to add employee');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add employee');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-border">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-6 border-b border-border bg-card">
          <h2 className="text-xl font-bold text-foreground">Add New Employee</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Full Name *
              </label>
              <Input
                type="text"
                name="name"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Email Address *
              </label>
              <Input
                type="email"
                name="email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Employee Code *
              </label>
              <Input
                type="text"
                name="employeeCode"
                placeholder="EMP-0001"
                value={formData.employeeCode}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Department *
              </label>
              <select
                name="departmentId"
                value={formData.departmentId}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
              >
                <option value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept._id} value={dept._id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Position
              </label>
              <select
                name="position"
                value={formData.position}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
              >
                {POSITIONS.map((pos) => (
                  <option key={pos} value={pos}>
                    {pos}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Salary
              </label>
              <Input
                type="number"
                name="salary"
                placeholder="50000"
                value={formData.salary}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Joining Date
              </label>
              <Input
                type="date"
                name="joiningDate"
                value={formData.joiningDate}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Employment Type
              </label>
              <select
                name="employmentType"
                value={formData.employmentType}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
              >
                <option value="full-time">Full Time</option>
                <option value="part-time">Part Time</option>
                <option value="contract">Contract</option>
                <option value="intern">Intern</option>
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-foreground mb-2">
                Phone Number
              </label>
              <Input
                type="tel"
                name="phone"
                placeholder="+1-234-567-8900"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              {loading ? 'Adding...' : 'Add Employee'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
