export type ExperimentGroup = "manual" | "ai";

export type ExperimentRecord = {
  id: string;
  flowId: string;
  flowName: string;
  participantId: string;
  caseId: string;
  group: ExperimentGroup;
  startedAt: string;
  endedAt: string;
  durationSeconds: number;
  nodeCount: number;
  edgeCount: number;
  validNodeRatio: number;
  validEdgeRatio: number;
  structuralPrecision: number;
  executionStatus: string;
  aiGenerateCount: number;
  aiRepairCount: number;
};

export type ExperimentAnalyticsSummary = {
  totalRuns: number;
  manualRuns: number;
  aiRuns: number;
  avgManualDurationSeconds: number;
  avgAiDurationSeconds: number;
  avgStructuralPrecision: number;
  executionSuccessRate: number;
  avgAiGeneratePerRun: number;
  avgAiRepairPerRun: number;
  estimatedTimeReductionPercent: number;
};

export const EXPERIMENT_STORAGE_KEY = "capyflow_experiment_records_v1";
export const EXPERIMENT_UPDATED_EVENT = "capyflow:experiment-records-updated";

export function loadExperimentRecords(): ExperimentRecord[] {
  try {
    const raw = localStorage.getItem(EXPERIMENT_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveExperimentRecords(records: ExperimentRecord[]) {
  localStorage.setItem(EXPERIMENT_STORAGE_KEY, JSON.stringify(records));
  window.dispatchEvent(new CustomEvent(EXPERIMENT_UPDATED_EVENT));
}

export function clearExperimentRecords() {
  localStorage.removeItem(EXPERIMENT_STORAGE_KEY);
  window.dispatchEvent(new CustomEvent(EXPERIMENT_UPDATED_EVENT));
}

export function recordsToCsv(records: ExperimentRecord[]) {
  const headers = [
    "id",
    "flowId",
    "flowName",
    "participantId",
    "caseId",
    "group",
    "startedAt",
    "endedAt",
    "durationSeconds",
    "nodeCount",
    "edgeCount",
    "validNodeRatio",
    "validEdgeRatio",
    "structuralPrecision",
    "executionStatus",
    "aiGenerateCount",
    "aiRepairCount",
  ];

  const escapeCell = (value: unknown) => `"${String(value ?? "").replace(/"/g, '""')}"`;

  const lines = records.map((record) =>
    headers.map((header) => escapeCell((record as Record<string, unknown>)[header])).join(","),
  );

  return [headers.join(","), ...lines].join("\n");
}

export function summarizeExperimentRecords(records: ExperimentRecord[]): ExperimentAnalyticsSummary {
  const totalRuns = records.length;
  const manualRunsData = records.filter((record) => record.group === "manual");
  const aiRunsData = records.filter((record) => record.group === "ai");

  const avg = (values: number[]) =>
    values.length === 0 ? 0 : values.reduce((acc, value) => acc + value, 0) / values.length;

  const avgManualDurationSeconds = avg(manualRunsData.map((record) => record.durationSeconds));
  const avgAiDurationSeconds = avg(aiRunsData.map((record) => record.durationSeconds));
  const avgStructuralPrecision = avg(records.map((record) => record.structuralPrecision));
  const successCount = records.filter((record) => record.executionStatus === "success").length;
  const executionSuccessRate = totalRuns === 0 ? 0 : (successCount / totalRuns) * 100;
  const avgAiGeneratePerRun = avg(records.map((record) => record.aiGenerateCount));
  const avgAiRepairPerRun = avg(records.map((record) => record.aiRepairCount));

  const estimatedTimeReductionPercent =
    avgManualDurationSeconds > 0 && avgAiDurationSeconds > 0
      ? ((avgManualDurationSeconds - avgAiDurationSeconds) / avgManualDurationSeconds) * 100
      : 0;

  return {
    totalRuns,
    manualRuns: manualRunsData.length,
    aiRuns: aiRunsData.length,
    avgManualDurationSeconds,
    avgAiDurationSeconds,
    avgStructuralPrecision,
    executionSuccessRate,
    avgAiGeneratePerRun,
    avgAiRepairPerRun,
    estimatedTimeReductionPercent,
  };
}
