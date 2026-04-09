/** Single data point on the long-term outlook projection curve. */
export interface OutlookDataPoint {
  year: number;
  score: number;
}

/** AI-generated long-term investment outlook for a category. */
export interface CategoryOutlook {
  dataPoints: OutlookDataPoint[];
  bullish: string[];
  bearish: string[];
  summary: string;
  generatedAt: number;
}
