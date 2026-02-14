export type Measurement = {
  id: string;
  date: string;
  thigh: number;
  arm: number;
  chest: number;
  waist: number;
  hip: number;
  weight: number;
};

export type CreateMeasurementInput = Omit<Measurement, "id" | "date">;

export type MeasurementKey = keyof Omit<Measurement, "id" | "date">;

export type MeasurementType = {
  key: MeasurementKey;
  label: string;
};
