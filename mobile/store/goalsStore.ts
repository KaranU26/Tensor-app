import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type GoalStatus = 'active' | 'completed';

export interface FlexGoal {
  id: string;
  title: string;
  targetDate: string;
  targetArea: string;
  focusAreas: string[];
  baselineRom: number;
  currentRom: number;
  targetRom: number;
  sessionsCompleted: number;
  streakDays: number;
  lastCheckIn: string;
  lastCheckInAt?: string;
  method: string;
  history: number[];
  checkIns: Array<{
    date: string;
    rom: number;
    areas: string[];
  }>;
  status: GoalStatus;
  createdAt: string;
}

interface GoalsState {
  goals: FlexGoal[];
  addGoal: (goal: FlexGoal) => void;
  updateGoal: (id: string, updates: Partial<FlexGoal>) => void;
  completeGoal: (id: string) => void;
}

export const useGoalsStore = create<GoalsState>()(
  persist(
    (set) => ({
      goals: [],
      addGoal: (goal) =>
        set((state) => ({
          goals: [goal, ...state.goals],
        })),
      updateGoal: (id, updates) =>
        set((state) => ({
          goals: state.goals.map((goal) =>
            goal.id === id ? { ...goal, ...updates } : goal
          ),
        })),
      completeGoal: (id) =>
        set((state) => ({
          goals: state.goals.map((goal) =>
            goal.id === id ? { ...goal, status: 'completed' } : goal
          ),
        })),
    }),
    {
      name: 'goals-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
