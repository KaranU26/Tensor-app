/**
 * Page Transitions
 * Custom page transition animations for navigation
 */

import {
  FadeIn,
  FadeOut,
  SlideInRight,
  SlideOutLeft,
  SlideInUp,
  SlideOutDown,
  ZoomIn,
  ZoomOut,
  FadeInDown,
  FadeOutUp,
} from 'react-native-reanimated';

// ============================================
// Screen Transition Presets
// ============================================

/**
 * Slide from right (default push)
 */
export const slideFromRight = {
  entering: SlideInRight.springify().damping(18).stiffness(180),
  exiting: SlideOutLeft.springify().damping(18).stiffness(180),
};

/**
 * Slide from bottom (modal style)
 */
export const slideFromBottom = {
  entering: SlideInUp.springify().damping(20).stiffness(200),
  exiting: SlideOutDown.springify().damping(20).stiffness(200),
};

/**
 * Fade transition
 */
export const fade = {
  entering: FadeIn.duration(300),
  exiting: FadeOut.duration(200),
};

/**
 * Zoom transition (for dialogs)
 */
export const zoom = {
  entering: ZoomIn.springify().damping(15),
  exiting: ZoomOut.duration(200),
};

/**
 * Fade slide down (for dropdowns/menus)
 */
export const fadeSlideDown = {
  entering: FadeInDown.springify().damping(15),
  exiting: FadeOutUp.duration(200),
};

// ============================================
// Stack Navigator Transition Options
// ============================================

export const screenTransitionOptions = {
  // Default push transition
  push: {
    animation: 'slide_from_right' as const,
    animationDuration: 350,
  },
  
  // Modal presentation
  modal: {
    animation: 'slide_from_bottom' as const,
    presentation: 'modal' as const,
    animationDuration: 400,
  },
  
  // Full screen modal
  fullScreenModal: {
    animation: 'slide_from_bottom' as const,
    presentation: 'fullScreenModal' as const,
    animationDuration: 400,
  },
  
  // Fade transition (for tabs)
  fade: {
    animation: 'fade' as const,
    animationDuration: 200,
  },
  
  // Card style (iOS)
  card: {
    animation: 'ios' as const,
  },
};

// ============================================
// Tab Bar Transition Helpers
// ============================================

/**
 * Get animation for tab switching
 */
export function getTabAnimation(fromIndex: number, toIndex: number) {
  const direction = toIndex > fromIndex ? 'right' : 'left';
  
  return {
    entering: direction === 'right' 
      ? SlideInRight.duration(200)
      : FadeIn.duration(200),
    exiting: direction === 'right'
      ? SlideOutLeft.duration(200)
      : FadeOut.duration(200),
  };
}

export default {
  slideFromRight,
  slideFromBottom,
  fade,
  zoom,
  fadeSlideDown,
  screenTransitionOptions,
  getTabAnimation,
};
