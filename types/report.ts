import { AuthUser } from './auth';

export interface Report {
  _id: string;
  reportName: string;
  category: string;
  generatedBy: string | AuthUser;
  lastGenerated: string;
  fileUrl?: string;
}

export interface CreateReportPayload {
  reportName: string;
  category: string;
  fileUrl?: string;
}

export interface ReportState {
  reports: Report[];
  loading: boolean;
  error: string | null;
}
