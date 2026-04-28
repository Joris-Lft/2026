export type HabitFrequency = "daily" | "weekly" | "monthly";

export interface Habit {
  id: string;
  user_id: string;
  name: string;
  frequency: HabitFrequency;
  [key: string]: any;
}

export interface CreateHabitInput {
  name: string;
  frequency: HabitFrequency;
  createdAt: string;
  [key: string]: any;
}

export interface UpdateHabitInput {
  id: string;
  name?: string;
  frequency?: HabitFrequency;
  createdAt?: string;
  [key: string]: any;
}

export interface HabitLog {
  id: string;
  habit_id: string;
  user_id: string;
  completed_at: string;
  frequency: HabitFrequency;
  period: string;
  [key: string]: any;
}

export interface CreateHabitLogInput {
  habit_id: string;
  user_id: string;
  completed_at?: string;
  frequency: HabitFrequency;
  period: string;
}
