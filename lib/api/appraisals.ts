import { apiClient } from './client'

export type ReviewStage = 'self_review' | 'manager_review' | 'calibration' | 'completed'

export async function submitSelfReview(
  appraisalId: string,
  input: { comment: string; rating?: number },
): Promise<void> {
  await apiClient.patch(`/appraisals/${appraisalId}/self-review`, input)
}

export async function submitManagerReview(
  appraisalId: string,
  input: { comment: string; rating?: number },
): Promise<void> {
  await apiClient.patch(`/appraisals/${appraisalId}/manager-review`, input)
}

export async function calibrateAppraisal(
  appraisalId: string,
  input: { note: string; rating?: number },
): Promise<void> {
  await apiClient.patch(`/appraisals/${appraisalId}/calibrate`, input)
}

export async function lockAppraisal(appraisalId: string): Promise<void> {
  await apiClient.patch(`/appraisals/${appraisalId}/lock`, {})
}
