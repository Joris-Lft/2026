export type Tracking = {
  id: string;
  title: string;
  completed: boolean;
  type: "day" | "week" | "month";
};

export type PeriodData = {
  key: string;
  trackings: Tracking[];
  period: "day" | "week" | "month";
};
