import { Department, Employee } from './employee';

export interface OrganizationSetting {
  _id: string;
  organizationName: string;
  email: string;
  phone?: string;
  address?: string;
  workingDays: number[];
  logoUrl?: string;
}

export interface TeamMember {
  employeeId: string | Employee;
}

export interface Team {
  _id: string;
  teamName: string;
  teamLeadId?: string | Employee;
  teamMembers: TeamMember[];
}

export interface OrganizationState {
  settings: OrganizationSetting | null;
  departments: Department[];
  teams: Team[];
  loading: boolean;
  error: string | null;
}
