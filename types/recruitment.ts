import { Department } from './employee';

export interface JobPosting {
  _id: string;
  position: string;
  departmentId: string | Department;
  description: string;
  requirements: string[];
  numberOfOpenings: number;
  postedBy?: string | { _id: string; name: string };
  postedOnDate: string;
  closingDate?: string;
  status: 'open' | 'closed' | 'on-hold';
}

export interface Candidate {
  _id: string;
  jobPostingId: string | JobPosting;
  name: string;
  email: string;
  phone?: string;
  source: string;
  appliedDate: string;
  status: 'applied' | 'screening' | 'interview' | 'offered' | 'hired' | 'rejected';
  resume?: string;
  notes?: string;
}

export interface Interview {
  _id: string;
  candidateId: string | Candidate;
  interviewerId: string | { _id: string; name: string };
  scheduledAt: string;
  mode: 'in-person' | 'video' | 'phone';
  round: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  feedback?: string;
  rating?: number;
}

export interface CreateJobPostingPayload {
  position: string;
  departmentId: string;
  description: string;
  requirements?: string[];
  numberOfOpenings?: number;
  closingDate?: string;
  status?: 'open' | 'closed' | 'on-hold';
}

export interface CreateCandidatePayload {
  jobPostingId: string;
  name: string;
  email: string;
  phone?: string;
  source: string;
  status?: 'applied' | 'screening' | 'interview' | 'offered' | 'hired' | 'rejected';
  notes?: string;
}

export interface RecruitmentState {
  jobPostings: JobPosting[];
  candidates: Candidate[];
  interviews: Interview[];
  loading: boolean;
  error: string | null;
}
