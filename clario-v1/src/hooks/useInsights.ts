import { useState, useCallback } from "react";
import { generateInsights } from "../features/insights/services/aiService";
import { loadAppData, getFromStorage, setToStorage } from "../utils/localStorage";

export function useInsights() {
  const [insights, setInsights] = useState<string[]>(() =>
    getFromStorage<string[]>("clario_insights", [])
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = loadAppData();
      const result = await generateInsights(data);
      setInsights(result);
    } catch {
      const fallback = ["Unable to analyze right now. Please try again in a moment."];
      setInsights(fallback);
      setToStorage("clario_insights", fallback);
      setError("Generation failed");
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { insights, isLoading, generate, error };
}
