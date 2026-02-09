import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getFlexibilityGoals,
  type FlexibilityGoal,
} from '@/lib/api/flexibility-goals';

export type GoalStatus = 'active' | 'completed';

export interface FlexGoal {
  id: string;
  title: string;
  goalType: string;
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

// Map goalType to display info
export const GOAL_TYPE_INFO: Record<string, { title: string; focusAreas: string[] }> = {
  splits: { title: 'Front Splits', focusAreas: ['hamstrings', 'glutes', 'quads', 'lower_back'] },
  middle_splits: { title: 'Middle Splits', focusAreas: ['hamstrings', 'glutes', 'quads'] },
  touch_toes: { title: 'Touch Toes', focusAreas: ['hamstrings', 'lower_back', 'calves'] },
  hip_mobility: { title: 'Hip Mobility', focusAreas: ['glutes', 'hamstrings', 'quads'] },
  shoulder_mobility: { title: 'Shoulder Mobility', focusAreas: ['shoulders', 'upper_back', 'chest'] },
  ankle_mobility: { title: 'Ankle Mobility', focusAreas: ['calves'] },
  general: { title: 'General Flexibility', focusAreas: ['hamstrings', 'glutes', 'shoulders', 'upper_back'] },
};

const DAY_MS = 1000 * 60 * 60 * 24;

export function mapBackendGoal(goal: FlexibilityGoal): FlexGoal {
  const typeInfo = GOAL_TYPE_INFO[goal.goalType] || { title: goal.goalType, focusAreas: [] };
  const measurements = [...(goal.measurements || [])].sort(
    (a, b) => new Date(a.measurementDate).getTime() - new Date(b.measurementDate).getTime()
  );

  const history = measurements.map((m) => m.romDegrees);
  const currentRom =
    measurements.length > 0
      ? measurements[measurements.length - 1].romDegrees
      : goal.baselineRom || 0;
  const lastMeasurement = measurements.length > 0 ? measurements[measurements.length - 1] : null;
  const method = lastMeasurement?.measurementMethod || 'Manual measurement';

  // Compute streak
  let streakDays = 0;
  if (measurements.length > 0) {
    const last = measurements[measurements.length - 1];
    const daysSinceLast = (Date.now() - new Date(last.measurementDate).getTime()) / DAY_MS;
    if (daysSinceLast <= 1.5) {
      streakDays = 1;
      for (let i = measurements.length - 1; i > 0; i--) {
        const diff =
          (new Date(measurements[i].measurementDate).getTime() -
            new Date(measurements[i - 1].measurementDate).getTime()) /
          DAY_MS;
        if (diff <= 1.5) streakDays++;
        else break;
      }
    }
  }

  const checkIns = measurements.map((m) => ({
    date: m.measurementDate,
    rom: m.romDegrees,
    areas: typeInfo.focusAreas,
  }));

  // Target date display
  let targetDateDisplay = '';
  if (goal.targetDate) {
    const d = new Date(goal.targetDate);
    targetDateDisplay = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  // Last check-in label
  let lastCheckIn = 'No check-in yet';
  let lastCheckInAt: string | undefined;
  if (lastMeasurement) {
    lastCheckInAt = lastMeasurement.measurementDate;
    const diffDays = Math.floor(
      (Date.now() - new Date(lastMeasurement.measurementDate).getTime()) / DAY_MS
    );
    if (diffDays <= 0) lastCheckIn = 'Today';
    else if (diffDays === 1) lastCheckIn = 'Yesterday';
    else lastCheckIn = `${diffDays} days ago`;
  }

  return {
    id: goal.id,
    title: typeInfo.title,
    goalType: goal.goalType,
    targetDate: targetDateDisplay,
    targetArea: goal.targetArea,
    focusAreas: typeInfo.focusAreas,
    baselineRom: goal.baselineRom || 0,
    currentRom,
    targetRom: goal.targetRom || 0,
    sessionsCompleted: measurements.length,
    streakDays,
    lastCheckIn,
    lastCheckInAt,
    method,
    history: history.length > 0 ? history : [goal.baselineRom || 0],
    checkIns,
    status: (goal.status as GoalStatus) || 'active',
    createdAt: goal.createdAt,
  };
}

interface GoalsState {
  goals: FlexGoal[];
  loading: boolean;
  addGoal: (goal: FlexGoal) => void;
  updateGoal: (id: string, updates: Partial<FlexGoal>) => void;
  completeGoal: (id: string) => void;
  fetchGoals: () => Promise<void>;
}

export const useGoalsStore = create<GoalsState>()(
  persist(
    (set) => ({
      goals: [],
      loading: false,
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
            goal.id === id ? { ...goal, status: 'completed' as GoalStatus } : goal
          ),
        })),
      fetchGoals: async () => {
        set({ loading: true });
        try {
          const [activeRes, completedRes] = await Promise.all([
            getFlexibilityGoals('active'),
            getFlexibilityGoals('completed'),
          ]);
          const allGoals = [...activeRes.goals, ...completedRes.goals];
          const mapped = allGoals.map(mapBackendGoal);
          set({ goals: mapped });
        } catch (error) {
          console.error('Failed to fetch goals:', error);
        } finally {
          set({ loading: false });
        }
      },
    }),
    {
      name: 'goals-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ goals: state.goals }),
    }
  )
);
