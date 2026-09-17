import { api } from "./api";

export type DashboardAnalytics = {
  totalRevenue: number;
  upcomingEventsVolume: number;
  totalStaffHours: number;
};

export type AnalyticsResponse = {
  success: boolean;
  data: DashboardAnalytics;
};

/**
 * Fetch dashboard analytics
 */
export async function getDashboardAnalytics(
  token: string
): Promise<DashboardAnalytics> {
  const result = await api<AnalyticsResponse>("/reports/analytics", {
    token,
  });

  return result.data;
}
