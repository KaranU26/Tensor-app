/**
 * Error Messages - Empathetic Micro-copy
 * 
 * Research: "Generic error messages break immersion...
 * custom, empathetic micro-copy maintains brand narrative"
 */

// Error types
export type ErrorType = 
  | 'network'
  | 'server'
  | 'auth'
  | 'validation'
  | 'not_found'
  | 'permission'
  | 'sync'
  | 'timeout'
  | 'unknown';

interface ErrorMessage {
  title: string;
  message: string;
  action?: string;
  emoji?: string;
}

/**
 * Get empathetic error message for a given error type
 */
export function getErrorMessage(type: ErrorType, context?: string): ErrorMessage {
  const messages: Record<ErrorType, ErrorMessage> = {
    network: {
      title: "We're having trouble connecting",
      message: "Your progress is saved locally. We'll sync when you're back online.",
      action: "Try again",
      emoji: "📡",
    },
    server: {
      title: "Something went wrong on our end",
      message: "Our team has been notified. Your workout data is safe.",
      action: "Retry",
      emoji: "🔧",
    },
    auth: {
      title: "Session expired",
      message: "For your security, please sign in again to continue.",
      action: "Sign in",
      emoji: "🔐",
    },
    validation: {
      title: "Let's fix that",
      message: context || "Please check your input and try again.",
      emoji: "✏️",
    },
    not_found: {
      title: "Couldn't find that",
      message: context || "The item you're looking for may have been moved or deleted.",
      emoji: "🔍",
    },
    permission: {
      title: "Permission needed",
      message: "We need access to continue. You can update this in Settings.",
      action: "Open Settings",
      emoji: "🔒",
    },
    sync: {
      title: "Sync conflict detected",
      message: "We found newer data on another device. Which version should we keep?",
      action: "Review changes",
      emoji: "🔄",
    },
    timeout: {
      title: "Taking longer than expected",
      message: "The connection is slow. Your data is queued and will sync shortly.",
      action: "Wait",
      emoji: "⏳",
    },
    unknown: {
      title: "Something unexpected happened",
      message: "We're not sure what went wrong, but your data is safe.",
      action: "Try again",
      emoji: "🤔",
    },
  };

  return messages[type] || messages.unknown;
}

/**
 * Empty state messages - motivational and contextual
 */
export type EmptyStateType = 
  | 'workouts'
  | 'exercises'
  | 'routines'
  | 'stats'
  | 'history'
  | 'search'
  | 'favorites'
  | 'achievements'
  | 'flexibility';

interface EmptyStateMessage {
  title: string;
  message: string;
  action?: string;
  emoji: string;
}

export function getEmptyStateMessage(type: EmptyStateType): EmptyStateMessage {
  const messages: Record<EmptyStateType, EmptyStateMessage> = {
    workouts: {
      title: "Your training journey starts here",
      message: "Log your first workout and watch your progress unfold.",
      action: "Start workout",
      emoji: "💪",
    },
    exercises: {
      title: "No exercises yet",
      message: "Add exercises to build your perfect routine.",
      action: "Browse exercises",
      emoji: "🏋️",
    },
    routines: {
      title: "Create your first routine",
      message: "Design a custom routine or use our smart generator.",
      action: "Create routine",
      emoji: "📋",
    },
    stats: {
      title: "Stats unlock after your first workout",
      message: "Complete a session to see your progress visualized.",
      emoji: "📊",
    },
    history: {
      title: "Your workout history will appear here",
      message: "Keep training to build your legacy.",
      emoji: "📅",
    },
    search: {
      title: "No results found",
      message: "Try adjusting your search or browse categories.",
      emoji: "🔍",
    },
    favorites: {
      title: "No favorites yet",
      message: "Heart exercises you love for quick access.",
      emoji: "❤️",
    },
    achievements: {
      title: "Achievements await",
      message: "Train consistently to unlock badges and milestones.",
      emoji: "🏆",
    },
    flexibility: {
      title: "Your flexibility journey starts here",
      message: "Set a goal and track ROM improvements over time.",
      action: "Create goal",
      emoji: "🤸",
    },
  };

  return messages[type];
}

/**
 * Success messages - celebration and reinforcement
 */
export type SuccessType = 
  | 'workout_complete'
  | 'pr_achieved'
  | 'streak'
  | 'goal_reached'
  | 'sync_complete'
  | 'saved';

interface SuccessMessage {
  title: string;
  message: string;
  emoji: string;
}

export function getSuccessMessage(type: SuccessType, context?: { value?: number; name?: string }): SuccessMessage {
  const messages: Record<SuccessType, SuccessMessage> = {
    workout_complete: {
      title: "Workout Complete! 🎉",
      message: "Another session in the books. Great work!",
      emoji: "🎉",
    },
    pr_achieved: {
      title: "New Personal Record! 🏆",
      message: context?.name 
        ? `You crushed your ${context.name} PR!` 
        : "You just set a new personal best!",
      emoji: "🏆",
    },
    streak: {
      title: `${context?.value || 7} Day Streak! 🔥`,
      message: "Consistency is key. Keep it going!",
      emoji: "🔥",
    },
    goal_reached: {
      title: "Goal Achieved! ⭐",
      message: "You did it! Time to set a new target.",
      emoji: "⭐",
    },
    sync_complete: {
      title: "All synced",
      message: "Your data is up to date across all devices.",
      emoji: "✅",
    },
    saved: {
      title: "Saved",
      message: "Your changes have been saved.",
      emoji: "💾",
    },
  };

  return messages[type];
}

/**
 * Loading messages - contextual waiting states
 */
export function getLoadingMessage(context?: string): string {
  const messages = [
    "Loading your data...",
    "Crunching the numbers...",
    "Getting everything ready...",
    "Almost there...",
  ];
  
  if (context) return context;
  return messages[Math.floor(Math.random() * messages.length)];
}

export default {
  getErrorMessage,
  getEmptyStateMessage,
  getSuccessMessage,
  getLoadingMessage,
};
