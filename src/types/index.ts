export type MigrationStatus = 'idle' | 'running' | 'success' | 'error';

export type StepStatus = 'pending' | 'running' | 'done' | 'error';

export interface MigrationStep {
  id: string;
  label: string;
  status: StepStatus;
}

export interface MigrationState {
  status: MigrationStatus;
  steps: MigrationStep[];
  currentStepIndex: number;
  errorMessage?: string;
  elapsedMs?: number;
}

export interface MigrationFormData {
  hospitalName: string;
  userName: string;
  hospitalId: string;
}
