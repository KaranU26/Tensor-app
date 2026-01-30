# COMPLETE FITNESS COMPANION APP SPECIFICATION
## Stretching + Advanced Analytics + Strength Tracking

**Project Name:** Fitness Companion (Hevy Competitor)  
**Status:** MVP Phase - Feature Specification  
**Target Launch:** 4 months  
**Created:** January 28, 2026

---

## TABLE OF CONTENTS

1. [Executive Summary](#executive-summary)
2. [Market Analysis](#market-analysis)
3. [Feature Specification](#feature-specification)
4. [Technical Architecture](#technical-architecture)
5. [Data Models](#data-models)
6. [API Design](#api-design)
7. [Implementation Timeline](#implementation-timeline)
8. [Deployment & Scaling](#deployment--scaling)

---

## EXECUTIVE SUMMARY

### What We're Building

A comprehensive fitness application that combines strength training logging, stretching routines, and advanced analytics. Our competitive advantage is being the **first app to integrate strength + stretching + recovery** in one seamless experience.

### Why This App Wins

**Hevy's Gap:** 5M+ users, no stretching/flexibility features, users request it constantly.  
**Our Advantage:** Stretching library + ROM tracking + recovery analytics (features Hevy lacks).  
**Market Position:** "Hevy + Complete Flexibility = One App for Everything"

### Target User

- Fitness enthusiasts (beginners to advanced)
- Recovery-focused athletes (want flexibility + strength)
- Coaches and personal trainers
- Anyone who wants injury prevention

### MVP Scope (4 months)

- ✅ Strength workout logging (match Hevy quality)
- ✅ Stretching routine library (45 pre-built routines)
- ✅ Flexibility goal tracking (ROM progress)
- ✅ Advanced analytics (volume, consistency, recovery)
- ✅ Social features (follow friends, share)
- ✅ iOS + Android launch

### Business Model

- **Free Tier:** Unlimited logging + 4 custom routines (unlimited stretching/workouts)
- **Pro ($2.99-3.99/month or $23.99/year):** Unlimited routines + advanced analytics + AI recommendations
- **Lifetime ($74.99):** One-time payment for Pro features forever

**Revenue Projections:**
- Year 1: 50K users, $8K-12K MRR (10% paid)
- Year 2: 250K users, $45K-60K MRR (18% paid)
- Year 3: 1M users, $200K+ MRR (20% paid)

---

## MARKET ANALYSIS

### Hevy's Dominance

**Stats:**
- 5M+ downloads
- 8+ million monthly active users
- 4.9★ rating on iOS
- $2.99-3.99/month or $23.99/year pricing
- Free tier is genuinely functional
- Backed by Series A funding

**What Hevy Does Exceptionally:**
1. **Simplicity** - Minimalist interface, zero learning curve
2. **Strength Tracking** - 200+ exercises, form videos, real-time PRs
3. **Community** - Follow friends, see their PRs, accountability
4. **Apple Watch** - Best-in-class wearable integration
5. **Pricing** - Lifetime option ($74.99) users love

### Hevy's Critical Gaps

1. **NO Stretching/Mobility** (Biggest opportunity)
   - Users mention this in every review
   - "Wish there was stretching built-in"
   - Have to use separate app (Pliability, StretchIt, Flexy)

2. **NO Nutrition Tracking**
   - Coaches note this as limiting
   - No macro integration
   - Users must switch apps for nutrition

3. **Limited Advanced Analytics**
   - Basic graphs only
   - No body composition tracking
   - No recovery metrics
   - No HRV or sleep integration

4. **Limited Coaching Features**
   - Can't input client workouts in-person
   - No messaging/feedback
   - No automation

5. **Internet Dependency**
   - Offline capabilities limited
   - Strong app is better for this

### Competitive Landscape

| App | Pricing | Strengths | Weaknesses |
|-----|---------|-----------|-----------|
| **Hevy** | $23.99/yr | Best UX, community, simplicity | No stretching, no nutrition |
| **Strong** | $29.99/yr | Offline, CSV export, precise | Older UI, no social, smaller community |
| **Fitbod** | $79.99/yr | AI progression, analytics | Most expensive, less social |
| **GymGod** | $1/month | Modern, AI adaptation | Newer, less established |
| **StrengthLog** | Premium | Structured programs | Paid, smaller community |
| **Pliability** | $14.99/mo | Stretching focused | Stretching only, not integrated |
| **StretchIt** | Free+ | Stretching library | Stretching only, limited analytics |

### Our Competitive Advantages

| Feature | Hevy | Your App |
|---------|------|----------|
| Strength Tracking | ✅ Excellent | ✅ Match quality |
| **Stretching** | ❌ None | ✅✅ 45+ routines |
| Flexibility Goals | ❌ None | ✅ ROM tracking |
| Recovery Metrics | ❌ None | ✅ Recovery score |
| Body Composition | ❌ None | ✅ Track weight/BF% |
| Advanced Analytics | ⚠️ Basic | ✅ Advanced |
| Social Features | ✅ Excellent | ✅ Match Hevy |
| Apple Watch | ✅ Best | ✅ Match quality |
| Price | $23.99/yr | $23.99/yr |

---

## FEATURE SPECIFICATION

### 1. STRETCHING MODULE

#### 1.1 Stretching Routine Library

**Pre-built Routines: 45 total**

| Category | Count | Examples |
|----------|-------|----------|
| Post-Workout Recovery | 12 | Post-Leg, Post-Upper, Post-Chest/Shoulders, Post-Cardio, 5-min Quick |
| Morning Routines | 8 | 10-min Energy, 20-min Full Wake-up, Stiff Back Relief, Hip Mobility |
| Evening/Bedtime | 8 | 15-min Wind Down, Sleep Prep, Lower Back Relax, Hip Opener |
| Sport-Specific | 10 | Runner, Climber, Cyclist, Swimmer, Weightlifter routines |
| Mobility Work | 5 | Dynamic Warm-up, Hip, Shoulder, Thoracic, Ankle Mobility |
| Office/Desk | 2 | 5-min Desk Break, Posture Correction |

**Routine Data Structure:**
```
STRETCHING_ROUTINE = {
  id: uuid,
  name: "Post-Leg Day Recovery",
  description: "5-min routine for leg recovery",
  
  duration_seconds: 300,
  difficulty: "beginner",
  target_areas: ["hamstrings", "quads", "hips", "glutes"],
  
  stretches: [
    {
      stretch_id: uuid,
      order: 1,
      duration_seconds: 30,
      custom_duration: null (user can override)
    },
    ... (5 total stretches per routine)
  ],
  
  is_public: true,
  created_by: "system",
  uses_count: 15000,
  
  tags: ["recovery", "legs", "post-workout"]
}
```

#### 1.2 Individual Stretch Library

**Total Stretches: 80 core stretches**

Each stretch includes:
```
STRETCH = {
  id: uuid,
  name: "Hamstring Stretch (Supine)",
  
  # Video & Media
  video_url: "https://cdn.app.com/stretches/hamstring-supine.mp4",
  video_duration_seconds: 45,
  thumbnail_url: "https://cdn.app.com/hamstring-supine-thumb.jpg",
  
  muscle_animation_url: "https://cdn.app.com/muscle-maps/hamstring-highlighted.svg",
  animated_gif_url: "https://cdn.app.com/hamstring-animation.gif",
  
  # Metadata
  duration_seconds: 30,
  difficulty: "beginner",
  
  target_muscles: {
    primary: "hamstrings",
    secondary: ["glutes", "lower_back"],
    tertiary: ["calves"]
  },
  
  # Instructions
  instructions: {
    setup: "Lie on your back, legs extended",
    execution: "Lift one leg, grab behind thigh or calf, gently pull toward chest",
    breathing: "Breathe deeply, exhale into the stretch",
    
    modifications: [
      {
        type: "easier",
        description: "Bend knee slightly or use strap"
      },
      {
        type: "harder",
        description: "Keep leg straight, pull more aggressively"
      }
    ]
  },
  
  # Safety & Common Mistakes
  common_mistakes: [
    "Bouncing instead of static hold",
    "Rounding lower back too much",
    "Pulling neck forward"
  ],
  safety_notes: [
    "Stop if you feel sharp pain",
    "Don't overstretch if injured"
  ],
  
  # Equipment
  equipment_needed: ["none"],
  
  # Tagging
  tags: ["hamstring", "hip", "flexibility", "recovery", "post_workout"],
  
  suitability: {
    beginners: true,
    athletes: true,
    desk_workers: true,
    post_workout: true,
    pre_workout: false
  }
}
```

**Complete Stretch Breakdown:**

**Lower Body (25 stretches):**
- Hamstring (standing, seated, supine, half-splits, banded)
- Quad (standing, lying, with hip opener)
- Hip Flexor (lunge, standing, kneeling)
- Glute/Pigeon (multiple variations)
- IT Band (standing, lying)
- Hip Opener (butterfly, deep squat, lizard pose)
- Calf (wall, step, downward dog)
- Inner Thigh/Groin
- Ankle/Feet stretches
- Combinations (full leg stretches)

**Upper Body (25 stretches):**
- Shoulder (cross-body, overhead, pendulum, sleeper)
- Chest (doorway, wall, supine, assisted)
- Tricep (overhead, behind back)
- Forearm/Wrist (wall, hand clasp, circles)
- Neck (lateral, forward, diagonal, rotation)
- Lat/Back (overhead reach, child's pose)
- Thoracic Rotation
- Scapular/Upper Back
- Pec/Serratus stretches
- Rotator Cuff (multiple angles)

**Full Body/Flow (20 stretches):**
- Standing Forward Fold
- Downward Dog
- Warrior Poses (I, II, III)
- Extended Side Angle
- Pyramid Pose
- Standing Split
- Sun Salutation Flow
- Supine Full Body Stretch
- Table Top variations
- Yoga flows
- PNF stretches
- Dynamic warm-up combos

#### 1.3 Stretching Session Logging

When user completes a stretching routine:

```
STRETCHING_SESSION = {
  id: uuid,
  user_id: uuid,
  routine_id: uuid,
  routine_name: "Post-Leg Day Recovery",
  
  # Timing
  started_at: "2026-01-28T14:30:00Z",
  completed_at: "2026-01-28T14:35:42Z",
  duration_seconds: 342,
  
  # Individual Stretch Details
  stretches: [
    {
      stretch_id: uuid,
      stretch_name: "Hamstring Stretch (Supine)",
      
      held_duration_seconds: 35,
      prescribed_duration_seconds: 30,
      
      # User Feedback
      felt_tight: true,
      achieved_rom_improvement: false,
      notes: "Left side much tighter than right",
      
      completed_at: "2026-01-28T14:30:15Z",
      position_in_routine: 1
    },
    ... (4 more stretches)
  ],
  
  # Session Metadata
  overall_notes: "Good recovery session after heavy legs",
  completed: true,
  marked_as_recovery: true,
  linked_workout_id: "workout_uuid_12345",
  
  # Metrics
  average_hold_time: 32,
  tight_areas_identified: ["hamstrings", "hips"]
}
```

#### 1.4 Real-time Timer UI

When user starts a stretch:

```
TIMER_SCREEN = {
  # Video
  video: {
    auto_plays: true,
    shows_form_cues: true,
    has_pause_button: true,
    loops_if_extended: true
  },
  
  # Timer
  timer: {
    recommended_seconds: 30,
    current_seconds: 25,
    user_can_extend: true,
    
    haptic_feedback: true (vibrate at end),
    audio_cue: true (optional),
    countdown_display: true
  },
  
  # Muscle Visualization
  muscle_animation: {
    highlighted_muscle: animated SVG,
    shows_primary_secondary_tertiary: true
  },
  
  # Coaching Text
  coaching_tip: "Breathe deeply. Relax into the stretch. No bouncing.",
  
  # Action Buttons
  buttons: {
    "Too Easy": skips timer,
    "Too Tight": logs ROM limitation,
    "Skip": moves to next stretch,
    "+15 sec": extends timer,
    "Done": completes stretch
  }
}
```

#### 1.5 Custom Routine Creation

Users can build custom stretching routines:

```
CUSTOM_ROUTINE = {
  id: uuid,
  user_id: uuid,
  
  name: "My Evening Wind-Down",
  description: "Personal relaxation routine",
  
  stretches: [
    { stretch_id: uuid, order: 1, duration_override: null },
    ... (user-selected stretches)
  ],
  
  total_duration: 15 * 60, (minutes)
  target_areas: ["neck", "shoulders", "back", "hips"],
  difficulty: "beginner",
  
  is_public: false,
  created_at: "2026-01-28T10:00:00Z",
  updated_at: "2026-01-28T10:00:00Z"
}
```

### 2. FLEXIBILITY GOAL TRACKING

#### 2.1 Goal Types

```
FLEXIBILITY_GOAL = {
  id: uuid,
  user_id: uuid,
  
  goal_type: enum[
    "achieve_full_splits",
    "touch_toes",
    "improve_hamstring_rom",
    "improve_hip_mobility",
    "shoulder_mobility",
    "general_flexibility",
    "sport_specific",
    "injury_rehab"
  ],
  
  description: "Achieve full front splits",
  target_area: "hamstrings_hips",
  
  # ROM Tracking
  baseline_rom: 60 (degrees),
  target_rom: 180,
  
  # Timeline
  created_at: "2026-01-28T10:00:00Z",
  target_date: "2026-05-28",
  days_remaining: 120,
  
  # Progress
  current_progress_percentage: 45,
  stretching_sessions_completed: 24,
  
  # Assessment Method
  assessment_method: enum[
    "video_comparison",
    "measurement",
    "self_assessment"
  ],
  
  status: enum["active", "paused", "completed", "failed"],
  difficulty: enum["easy", "moderate", "challenging"]
}
```

#### 2.2 ROM Measurement Tracking

**Method 1: Video Comparison**
```
- User records baseline video (hamstrings at 60° ROM)
- Records angle from side/front
- Once per month: record new video
- App overlays and compares ROM visually
- Shows "15° improvement in 8 weeks!"
```

**Method 2: Manual Measurement**
```
ROM_MEASUREMENT = {
  goal_id: uuid,
  muscle_group: "hamstrings",
  rom_degrees: 75,
  measurement_date: "2026-01-28",
  measurement_method: "self_measured_with_protractor",
  
  notes: "Used phone protractor app",
  
  change_from_last: 5 (degrees),
  change_percentage: 7,
  trend: "improving"
}
```

**Method 3: Self-Assessment**
```
Weekly Check-in:
- "How close to touching your toes? (0-10)"
- "Can you do full splits? (Yes/No/Almost)"
- "Flexibility feels: Tight / Moderate / Loose"
- Logged with date
```

#### 2.3 Goal Dashboard

```
FLEXIBILITY_DASHBOARD = {
  active_goals: [
    {
      name: "Full Splits",
      progress_bar: 45%,
      target_date: "2026-05-28",
      days_remaining: 120,
      
      baseline_rom: 60°,
      current_rom: 75°,
      improvement: 25%,
      
      stretching_sessions: 24 completed out of 28 recommended,
      consistency_streak: 12 days,
      
      on_track: true,
      estimated_completion: "2026-05-10",
      
      # Recommendations
      "You're on pace to hit splits by May 10th!"
    }
  ]
}
```

### 3. ADVANCED ANALYTICS

#### 3.1 Flexibility Analytics

**ROM Progress Visualization:**
```
ROM_PROGRESS_GRAPH = {
  time_period: enum["week", "month", "quarter", "year", "all_time"],
  
  data_series: {
    hamstring_rom: line_chart (improving 60° → 85°),
    hip_flexor_rom: line_chart (improving 45° → 65°),
    shoulder_rom: line_chart (stable 120° → 125°),
    overall_flexibility_score: line_chart (composite)
  },
  
  insights: [
    "Your hamstring flexibility improved 25° in 8 weeks",
    "Left shoulder ROM improving faster than right",
    "Plateauing in hip mobility - try new stretches"
  ],
  
  breakdown_by_muscle: {
    hamstrings: {
      baseline: 60°,
      current: 85°,
      improvement: 25°,
      improvement_percent: 42%,
      trend: "improving ↑",
      sessions_logged: 24
    },
    # ... repeat for all tracked muscle groups
  }
}
```

#### 3.2 Stretching Consistency

```
CONSISTENCY_ANALYTICS = {
  time_period: "month",
  
  # Core metrics
  stretching_days: 18 out of 30,
  consistency_percentage: 60%,
  stretching_minutes: 1200 minutes (20 hours),
  
  # Streaks
  current_streak: 12 days,
  longest_streak: 25 days,
  
  # Frequency
  sessions_per_week: 4.5,
  average_session_duration: 12 minutes,
  favorite_routine: "Post-Leg Day Recovery",
  most_stretched_area: "hamstrings",
  
  # Trend
  vs_last_month: "↑ 15% more stretching",
  vs_goal: "On track for 5x/week goal"
}
```

**Consistency Calendar View:**
```
MONTHLY_CALENDAR = {
  Each day shows:
  - Stretching circle (empty/light/good/excellent)
  - Minutes logged
  - Tap for details
  
  Visual indicators:
  Gray = no stretching
  Light Blue = < 10 min
  Blue = 10-30 min
  Dark Blue = 30+ min
}
```

#### 3.3 Workout + Recovery Integration

```
RECOVERY_ANALYTICS = {
  time_period: "month",
  
  # Workout metrics
  total_strength_workouts: 12,
  total_volume: 487500 lbs,
  
  # Recovery metrics
  stretching_sessions_post_workout: 8 out of 12,
  percentage_workouts_with_recovery: 67%,
  
  # By muscle group
  muscle_recovery_status: {
    chest: {
      last_workout: "2026-01-27",
      days_since: 1,
      recommended_recovery_days: 2,
      adequate_recovery: false,
      next_recommended_date: "2026-01-29"
    },
    # ... repeat for all muscle groups
  },
  
  # Recovery Score
  recovery_score: 78 out of 100,
  status: "good",
  
  insights: [
    "You stretched 2 hours after every leg workout this week (excellent!)",
    "Missing upper back stretching despite training 3 days ago"
  ]
}
```

#### 3.4 Body Metrics Tracking

```
BODY_METRICS = {
  weight: {
    current: 185 lbs,
    change_this_month: -5 lbs,
    change_percent: -2.6%,
    trend: "↓ losing weight"
  },
  
  body_fat: {
    current: 18%,
    change_this_month: -1%,
    trend: "↓ decreasing"
  },
  
  measurements: {
    chest: 38.5 inches,
    waist: 32 inches,
    hips: 38 inches,
    arms: 14 inches,
    thighs: 23 inches
  },
  
  graphs: {
    weight_trend: line_chart (3-month moving average),
    body_fat_trend: line_chart,
    body_comp_comparison: "Losing fat while maintaining muscle"
  }
}
```

#### 3.5 Strength Volume Analytics

```
VOLUME_ANALYTICS = {
  time_period: "month",
  
  total_volume: 487500 lbs,
  vs_last_month: "↑ 12% increase",
  
  by_muscle_group: {
    chest: { volume: 87500 lbs, percentage: 18% },
    back: { volume: 109375 lbs, percentage: 22% },
    shoulders: { volume: 73125 lbs, percentage: 15% },
    biceps: { volume: 48750 lbs, percentage: 10% },
    triceps: { volume: 36750 lbs, percentage: 8% },
    legs: { volume: 146250 lbs, percentage: 30% },
    core: { volume: 19375 lbs, percentage: 4% }
  },
  
  volume_progression_graph: line_chart showing upward trend,
  
  insights: [
    "Legs 2x upper body volume - good for strength",
    "Exercise variety up 15% this month"
  ]
}
```

#### 3.6 Smart Insights Engine

```
INSIGHTS_DASHBOARD = {
  insights: [
    {
      type: "achievement",
      message: "Hamstring flexibility +20° in 6 weeks! 🎉",
      actionable: false
    },
    {
      type: "concern",
      message: "Left shoulder ROM stuck for 3 weeks",
      action: "Try these 3 new shoulder stretches",
      actionable: true
    },
    {
      type: "opportunity",
      message: "Leg volume 2x upper - consider balancing",
      action: "Upper body routine suggestions",
      actionable: true
    },
    {
      type: "trend",
      message: "Stretching consistency down 20% this month",
      action: "10-minute routine to rebuild habit",
      actionable: true
    }
  ]
}
```

### 4. STRENGTH TRAINING MODULE (Matching Hevy)

#### 4.1 Workout Logging

```
STRENGTH_WORKOUT = {
  id: uuid,
  user_id: uuid,
  routine_id: uuid,
  
  started_at: "2026-01-28T18:00:00Z",
  completed_at: "2026-01-28T19:15:00Z",
  
  exercises: [
    {
      exercise_id: uuid,
      exercise_name: "Bench Press",
      
      sets: [
        {
          reps: 5,
          weight: 225,
          type: "warmup",
          rpe: 3
        },
        {
          reps: 5,
          weight: 275,
          type: "normal",
          rpe: 7
        },
        {
          reps: 3,
          weight: 315,
          type: "normal",
          rpe: 9
        }
      ]
    },
    # ... more exercises
  ],
  
  session_intensity: 8 out of 10,
  session_notes: "Good workout, felt strong",
  
  muscle_groups_worked: ["chest", "shoulders", "triceps"],
  total_volume: 4500 lbs
}
```

#### 4.2 Exercise Library

**200+ exercises including:**
- Barbell (bench, squat, deadlift, rows, etc.)
- Dumbbell (presses, curls, raises)
- Machine (leg press, smith machine, cable machines)
- Bodyweight (push-ups, pull-ups, dips)
- Isolation (leg extensions, flyes, curls)
- Kettlebell, medicine ball, resistance bands
- Calisthenics (modern/unusual movements)

Each with:
- Form video (professionally produced)
- Muscle group highlighting
- Alternative variations

### 5. SOCIAL FEATURES

#### 5.1 Friend Tracking

```
SOCIAL_FOLLOW = {
  user_id: uuid,
  following: [
    {
      friend_id: uuid,
      friend_name: "John Doe",
      friend_image: url,
      
      # Visible to follower
      recent_pr: "315 lb deadlift",
      pr_date: "2026-01-25",
      
      current_streak: 12 days stretching,
      this_week_volume: 87500 lbs,
      
      last_workout: "2026-01-28 (today)"
    }
  ]
}
```

#### 5.2 Social Feed

```
ACTIVITY_FEED = {
  entries: [
    {
      type: "pr",
      user: "John Doe",
      message: "Hit a new PR! 315 lbs Deadlift",
      timestamp: "2 hours ago",
      image: user_image
    },
    {
      type: "goal_completed",
      user: "Jane Smith",
      message: "Completed flexibility goal: Touch Toes!",
      timestamp: "1 hour ago"
    },
    {
      type: "streak",
      user: "Mike Johnson",
      message: "30-day stretching streak! 🔥",
      timestamp: "30 mins ago"
    }
  ]
}
```

### 6. USER ONBOARDING FLOW

#### 6.1 First Launch Experience

**Step 1: Welcome & Value Prop**
```
WELCOME_SCREEN = {
  headline: "The Complete Fitness Companion",
  subheadline: "Strength + Stretching + Recovery in One App",
  
  value_props: [
    "🏋️ Log workouts like Hevy",
    "🧘 Stretching routines that actually work",
    "📊 Advanced analytics to track everything"
  ],
  
  cta: "Get Started",
  skip_option: true
}
```

**Step 2: Account Creation**
```
SIGNUP_FLOW = {
  options: [
    "Sign up with Email",
    "Continue with Apple",
    "Continue with Google"
  ],
  
  required_fields: ["email", "password"],
  optional_fields: ["username", "profile_photo"],
  
  terms_acceptance: true,
  marketing_opt_in: false (default)
}
```

**Step 3: Fitness Goal Selection**
```
GOAL_SELECTION = {
  question: "What's your primary fitness goal?",
  
  options: [
    {
      id: "build_muscle",
      label: "Build Muscle & Strength",
      icon: "💪",
      recommended_focus: "strength_primary"
    },
    {
      id: "flexibility",
      label: "Improve Flexibility",
      icon: "🧘",
      recommended_focus: "stretching_primary"
    },
    {
      id: "balanced",
      label: "Balanced Training",
      icon: "⚖️",
      recommended_focus: "both_equal"
    },
    {
      id: "recovery",
      label: "Recovery & Injury Prevention",
      icon: "🩹",
      recommended_focus: "stretching_recovery"
    },
    {
      id: "athletic",
      label: "Athletic Performance",
      icon: "🏃",
      recommended_focus: "sport_specific"
    }
  ],
  
  allow_multiple: false,
  can_change_later: true
}
```

**Step 4: Experience Level**
```
EXPERIENCE_LEVEL = {
  question: "How would you describe your fitness experience?",
  
  options: [
    {
      id: "beginner",
      label: "Beginner",
      description: "New to fitness or getting back into it",
      flexibility_baseline: "limited",
      suggested_routines: "beginner-friendly"
    },
    {
      id: "intermediate",
      label: "Intermediate",
      description: "Working out regularly for 1-2 years",
      flexibility_baseline: "moderate",
      suggested_routines: "intermediate"
    },
    {
      id: "advanced",
      label: "Advanced",
      description: "3+ years of consistent training",
      flexibility_baseline: "good",
      suggested_routines: "advanced"
    }
  ]
}
```

**Step 5: Baseline Flexibility Assessment**
```
FLEXIBILITY_ASSESSMENT = {
  question: "Quick flexibility check (optional)",
  skip_option: true,
  
  assessments: [
    {
      id: "toe_touch",
      name: "Toe Touch Test",
      instruction: "Standing, try to touch your toes with straight legs",
      options: [
        { label: "Can't reach past knees", score: 1 },
        { label: "Reach shins", score: 2 },
        { label: "Reach ankles", score: 3 },
        { label: "Touch toes", score: 4 },
        { label: "Palms flat on floor", score: 5 }
      ],
      target_muscle: "hamstrings"
    },
    {
      id: "shoulder_reach",
      name: "Shoulder Reach Test",
      instruction: "Reach one arm over shoulder, other behind back - try to touch fingers",
      options: [
        { label: "Hands far apart", score: 1 },
        { label: "Fingertips almost touch", score: 3 },
        { label: "Fingers touch or overlap", score: 5 }
      ],
      target_muscle: "shoulders"
    },
    {
      id: "hip_flexibility",
      name: "Hip Flexibility",
      instruction: "Sit in butterfly position - how close are knees to floor?",
      options: [
        { label: "Knees very high", score: 1 },
        { label: "Knees halfway down", score: 3 },
        { label: "Knees touch or almost touch floor", score: 5 }
      ],
      target_muscle: "hips"
    }
  ],
  
  result: {
    overall_score: 1-15,
    flexibility_level: "tight" | "moderate" | "flexible",
    recommended_focus_areas: ["hamstrings", "shoulders"],
    suggested_routines: [...],
    estimated_improvement_timeline: "4-8 weeks"
  }
}
```

**Step 6: Schedule Preferences**
```
SCHEDULE_SETUP = {
  question: "When do you usually work out?",
  
  workout_days: {
    type: "multi-select",
    options: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    default: ["Mon", "Wed", "Fri"]
  },
  
  preferred_time: {
    type: "select",
    options: ["Morning (6-10am)", "Midday (10am-2pm)", "Afternoon (2-6pm)", "Evening (6-10pm)"],
    used_for: "reminder_timing"
  },
  
  stretching_preference: {
    question: "When do you want to stretch?",
    options: [
      "After every workout",
      "Separate sessions",
      "Morning routines",
      "Evening wind-down",
      "Mix it up"
    ]
  }
}
```

**Step 7: Personalized Dashboard Setup**
```
INITIAL_RECOMMENDATIONS = {
  based_on: [goal_selection, experience_level, flexibility_assessment, schedule],
  
  generated: {
    suggested_stretching_routines: [
      "Post-Workout Recovery (matched to workout days)",
      "Morning Mobility (if selected morning time)",
      "Evening Wind-Down"
    ],
    
    flexibility_goals: [
      {
        suggested_goal: "Touch Your Toes",
        baseline: flexibility_assessment.toe_touch_score,
        target_timeline: "6 weeks"
      }
    ],
    
    first_workout: {
      type: "guided_stretching",
      routine: "5-min Full Body Intro",
      cta: "Start Your First Stretch"
    }
  }
}
```

#### 6.2 Data Model for Onboarding

```
USER_ONBOARDING = {
  id: uuid,
  user_id: uuid,
  
  completed_at: timestamp,
  skipped: boolean,
  
  primary_goal: enum["build_muscle", "flexibility", "balanced", "recovery", "athletic"],
  experience_level: enum["beginner", "intermediate", "advanced"],
  
  flexibility_assessment: {
    toe_touch_score: 1-5,
    shoulder_reach_score: 1-5,
    hip_flexibility_score: 1-5,
    overall_score: 1-15,
    flexibility_level: "tight" | "moderate" | "flexible"
  },
  
  workout_days: ["Mon", "Wed", "Fri"],
  preferred_workout_time: "evening",
  stretching_preference: "after_workout",
  
  notifications_enabled: boolean,
  marketing_opt_in: boolean,
  
  created_at: timestamp
}
```

---

### 7. PUSH NOTIFICATIONS SYSTEM

#### 7.1 Notification Types

```
NOTIFICATION_TYPES = {
  # Reminders
  stretch_reminder: {
    title: "Time to Stretch! 🧘",
    body: "Your 10-min Post-Workout Recovery is waiting",
    action: "open_routine",
    scheduling: "based_on_user_preferences",
    frequency: "daily",
    smart_timing: true
  },
  
  workout_reminder: {
    title: "Workout Time 💪",
    body: "Ready for today's session?",
    action: "open_workout",
    scheduling: "user_workout_days",
    frequency: "on_scheduled_days"
  },
  
  # Streak Maintenance
  streak_at_risk: {
    title: "Don't break your streak! 🔥",
    body: "You're on a 12-day stretching streak. Log today to keep it going!",
    action: "quick_log",
    trigger: "no_activity_by_8pm",
    frequency: "once_daily"
  },
  
  streak_milestone: {
    title: "7-Day Streak! 🎉",
    body: "You've stretched every day for a week. Amazing!",
    action: "view_achievement",
    trigger: "streak_milestone_reached"
  },
  
  # Goal Progress
  goal_progress: {
    title: "You're 50% there! 📈",
    body: "Your splits goal is halfway complete. Keep going!",
    action: "view_goal",
    trigger: "goal_milestone_reached"
  },
  
  goal_reminder: {
    title: "ROM Check-in Time 📏",
    body: "It's been 2 weeks since your last flexibility measurement",
    action: "log_measurement",
    trigger: "14_days_since_measurement"
  },
  
  # Social
  friend_activity: {
    title: "John hit a new PR! 🏆",
    body: "315 lbs Deadlift - give them some love!",
    action: "view_activity",
    trigger: "friend_pr_logged"
  },
  
  # Recovery
  recovery_suggestion: {
    title: "Recovery Day? 🩹",
    body: "You trained legs yesterday. Try this 10-min recovery stretch.",
    action: "open_suggested_routine",
    trigger: "post_workout_24h",
    smart_suggestion: true
  },
  
  # Engagement
  inactivity_nudge: {
    title: "We miss you! 👋",
    body: "It's been 3 days. A quick 5-min stretch can get you back on track.",
    action: "open_quick_routine",
    trigger: "no_activity_3_days",
    frequency: "once_every_3_days"
  }
}
```

#### 7.2 Notification Settings (User Control)

```
USER_NOTIFICATION_PREFERENCES = {
  user_id: uuid,
  
  # Master toggle
  notifications_enabled: true,
  
  # Category toggles
  stretch_reminders: true,
  workout_reminders: true,
  streak_notifications: true,
  goal_notifications: true,
  social_notifications: true,
  recovery_suggestions: true,
  inactivity_nudges: false,
  
  # Timing
  quiet_hours: {
    enabled: true,
    start: "22:00",
    end: "08:00"
  },
  
  # Frequency limits
  max_daily_notifications: 3,
  
  # Specific preferences
  stretch_reminder_time: "18:30",
  workout_reminder_time: "17:00",
  reminder_days: ["Mon", "Tue", "Wed", "Thu", "Fri"]
}
```

#### 7.3 Smart Notification Engine

```
SMART_NOTIFICATION_LOGIC = {
  # Don't notify if user already active today
  suppress_if: "user_logged_activity_today",
  
  # Optimal timing based on user patterns
  optimal_send_time: {
    analyze: "user_historical_engagement",
    factors: ["time_of_day_user_opens_app", "day_of_week_patterns"],
    personalized: true
  },
  
  # Batch notifications
  batching: {
    social_notifications: "batch_hourly",
    other_notifications: "send_immediately"
  },
  
  # A/B testing
  message_variants: {
    enabled: true,
    track_open_rates: true,
    optimize_for: "engagement"
  }
}
```

---

### 8. OFFLINE SUPPORT STRATEGY

#### 8.1 Offline Capabilities

```
OFFLINE_FEATURES = {
  # Works Fully Offline
  fully_offline: [
    "View previously loaded stretching routines",
    "Log stretching sessions (queued for sync)",
    "Log strength workouts (queued for sync)",
    "View stretch library (cached videos)",
    "View personal history (cached)",
    "Timer functionality",
    "View cached analytics"
  ],
  
  # Limited Offline
  partial_offline: [
    "Create custom routines (from cached stretches only)",
    "View goals (cached, no real-time progress)"
  ],
  
  # Requires Internet
  online_only: [
    "Social feed",
    "Follow/unfollow users",
    "Sync with wearables",
    "Upload progress videos",
    "Download new routines",
    "Real-time insights"
  ]
}
```

#### 8.2 Local Storage Architecture

```
LOCAL_STORAGE = {
  # SQLite for structured data
  sqlite: {
    tables: [
      "cached_routines",
      "cached_stretches",
      "pending_sessions",
      "pending_workouts",
      "user_profile",
      "cached_goals",
      "cached_history"
    ],
    max_size: "50MB"
  },
  
  # File storage for media
  file_cache: {
    stretch_videos: {
      cache_strategy: "lazy_load",
      max_cached: 20,
      eviction: "least_recently_used",
      max_size: "500MB"
    },
    thumbnails: {
      cache_strategy: "eager_load",
      max_size: "50MB"
    }
  },
  
  # Preferences
  async_storage: {
    user_preferences: true,
    notification_settings: true,
    onboarding_state: true
  }
}
```

#### 8.3 Sync Strategy

```
SYNC_STRATEGY = {
  # Queue management
  pending_queue: {
    structure: "FIFO",
    retry_on_failure: true,
    max_retries: 3,
    exponential_backoff: true
  },
  
  # Sync triggers
  sync_triggers: [
    "app_foreground",
    "network_restored",
    "manual_refresh",
    "background_sync_interval (15min)"
  ],
  
  # Conflict resolution
  conflict_resolution: {
    strategy: "last_write_wins",
    timestamp_based: true,
    user_data_priority: "local" // User's local changes win
  },
  
  # Sync status UI
  sync_indicator: {
    show_pending_count: true,
    show_last_sync_time: true,
    manual_sync_button: true
  }
}
```

#### 8.4 Video Caching

```
VIDEO_CACHE_STRATEGY = {
  # Pre-cache user's favorite routines
  pre_cache: {
    trigger: "user_favorites_routine",
    download_on: "wifi_only",
    max_routines: 5
  },
  
  # Stream with cache
  streaming: {
    buffer_ahead: "10_seconds",
    cache_while_streaming: true,
    quality_adaptive: true
  },
  
  # Cache management
  cache_management: {
    auto_cleanup: "weekly",
    cleanup_threshold: "500MB",
    protected: ["favorite_routines", "recently_used"]
  }
}
```

---

### 9. PRIVACY & GDPR COMPLIANCE

#### 9.1 Data Collection Disclosure

```
DATA_COLLECTED = {
  required_data: {
    email: "Account creation and login",
    password_hash: "Secure authentication"
  },
  
  optional_data: {
    profile_photo: "Personalization",
    body_metrics: "Tracking progress (weight, body fat)",
    health_data: "Wearable integration (with explicit consent)",
    location: "Never collected"
  },
  
  automatically_collected: {
    usage_analytics: "App improvement (anonymized)",
    crash_reports: "Bug fixing",
    device_info: "Compatibility and support"
  },
  
  never_collected: [
    "Location data",
    "Contacts",
    "Photos (except profile & progress)",
    "Browsing history",
    "Financial information (handled by payment processor)"
  ]
}
```

#### 9.2 User Rights (GDPR/CCPA)

```
USER_DATA_RIGHTS = {
  # Right to Access
  data_export: {
    endpoint: "GET /user/data-export",
    format: "JSON",
    includes: [
      "profile_information",
      "all_workout_logs",
      "all_stretching_sessions",
      "flexibility_goals_and_progress",
      "body_metrics_history",
      "social_connections"
    ],
    delivery: "email_download_link",
    processing_time: "within_24_hours"
  },
  
  # Right to Erasure (Right to be Forgotten)
  account_deletion: {
    endpoint: "DELETE /user/account",
    confirmation_required: true,
    grace_period: "30_days",
    
    data_deleted: [
      "all_personal_information",
      "workout_and_session_history",
      "goals_and_measurements",
      "progress_videos",
      "social_connections"
    ],
    
    data_retained_anonymized: [
      "aggregated_analytics (no personal identifiers)"
    ]
  },
  
  # Right to Rectification
  data_correction: {
    self_service: "Edit profile in-app",
    support: "Contact for bulk corrections"
  },
  
  # Right to Portability
  data_portability: {
    formats: ["JSON", "CSV"],
    machine_readable: true
  }
}
```

#### 9.3 Consent Management

```
CONSENT_MANAGEMENT = {
  # Required consents
  required: {
    terms_of_service: {
      version: "1.0",
      must_accept: true,
      timestamp_logged: true
    },
    privacy_policy: {
      version: "1.0",
      must_accept: true,
      timestamp_logged: true
    }
  },
  
  # Optional consents
  optional: {
    marketing_emails: {
      default: false,
      can_withdraw: true,
      unsubscribe_in_app: true
    },
    analytics_tracking: {
      default: true,
      can_opt_out: true,
      anonymous_by_default: true
    },
    health_data_access: {
      default: false,
      explicit_consent_required: true,
      revocable: true
    },
    push_notifications: {
      default: false,
      system_prompt_required: true
    }
  },
  
  # Consent versioning
  versioning: {
    track_consent_version: true,
    re_consent_on_major_changes: true,
    changelog_available: true
  }
}
```

#### 9.4 Data Retention Policy

```
DATA_RETENTION = {
  active_accounts: {
    workout_data: "indefinite",
    stretching_data: "indefinite",
    progress_videos: "indefinite",
    body_metrics: "indefinite"
  },
  
  inactive_accounts: {
    definition: "no_login_for_2_years",
    notification: "email_warning_30_days_before",
    action: "anonymize_or_delete"
  },
  
  deleted_accounts: {
    grace_period: "30_days",
    permanent_deletion: "after_grace_period",
    backup_retention: "90_days_then_purged"
  },
  
  analytics_data: {
    identifiable: "12_months",
    anonymized: "indefinite"
  }
}
```

#### 9.5 Security Measures

```
SECURITY_MEASURES = {
  encryption: {
    at_rest: "AES-256",
    in_transit: "TLS 1.3",
    passwords: "bcrypt with salt"
  },
  
  authentication: {
    method: "JWT",
    expiry: "7_days",
    refresh_tokens: true,
    mfa_optional: true
  },
  
  api_security: {
    rate_limiting: true,
    input_validation: true,
    sql_injection_prevention: true,
    xss_protection: true
  },
  
  compliance: {
    gdpr: true,
    ccpa: true,
    hipaa: false // Not a medical device
  }
}
```

---

## TECHNICAL ARCHITECTURE

### 1. TECH STACK

**Frontend (Mobile):**
- React Native + Expo
- Libraries: Zustand (state), React Query (data), React Navigation (routing)
- Video: react-native-video, expo-av
- Wearables: expo-health, HealthKit SDK, Google Fit API

**Frontend (Web):**
- Next.js 14 + React 18
- TypeScript
- TailwindCSS + shadcn/ui
- Recharts (analytics), Plotly (complex visualizations)
- Socket.io-client (real-time)

**Backend:**
- Node.js 18+
- Express.js
- TypeScript
- PostgreSQL (relational data)
- Redis (caching, real-time)
- Socket.io (WebSocket real-time)

**Databases:**
- PostgreSQL (primary): Users, workouts, stretches, goals, metrics
- Redis: Caching, sessions, pub/sub
- S3: Video storage, progress photos

**Cloud:**
- AWS or Google Cloud
- RDS for PostgreSQL
- ElastiCache for Redis
- S3 for storage
- CloudFront for CDN
- Lambda for video processing

**Video:**
- Cloudflare Stream (MVP) or AWS MediaConvert
- CloudFront for global CDN delivery

### 2. DATABASE SCHEMA

**Core Tables:**

```sql
-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  username VARCHAR UNIQUE,
  password_hash VARCHAR,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Stretching Routines
CREATE TABLE stretching_routines (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  name VARCHAR NOT NULL,
  description TEXT,
  difficulty VARCHAR,
  duration_seconds INTEGER,
  is_public BOOLEAN,
  created_at TIMESTAMP,
  
  INDEX (user_id),
  INDEX (created_at)
);

-- Stretches (Exercise Library)
CREATE TABLE stretches (
  id UUID PRIMARY KEY,
  name VARCHAR NOT NULL,
  description TEXT,
  duration_seconds INTEGER,
  video_url VARCHAR,
  difficulty VARCHAR,
  target_muscles TEXT[],
  created_at TIMESTAMP
);

-- Routine-Stretch Mapping
CREATE TABLE routine_stretches (
  id UUID PRIMARY KEY,
  routine_id UUID REFERENCES stretching_routines(id),
  stretch_id UUID REFERENCES stretches(id),
  position_order INTEGER,
  custom_duration_seconds INTEGER,
  
  INDEX (routine_id)
);

-- Stretching Sessions (Logs)
CREATE TABLE stretching_sessions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  routine_id UUID REFERENCES stretching_routines(id),
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  duration_seconds INTEGER,
  linked_workout_id UUID,
  completed BOOLEAN,
  created_at TIMESTAMP,
  
  INDEX (user_id, completed_at),
  INDEX (linked_workout_id)
);

-- Session Stretch Details
CREATE TABLE session_stretches (
  id UUID PRIMARY KEY,
  session_id UUID REFERENCES stretching_sessions(id),
  stretch_id UUID REFERENCES stretches(id),
  held_duration_seconds INTEGER,
  felt_tight BOOLEAN,
  position_in_routine INTEGER,
  
  INDEX (session_id)
);

-- Flexibility Goals
CREATE TABLE flexibility_goals (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  goal_type VARCHAR,
  target_area VARCHAR,
  baseline_rom FLOAT,
  target_rom FLOAT,
  created_at TIMESTAMP,
  target_date DATE,
  status VARCHAR,
  
  INDEX (user_id, target_date),
  INDEX (status)
);

-- ROM Measurements
CREATE TABLE rom_measurements (
  id UUID PRIMARY KEY,
  goal_id UUID REFERENCES flexibility_goals(id),
  rom_degrees FLOAT,
  measurement_date TIMESTAMP,
  measurement_method VARCHAR,
  
  INDEX (goal_id, measurement_date)
);

-- Body Metrics
CREATE TABLE body_metrics (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  weight FLOAT,
  body_fat_percentage FLOAT,
  measurement_date TIMESTAMP,
  
  INDEX (user_id, measurement_date)
);

-- Strength Workouts (Basic)
CREATE TABLE strength_workouts (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  session_intensity_rpe INTEGER,
  created_at TIMESTAMP,
  
  INDEX (user_id, completed_at)
);

-- Social Following
CREATE TABLE user_follows (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  following_user_id UUID REFERENCES users(id),
  created_at TIMESTAMP,
  
  UNIQUE(user_id, following_user_id),
  INDEX (user_id)
);

-- Progress Videos
CREATE TABLE progress_videos (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  goal_id UUID REFERENCES flexibility_goals(id),
  video_url VARCHAR,
  uploaded_at TIMESTAMP,
  
  INDEX (goal_id)
);

-- Strength Exercises Library
CREATE TABLE exercises (
  id UUID PRIMARY KEY,
  name VARCHAR NOT NULL,
  description TEXT,
  category VARCHAR, -- 'barbell', 'dumbbell', 'machine', 'bodyweight', 'cable', 'kettlebell'
  equipment_needed TEXT[],
  
  video_url VARCHAR,
  thumbnail_url VARCHAR,
  
  primary_muscles TEXT[],
  secondary_muscles TEXT[],
  
  difficulty VARCHAR, -- 'beginner', 'intermediate', 'advanced'
  instructions TEXT,
  tips TEXT[],
  common_mistakes TEXT[],
  
  is_compound BOOLEAN,
  is_unilateral BOOLEAN,
  
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  
  INDEX (category),
  INDEX (primary_muscles)
);

-- Workout Exercises (per workout)
CREATE TABLE workout_exercises (
  id UUID PRIMARY KEY,
  workout_id UUID REFERENCES strength_workouts(id) ON DELETE CASCADE,
  exercise_id UUID REFERENCES exercises(id),
  position_order INTEGER,
  notes TEXT,
  
  created_at TIMESTAMP,
  
  INDEX (workout_id),
  INDEX (exercise_id)
);

-- Workout Sets (individual sets within an exercise)
CREATE TABLE workout_sets (
  id UUID PRIMARY KEY,
  workout_exercise_id UUID REFERENCES workout_exercises(id) ON DELETE CASCADE,
  set_number INTEGER,
  
  reps INTEGER,
  weight FLOAT,
  weight_unit VARCHAR DEFAULT 'lbs', -- 'lbs' or 'kg'
  
  set_type VARCHAR DEFAULT 'normal', -- 'warmup', 'normal', 'dropset', 'failure', 'amrap'
  rpe INTEGER, -- Rate of Perceived Exertion (1-10)
  
  is_pr BOOLEAN DEFAULT FALSE,
  completed BOOLEAN DEFAULT TRUE,
  
  rest_seconds INTEGER,
  duration_seconds INTEGER, -- For timed exercises
  distance_meters FLOAT, -- For distance-based exercises
  
  created_at TIMESTAMP,
  
  INDEX (workout_exercise_id)
);

-- Personal Records
CREATE TABLE personal_records (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  exercise_id UUID REFERENCES exercises(id),
  
  record_type VARCHAR, -- '1rm', '3rm', '5rm', 'max_reps', 'max_weight'
  value FLOAT,
  weight_unit VARCHAR DEFAULT 'lbs',
  
  achieved_at TIMESTAMP,
  workout_id UUID REFERENCES strength_workouts(id),
  
  UNIQUE(user_id, exercise_id, record_type),
  INDEX (user_id, exercise_id)
);

-- Notifications Log
CREATE TABLE notifications (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  
  notification_type VARCHAR NOT NULL, -- 'stretch_reminder', 'streak_at_risk', 'goal_progress', etc.
  title VARCHAR NOT NULL,
  body TEXT,
  
  action_type VARCHAR, -- 'open_routine', 'view_goal', 'quick_log', etc.
  action_data JSONB, -- { routine_id: uuid, goal_id: uuid, etc. }
  
  sent_at TIMESTAMP,
  read_at TIMESTAMP,
  clicked_at TIMESTAMP,
  
  delivery_status VARCHAR, -- 'pending', 'sent', 'delivered', 'failed'
  
  created_at TIMESTAMP,
  
  INDEX (user_id, sent_at),
  INDEX (user_id, read_at)
);

-- User Notification Preferences
CREATE TABLE notification_preferences (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) UNIQUE,
  
  notifications_enabled BOOLEAN DEFAULT TRUE,
  
  stretch_reminders BOOLEAN DEFAULT TRUE,
  workout_reminders BOOLEAN DEFAULT TRUE,
  streak_notifications BOOLEAN DEFAULT TRUE,
  goal_notifications BOOLEAN DEFAULT TRUE,
  social_notifications BOOLEAN DEFAULT TRUE,
  recovery_suggestions BOOLEAN DEFAULT TRUE,
  inactivity_nudges BOOLEAN DEFAULT FALSE,
  
  quiet_hours_enabled BOOLEAN DEFAULT TRUE,
  quiet_hours_start TIME DEFAULT '22:00',
  quiet_hours_end TIME DEFAULT '08:00',
  
  max_daily_notifications INTEGER DEFAULT 5,
  
  stretch_reminder_time TIME DEFAULT '18:30',
  workout_reminder_time TIME DEFAULT '17:00',
  reminder_days TEXT[] DEFAULT ARRAY['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
  
  updated_at TIMESTAMP,
  
  INDEX (user_id)
);

-- Subscriptions
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  
  plan_type VARCHAR NOT NULL, -- 'free', 'pro_monthly', 'pro_yearly', 'lifetime'
  status VARCHAR NOT NULL, -- 'active', 'cancelled', 'expired', 'paused'
  
  price_paid FLOAT,
  currency VARCHAR DEFAULT 'USD',
  
  started_at TIMESTAMP,
  expires_at TIMESTAMP, -- NULL for lifetime
  cancelled_at TIMESTAMP,
  
  -- Payment provider info
  provider VARCHAR, -- 'stripe', 'apple', 'google'
  provider_subscription_id VARCHAR,
  provider_customer_id VARCHAR,
  
  -- Trial info
  trial_started_at TIMESTAMP,
  trial_ends_at TIMESTAMP,
  is_trial BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  
  INDEX (user_id),
  INDEX (status),
  INDEX (expires_at)
);

-- User Onboarding Data
CREATE TABLE user_onboarding (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) UNIQUE,
  
  completed_at TIMESTAMP,
  skipped BOOLEAN DEFAULT FALSE,
  
  primary_goal VARCHAR, -- 'build_muscle', 'flexibility', 'balanced', 'recovery', 'athletic'
  experience_level VARCHAR, -- 'beginner', 'intermediate', 'advanced'
  
  -- Flexibility assessment
  toe_touch_score INTEGER,
  shoulder_reach_score INTEGER,
  hip_flexibility_score INTEGER,
  overall_flexibility_score INTEGER,
  flexibility_level VARCHAR, -- 'tight', 'moderate', 'flexible'
  
  -- Schedule preferences
  workout_days TEXT[],
  preferred_workout_time VARCHAR,
  stretching_preference VARCHAR,
  
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  
  INDEX (user_id)
);

-- User Consents (GDPR compliance)
CREATE TABLE user_consents (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  
  consent_type VARCHAR NOT NULL, -- 'terms_of_service', 'privacy_policy', 'marketing', 'analytics', 'health_data'
  version VARCHAR NOT NULL, -- Version of the policy consented to
  
  consented BOOLEAN NOT NULL,
  consented_at TIMESTAMP,
  withdrawn_at TIMESTAMP,
  
  ip_address VARCHAR, -- For audit trail
  user_agent VARCHAR,
  
  created_at TIMESTAMP,
  
  INDEX (user_id, consent_type)
);

-- Data Export Requests (GDPR)
CREATE TABLE data_export_requests (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  
  status VARCHAR NOT NULL, -- 'pending', 'processing', 'completed', 'expired'
  
  requested_at TIMESTAMP,
  completed_at TIMESTAMP,
  expires_at TIMESTAMP,
  
  download_url VARCHAR,
  file_size_bytes BIGINT,
  
  INDEX (user_id),
  INDEX (status)
);

-- Account Deletion Requests (GDPR)
CREATE TABLE deletion_requests (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  
  status VARCHAR NOT NULL, -- 'pending', 'grace_period', 'completed', 'cancelled'
  reason TEXT,
  
  requested_at TIMESTAMP,
  grace_period_ends_at TIMESTAMP,
  completed_at TIMESTAMP,
  cancelled_at TIMESTAMP,
  
  INDEX (user_id),
  INDEX (status),
  INDEX (grace_period_ends_at)
);
```

### 3. API DESIGN

**Base URL:** `https://api.app.com/v1`

**Authentication:** JWT Bearer Token

#### Stretching Endpoints:

```
# Get all stretching routines (public + user's custom)
GET /stretching/routines
Response: { routines: [...], total: 45 }

# Get single routine with stretches
GET /stretching/routines/{routine_id}
Response: { routine: {...}, stretches: [...] }

# Get stretch library
GET /stretches
Query: ?difficulty=beginner&target_muscle=hamstrings
Response: { stretches: [...], total: 25 }

# Log stretching session
POST /stretching/sessions
Body: {
  routine_id: uuid,
  started_at: timestamp,
  stretches: [{stretch_id, held_duration_seconds, felt_tight}]
}
Response: { session_id: uuid, status: "completed" }

# Get stretching history
GET /stretching/sessions
Query: ?limit=20&offset=0&date_range=month
Response: { sessions: [...], total: 45 }

# Create custom routine
POST /stretching/routines
Body: { name, stretches: [stretch_ids] }
Response: { routine_id: uuid }

# Get user's stretching stats
GET /stretching/stats
Query: ?period=month
Response: {
  total_sessions: 24,
  total_minutes: 480,
  consistency_percentage: 80,
  streak: 12
}
```

#### Flexibility Goals Endpoints:

```
# Create flexibility goal
POST /goals/flexibility
Body: {
  goal_type: "achieve_full_splits",
  target_area: "hamstrings",
  baseline_rom: 60,
  target_rom: 180,
  target_date: date
}
Response: { goal_id: uuid }

# Get user's flexibility goals
GET /goals/flexibility
Response: { goals: [...] }

# Log ROM measurement
POST /goals/flexibility/{goal_id}/measurements
Body: {
  rom_degrees: 75,
  measurement_method: "video_comparison"
}
Response: { measurement_id: uuid, progress: 45% }

# Get goal progress
GET /goals/flexibility/{goal_id}
Response: {
  goal: {...},
  measurements: [...],
  progress_percentage: 45,
  estimated_completion: date,
  insights: [...]
}

# Upload progress video
POST /goals/flexibility/{goal_id}/videos
Body: FormData with video file
Response: { video_id: uuid, processing: true }
```

#### Analytics Endpoints:

```
# Get flexibility analytics
GET /analytics/flexibility
Query: ?period=month&metric=rom_progress
Response: {
  data_series: [...],
  insights: [...],
  muscle_group_breakdown: {...}
}

# Get consistency analytics
GET /analytics/consistency
Query: ?period=month
Response: {
  stretching_days: 18,
  consistency_percentage: 60,
  streak: 12,
  calendar_view: {...}
}

# Get recovery index
GET /analytics/recovery
Response: {
  recovery_score: 78,
  factors: { stretching, sleep, workout_balance },
  recommendations: [...]
}

# Get body metrics
GET /analytics/body-metrics
Query: ?period=quarter
Response: {
  weight_trend: [...],
  body_fat_trend: [...],
  insights: [...]
}

# Get insights
GET /analytics/insights
Response: {
  insights: [
    { type: "achievement", message: "..." },
    { type: "concern", message: "..." }
  ]
}
```

#### Social Endpoints:

```
# Follow user
POST /social/follow/{user_id}
Response: { status: "following" }

# Get followers
GET /social/followers
Response: { followers: [...] }

# Get activity feed
GET /social/feed
Query: ?limit=20
Response: { activities: [...] }
```

### 4. Caching Strategy

**Redis Cache Keys:**
```
user:{user_id}:profile
user:{user_id}:this_month:stretching_stats
user:{user_id}:flexibility_goals
user:{user_id}:streak
user:{user_id}:recovery_index

routine:{routine_id}:stretches
stretch:{stretch_id}:details

leaderboard:stretching_streak:week
leaderboard:flexibility_progress:month
```

**Cache TTLs:**
- Profile: 24 hours
- Stats: 1 hour
- Goals: 24 hours
- Routine details: 7 days
- Leaderboards: 1 hour

### 5. Real-time Features (Socket.io)

```javascript
// User completes workout
socket.emit('workout_completed', {
  user_id, muscle_groups, volume
});
// Server broadcasts to followers
io.to(`followers_${user_id}`).emit('friend_completed_workout', data);

// Stretch session completed
socket.emit('stretch_session_completed', {
  routine_name, duration, felt_tight
});

// ROM measurement updated
socket.emit('rom_progress', {
  goal_id, new_rom, improvement, percent_complete
});

// Goal milestone reached
io.to(`user_${user_id}`).emit('goal_milestone', {
  goal_name, message, badge
});
```

### 6. ERROR HANDLING STRATEGY

#### 6.1 API Error Response Format

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data",
    "details": [
      {
        "field": "email",
        "message": "Email address is invalid"
      }
    ],
    "request_id": "req_abc123xyz",
    "timestamp": "2026-01-28T14:30:00Z"
  }
}
```

#### 6.2 Error Codes

```
ERROR_CODES = {
  # Authentication (401)
  AUTH_TOKEN_EXPIRED: "Authentication token has expired",
  AUTH_TOKEN_INVALID: "Invalid authentication token",
  AUTH_REQUIRED: "Authentication required",
  
  # Authorization (403)
  FORBIDDEN: "You don't have permission to access this resource",
  SUBSCRIPTION_REQUIRED: "Pro subscription required for this feature",
  RATE_LIMIT_EXCEEDED: "Too many requests. Please try again later",
  
  # Validation (400)
  VALIDATION_ERROR: "Invalid request data",
  INVALID_INPUT: "One or more fields are invalid",
  MISSING_REQUIRED_FIELD: "Required field is missing",
  
  # Not Found (404)
  RESOURCE_NOT_FOUND: "Requested resource not found",
  USER_NOT_FOUND: "User not found",
  ROUTINE_NOT_FOUND: "Stretching routine not found",
  GOAL_NOT_FOUND: "Flexibility goal not found",
  
  # Conflict (409)
  DUPLICATE_RESOURCE: "Resource already exists",
  EMAIL_ALREADY_EXISTS: "Email address is already registered",
  USERNAME_TAKEN: "Username is already taken",
  
  # Server Errors (500)
  INTERNAL_ERROR: "An unexpected error occurred",
  DATABASE_ERROR: "Database operation failed",
  EXTERNAL_SERVICE_ERROR: "External service unavailable",
  
  # Business Logic
  SESSION_ALREADY_COMPLETED: "This session has already been completed",
  GOAL_ALREADY_ACHIEVED: "This goal has already been achieved",
  ROUTINE_LIMIT_REACHED: "Free tier custom routine limit reached (4 max)"
}
```

#### 6.3 Client-Side Error Handling

```
CLIENT_ERROR_HANDLING = {
  # Network errors
  network_unavailable: {
    behavior: "queue_for_retry",
    ui_message: "You're offline. Your data will sync when connected.",
    retry_strategy: "exponential_backoff"
  },
  
  # Auth errors
  token_expired: {
    behavior: "auto_refresh_token",
    fallback: "redirect_to_login",
    silent: true
  },
  
  # Validation errors
  validation_error: {
    behavior: "show_field_errors",
    ui_message: "Please fix the highlighted fields",
    highlight_fields: true
  },
  
  # Rate limiting
  rate_limited: {
    behavior: "wait_and_retry",
    ui_message: "Please wait a moment before trying again",
    retry_after: "from_header"
  },
  
  # Server errors
  server_error: {
    behavior: "show_error_toast",
    ui_message: "Something went wrong. Please try again.",
    log_to_sentry: true,
    retry_button: true
  },
  
  # Subscription required
  subscription_required: {
    behavior: "show_upgrade_modal",
    ui_message: "Upgrade to Pro to unlock this feature",
    cta: "View Plans"
  }
}
```

#### 6.4 Retry Strategy

```
RETRY_STRATEGY = {
  # Automatic retries for transient failures
  auto_retry: {
    max_attempts: 3,
    initial_delay_ms: 1000,
    backoff_multiplier: 2,
    max_delay_ms: 30000,
    
    retryable_errors: [
      "network_error",
      "timeout",
      "503_service_unavailable",
      "429_rate_limited"
    ],
    
    non_retryable_errors: [
      "400_bad_request",
      "401_unauthorized",
      "403_forbidden",
      "404_not_found"
    ]
  },
  
  # Offline queue
  offline_queue: {
    max_queue_size: 100,
    persistence: "local_storage",
    sync_on_reconnect: true,
    conflict_resolution: "last_write_wins"
  }
}
```

#### 6.5 Logging & Monitoring

```
ERROR_LOGGING = {
  # Client-side
  client: {
    tool: "Sentry",
    capture: ["uncaught_exceptions", "api_errors", "component_errors"],
    context: ["user_id", "device_info", "app_version", "screen_name"],
    sampling_rate: 1.0, // 100% of errors
    breadcrumbs: true
  },
  
  # Server-side
  server: {
    tool: "DataDog",
    log_levels: ["error", "warn", "info"],
    structured_logging: true,
    include_request_id: true,
    
    alerts: {
      error_rate_threshold: "1%",
      latency_threshold_p99: "2000ms",
      notify: ["slack", "pagerduty"]
    }
  },
  
  # Error aggregation
  aggregation: {
    group_by: ["error_code", "endpoint", "user_segment"],
    dedupe_window: "1_hour",
    priority_by_frequency: true
  }
}
```

#### 6.6 Graceful Degradation

```
GRACEFUL_DEGRADATION = {
  # Feature fallbacks when services fail
  fallbacks: {
    analytics_service_down: {
      behavior: "cache_locally",
      show_stale_data: true,
      indicator: "Data may be outdated"
    },
    
    video_cdn_slow: {
      behavior: "reduce_quality",
      fallback: "show_static_image",
      message: "Video loading slowly"
    },
    
    social_feed_unavailable: {
      behavior: "hide_section",
      log_error: true,
      retry_in_background: true
    },
    
    push_notification_failed: {
      behavior: "queue_for_retry",
      fallback: "in_app_notification",
      max_retries: 3
    }
  }
}
```

---

## IMPLEMENTATION TIMELINE

### Month 1: Infrastructure & MVP Setup

**Week 1-2: Setup & Database**
- ✅ Scaffold Node.js + Express backend
- ✅ Set up PostgreSQL database with schema
- ✅ Set up Redis for caching
- ✅ Configure AWS S3 for storage
- ✅ Set up JWT authentication
- ✅ Deploy to AWS/GCP

**Week 3-4: Mobile & Web Foundation**
- ✅ Initialize React Native + Expo project
- ✅ Initialize Next.js web project
- ✅ Set up navigation structure (mobile)
- ✅ Create authentication flow
- ✅ Set up API client libraries
- ✅ Design database models in Prisma

**Deliverables:**
- Running backend API (localhost)
- Mobile app shell (can authenticate)
- Web admin dashboard shell
- Database with initial schema

### Month 2: Stretching Module & Basic Analytics

**Week 1-2: Stretching Library**
- ✅ Create 45 stretching routines
- ✅ Record/source 80 stretch videos
- ✅ Generate muscle animation SVGs
- ✅ Build stretching library UI (mobile)
- ✅ Implement stretching session logging
- ✅ Build real-time timer UI

**Week 3-4: Analytics Foundation**
- ✅ Build flexibility goal system
- ✅ Implement ROM measurement tracking
- ✅ Create basic analytics graphs
- ✅ Build consistency tracker (calendar)
- ✅ Create insights engine
- ✅ Set up Redis caching

**Deliverables:**
- Functional stretching routines
- Stretching session logging
- Basic analytics dashboard
- Flexibility goal tracking

### Month 3: Advanced Analytics & Integration

**Week 1-2: Advanced Analytics**
- ✅ Build ROM progress graphs
- ✅ Implement recovery score calculation
- ✅ Create body metrics tracking
- ✅ Build video comparison tool
- ✅ Create muscle group analytics
- ✅ Implement AI insights generation

**Week 3-4: Integration & Polish**
- ✅ Add post-workout stretch recommendations
- ✅ Implement strength logging (basic, match Hevy)
- ✅ Build social feed
- ✅ Add follow/friend features
- ✅ Performance optimization
- ✅ Security audit

**Deliverables:**
- Full analytics suite
- Strength + stretching integration
- Social features
- Performance optimized

### Month 4: Wearables & Launch Prep

**Week 1-2: Wearables**
- ✅ Implement Apple Watch integration
- ✅ Implement Wear OS integration
- ✅ Add HealthKit/Google Fit sync
- ✅ Build watch complications
- ✅ Test on physical devices

**Week 3-4: Testing & Launch**
- ✅ QA testing across devices
- ✅ App Store & Play Store submission
- ✅ Beta testing with 100 users
- ✅ Fix bugs from beta
- ✅ Marketing materials
- ✅ Launch day

**Deliverables:**
- iOS app on App Store
- Android app on Google Play
- Wearable integrations working
- 100+ users in beta

---

## DEPLOYMENT & SCALING

### Infrastructure Architecture

```
┌─────────────────────────────────────────────┐
│           Mobile App (iOS/Android)          │
│         (React Native + Expo)               │
└─────────────────────────────────────────────┘
                      ↓ HTTPS
┌─────────────────────────────────────────────┐
│         API Gateway / Load Balancer         │
│         (AWS ALB or Google Cloud LB)        │
└─────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────┐
│      Node.js Express Servers (Horizontal    │
│      Scaling - Multiple Instances)          │
└─────────────────────────────────────────────┘
         ↙              ↓              ↘
    ┌────────┐    ┌──────────┐    ┌────────┐
    │PostgreSQL   │  Redis   │    │   S3   │
    │ Database    │ Cache    │    │Storage │
    └────────┘    └──────────┘    └────────┘
         ↓
    ┌──────────────┐
    │  CloudFront  │
    │     CDN      │
    └──────────────┘
```

### Scaling Strategy

**Phase 1 (50K users):**
- Single PostgreSQL instance (t3.large)
- Single Redis instance (cache01)
- 2-3 Node.js servers behind load balancer
- S3 for storage
- CloudFront for CDN
- Cost: ~$200/month

**Phase 2 (250K users):**
- PostgreSQL with read replicas
- Redis cluster (3 nodes)
- 5-10 Node.js servers
- ElastiCache for distributed caching
- Auto-scaling groups
- Cost: ~$800/month

**Phase 3 (1M users):**
- PostgreSQL sharded by user_id
- Redis cluster (6-9 nodes)
- 20+ Node.js servers
- Dedicated analytics database (MongoDB or separate PostgreSQL)
- Migration of heavy analytics to separate service (Go backend)
- Cost: ~$2500/month

### Database Optimization

**Queries to Optimize:**
- User's stretching sessions (indexed by user_id, date)
- ROM measurements over time (indexed by goal_id, date)
- Flexibility goal progress (indexed by user_id)
- Social feed (indexed by following_user_id)

**Connection Pooling:**
- Use pg (PostgreSQL client) with connection pooling (20-30 connections)
- Redis for session storage

**Caching Layers:**
1. Redis (hot data - user stats, goals)
2. CloudFront (static videos, images)
3. Browser cache (30 days for assets)

### Monitoring

**Tools:**
- Sentry: Error tracking
- DataDog: APM (Application Performance Monitoring)
- CloudWatch: AWS logs and metrics
- Custom metrics: Business KPIs (daily actives, goal completions)

**Alerts:**
- Database CPU > 80%
- API response time > 1000ms
- Error rate > 1%
- S3 storage > 500GB
- Redis memory > 80%

---

## ADDITIONAL DETAILS

### 1. Pricing Model

**Free Tier:**
- Unlimited workout logging
- Unlimited stretching logging
- 45 pre-built stretching routines
- 4 custom routines
- Basic analytics (graphs, trends)
- Social features (follow, share)
- 80 stretch library access

**Pro ($2.99-3.99/month or $23.99/year):**
- Unlimited custom routines
- Advanced analytics (recovery score, body metrics, insights)
- AI workout progression recommendations
- Video progress comparison
- Coach tools (in Phase 2)
- Ad-free experience
- Priority customer support

**Lifetime ($74.99):**
- Everything Pro
- One-time payment, no recurring fees
- Priority support forever

**Revenue Model:**
- Year 1: 50K users, ~5% Pro conversion = $8K-12K MRR
- Year 2: 250K users, ~15% Pro = $45K-60K MRR
- Year 3: 1M users, ~20% Pro = $200K+ MRR

### 2. Marketing Strategy

**Phase 1 (Pre-Launch):**
- Build landing page with features
- Create demo videos
- Reach out to fitness influencers
- Launch private beta (100 users)
- Collect testimonials

**Phase 2 (Launch):**
- App Store optimization (ASO)
- Reddit posts (r/fitness, r/bodyweightfitness, r/strength)
- Fitness influencer partnerships
- Press releases
- TikTok/Instagram content (transformation videos, stretching tips)

**Phase 3 (Growth):**
- Referral program ($5 credit for referring friend)
- Partnership with gyms
- Coach partnerships (recommend to clients)
- Content marketing (stretching guide blog)
- YouTube channel (form guides, flexibility tips)

### 3. Success Metrics (KPIs)

**User Acquisition:**
- Target 1000 DAU in month 1
- Target 10K DAU by month 6
- Target 50K DAU by year 1

**Engagement:**
- Stretch session 3x/week minimum
- 40%+ users log flexibility goal
- 60%+ session completion rate
- 30-day retention: 50%

**Monetization:**
- 10% Pro conversion rate (target)
- $10 LTV in year 1
- $50+ LTV by year 2

**Product:**
- App store rating: 4.5+ stars
- Customer satisfaction: 90%+
- Bug fix time: < 48 hours

### 4. Competitive Defense

**Why hard to replicate:**
1. First mover advantage in strength + stretching integration
2. Stretching library (80+ videos is valuable asset)
3. Community network effects (friends using app)
4. Habit formation (daily streaks, goals)
5. Data moat (1000+ users' ROM tracking data = better recommendations)

**Defensibility:**
- Continuously add new stretches (weekly updates)
- Build social features (harder to leave with friends)
- Improve analytics with data science (better insights = stickier)
- Build coaching marketplace (B2B revenue)
- Integrate with more wearables (Apple Health, Oura, Whoop)

---

## CONCLUSION

This specification provides a complete roadmap for building a competitive fitness application that addresses Hevy's gaps in stretching and advanced analytics. The 4-month MVP timeline is aggressive but achievable with a focused team.

**Key Success Factors:**
1. ✅ Launch stretching module with quality (45+ routines, 80+ stretches)
2. ✅ Build advanced analytics that users find valuable
3. ✅ Create habit-forming features (streaks, goals, insights)
4. ✅ Build social features to match Hevy's community
5. ✅ Execute flawlessly on wearable integration

**Next Steps:**
1. Finalize technical architecture with engineering team
2. Create detailed API specification document
3. Design UI/UX mockups
4. Begin infrastructure setup
5. Source stretching videos and content

**Technical team required:**
- 1 Full-stack engineer (React Native + Node.js)
- 1 Backend engineer (Database, APIs, scaling)
- 1 Designer/QA (UI/UX, testing)

**Estimated cost:**
- Infrastructure: $200-500/month (MVP)
- Team salary: $30K-40K/month
- Stretching video production: $5K-10K
- Marketing: $2K-5K/month

**Total: $37K-55K/month for 4-month MVP development**

This is a realistic, fundable plan with clear differentiation from Hevy and a path to profitability.