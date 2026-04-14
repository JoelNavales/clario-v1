import { useState, useCallback } from "react";
import { generateInsights } from "../features/insights/services/aiService";
import { loadAppData, getFromStorage } from "../utils/localStorage";

export function useInsights() {
  const [insights, setInsights] = useState<string[]>(() =>
    getFromStorage<string[]>("clario_insights", [])
  );
  const [isLoading, setIsLoading] = useState(false);

  const generate = useCallback(() => {
    setIsLoading(true);
    setTimeout(() => {
      const data = loadAppData();
      const result = generateInsights(data);
      setInsights(result);
      setIsLoading(false);
    }, 600);
  }, []);

  return { insights, isLoading, generate };
}
