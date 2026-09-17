"use client";

import { useCallback, useEffect, useState } from "react";
import { getDashboardAnalytics, type DashboardAnalytics } from "@/lib/report.api";

export const useReports = ({ token, autoFetch = true }: { token: string | null; autoFetch?: boolean }) => {
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await getDashboardAnalytics(token);
      setAnalytics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch analytics");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (autoFetch && token) {
      fetchAnalytics();
    }
  }, [autoFetch, token, fetchAnalytics]);

  return {
    analytics,
    loading,
    error,
    fetchAnalytics,
  };
};
