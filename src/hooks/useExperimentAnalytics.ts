import { useEffect, useMemo, useState } from "react";
import {
  EXPERIMENT_UPDATED_EVENT,
  loadExperimentRecords,
  summarizeExperimentRecords,
  type ExperimentRecord,
} from "../lib/experimentAnalytics";

export function useExperimentAnalytics() {
  const [records, setRecords] = useState<ExperimentRecord[]>([]);

  useEffect(() => {
    setRecords(loadExperimentRecords());

    const refresh = () => {
      setRecords(loadExperimentRecords());
    };

    window.addEventListener(EXPERIMENT_UPDATED_EVENT, refresh);
    window.addEventListener("storage", refresh);

    return () => {
      window.removeEventListener(EXPERIMENT_UPDATED_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const summary = useMemo(() => summarizeExperimentRecords(records), [records]);

  return { records, summary };
}
