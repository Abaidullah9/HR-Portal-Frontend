import { Employee } from './employee';

export interface PerformanceCycle {
  _id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'upcoming';
}

export interface SkillRating {
  skillName: string;
  skillRating: number;
  targetRating: number;
}

export interface Goal {
  goalName: string;
  goalCompletionRate: number;
  deadline?: string;
  completionStatus: 'completed' | 'in_progress' | 'pending';
}

export interface Appraisal {
  _id: string;
  employeeId: string | Employee;
  cycleId: string | PerformanceCycle;
  appraiserId: string | Employee;
  reviewDate: string;
  overallRating?: number;
  goalsCompleted: number;
  feedbackReceived: number;
  skillsRating: SkillRating[];
  goals: Goal[];
  status: 'pending' | 'completed';
}

export interface Feedback {
  _id: string;
  targetEmployeeId: string | Employee;
  reviewerId: string | Employee;
  cycleId?: string | PerformanceCycle;
  relationship: 'peer' | 'manager' | 'subordinate' | 'self';
  comment: string;
  rating?: number;
  date: string;
}

export interface CreateFeedbackPayload {
  targetEmployeeId: string;
  reviewerId: string;
  cycleId?: string;
  relationship: 'peer' | 'manager' | 'subordinate' | 'self';
  comment: string;
  rating?: number;
}

export interface PerformanceState {
  cycles: PerformanceCycle[];
  appraisals: Appraisal[];
  feedback: Feedback[];
  loading: boolean;
  error: string | null;
}
