export type BulletStatus = "pending" | "accepted" | "discarded";

export interface BulletImprovementRecord {
  _id?: string;
  id?: string;
  userId: string;
  resumeId: string;
  originalBullet: string;
  targetRole: string;
  jobDescription?: string;
  critique: string;
  suggestions: string[];
  status: BulletStatus;
  selectedSuggestion?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface ImproveBulletInput {
  originalBullet: string;
  targetRole?: string;
  jobDescription?: string;
}

export interface ImproveBulletResponse {
  success: boolean;
  message: string;
  bullet: BulletImprovementRecord;
}

export interface GetBulletHistoryResponse {
  success: boolean;
  count: number;
  bullets: BulletImprovementRecord[];
}

export interface UpdateBulletStatusInput {
  status: BulletStatus;
  selectedSuggestion?: string;
}
