export interface AnalyticsReport {
  totalRevenue: number;
  totalExpenses: number;
  netMargin: number;
  totalEvents: number;
  totalEstimates: number;
  pendingEstimates: number;
  totalStaffHours: number;
  eventStatusDistribution: Record<string, number>;
  estimateStatusDistribution: Record<string, number>;
}
