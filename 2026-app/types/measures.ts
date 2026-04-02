export type Measure = {
  id: string;
  date: string;
  thigh: number;
  arm: number;
  bust: number;
  waist: number;
  hip: number;
  weight: number;
};

export type CreateMeasureInput = Omit<Measure, "id" | "date">;

export type UpdateMeasureInput = Measure;

export type MeasureKey = keyof Omit<Measure, "id" | "date">;

export type MeasureType = {
  key: MeasureKey;
  label: string;
};
