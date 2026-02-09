/**
 * Seed Premade Routines
 * Populates the database with premade workout routines
 * 
 * Usage: npx tsx src/scripts/seed-routines.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface RoutineData {
  name: string;
  description: string;
  category: string;
  durationMinutes: number;
  difficulty: string;
  equipment: string[];
  warmup: string[];
  cooldown: string[];
  exercises: {
    customName: string;
    sets: number;
    reps: string;
    restSeconds?: number;
    notes?: string;
  }[];
}

// Premade routines data
const premadeRoutines: RoutineData[] = [
  // GYM EQUIPMENT ROUTINES
  {
    name: "Full Body Strength (Barbell Focus)",
    description: "Complete full body workout focusing on major compound lifts with barbell",
    category: "gym",
    durationMinutes: 60,
    difficulty: "intermediate",
    equipment: ["Barbell", "Rack", "Leg Press", "Cable Machine"],
    warmup: ["Arm circles: 10 each direction", "Cat-cow stretches: 10 reps", "Bodyweight squats: 10 reps", "Inchworms: 8 reps"],
    cooldown: ["Hip Flexor Lunge Stretch: 30 sec each side", "Quad Stretch: 30 sec each leg", "Hamstring Stretch: 30 sec each leg", "Chest Doorway Stretch: 45 sec", "Child's Pose: 60 sec"],
    exercises: [
      { customName: "Barbell Back Squat", sets: 3, reps: "3-5", restSeconds: 180, notes: "2 sets x 3 @ 85%, 1 set x 5+ @ 75%" },
      { customName: "Barbell Bench Press", sets: 3, reps: "3-5", restSeconds: 180, notes: "2 sets x 3 @ 85%, 1 set x 5+ @ 75%" },
      { customName: "Barbell Deadlift", sets: 2, reps: "3-5", restSeconds: 180, notes: "1 set x 3 @ 85%, 1 set x 5+ @ 75%" },
      { customName: "Barbell Rows", sets: 3, reps: "5", restSeconds: 120 },
      { customName: "Leg Press", sets: 3, reps: "8", restSeconds: 90, notes: "Superset with Cable Fly" },
      { customName: "Cable Chest Fly", sets: 3, reps: "8", restSeconds: 90 },
    ]
  },
  {
    name: "Upper Body Push/Pull",
    description: "Balanced upper body workout hitting both pushing and pulling movements",
    category: "gym",
    durationMinutes: 55,
    difficulty: "intermediate",
    equipment: ["Barbell", "Dumbbells", "Cable Machine"],
    warmup: ["Arm circles: 10 each direction", "Band pull-aparts: 15 reps", "Push-ups: 8 reps", "Band dislocates: 10 reps"],
    cooldown: ["Chest Stretch: 45 sec", "Doorway Chest Stretch: 45 sec", "Shoulder Stretch: 30 sec each", "Tricep Stretch: 30 sec each"],
    exercises: [
      { customName: "Barbell Bench Press", sets: 4, reps: "6", restSeconds: 120 },
      { customName: "Barbell Rows", sets: 4, reps: "6", restSeconds: 120 },
      { customName: "Incline Dumbbell Press", sets: 3, reps: "8", restSeconds: 90 },
      { customName: "Chest-Supported Rows", sets: 3, reps: "8", restSeconds: 90 },
      { customName: "Dumbbell Flyes", sets: 3, reps: "10", restSeconds: 60, notes: "Superset with Face Pulls" },
      { customName: "Face Pulls", sets: 3, reps: "12", restSeconds: 60 },
      { customName: "Push-ups", sets: 2, reps: "AMRAP", restSeconds: 60, notes: "To failure" },
    ]
  },
  {
    name: "Lower Body Power",
    description: "Power-focused leg day targeting strength and explosiveness",
    category: "gym",
    durationMinutes: 60,
    difficulty: "advanced",
    equipment: ["Squat Rack", "Barbell", "Leg Press", "Leg Curl Machine", "Calf Raise Machine"],
    warmup: ["Leg swings: 10 each direction", "Bodyweight squats: 15 reps", "Lunges: 8 each leg", "Glute bridges: 15 reps"],
    cooldown: ["Deep Squat Hold: 60 sec", "Pigeon Pose: 60 sec each", "Hamstring Stretch: 45 sec each", "Hip Flexor Lunge: 45 sec each", "Child's Pose: 60 sec"],
    exercises: [
      { customName: "Barbell Back Squat", sets: 5, reps: "2-3", restSeconds: 180, notes: "2x2 @ 90%, 3x3 @ 85%" },
      { customName: "Barbell Bulgarian Split Squat", sets: 4, reps: "5 each", restSeconds: 120 },
      { customName: "Leg Press", sets: 3, reps: "6", restSeconds: 120, notes: "Heavy" },
      { customName: "Leg Curl", sets: 3, reps: "8", restSeconds: 90 },
      { customName: "Calf Raise", sets: 3, reps: "12", restSeconds: 60 },
    ]
  },
  {
    name: "Hypertrophy (Chest Focus)",
    description: "Volume-based chest workout designed for muscle building",
    category: "gym",
    durationMinutes: 70,
    difficulty: "intermediate",
    equipment: ["Barbell", "Dumbbells", "Cable Machine", "Chest Fly Machine"],
    warmup: ["5 minutes easy cardio", "Dynamic stretches: 5 min"],
    cooldown: ["Chest Stretch: 60 sec", "Doorway Chest Stretch: 60 sec", "Shoulder Stretch: 30 sec each", "Child's Pose: 60 sec"],
    exercises: [
      { customName: "Barbell Bench Press", sets: 4, reps: "8", restSeconds: 120 },
      { customName: "Incline Dumbbell Press", sets: 4, reps: "10", restSeconds: 90 },
      { customName: "Machine Chest Fly", sets: 4, reps: "12", restSeconds: 60 },
      { customName: "Cable Fly (high to low)", sets: 3, reps: "12", restSeconds: 60 },
      { customName: "Dumbbell Pullovers", sets: 3, reps: "12", restSeconds: 60 },
      { customName: "Push-up to Failure", sets: 2, reps: "AMRAP", restSeconds: 120 },
    ]
  },
  {
    name: "Back & Bicep Day",
    description: "Classic back and bicep workout for building a strong posterior chain",
    category: "gym",
    durationMinutes: 55,
    difficulty: "intermediate",
    equipment: ["Pull-up Bar", "Barbell", "Dumbbells", "Cable Machine"],
    warmup: ["Arm circles: 10 each direction", "Band pull-aparts: 15 reps", "Scapular pull-ups: 8 reps", "Light barbell rows: 10 reps"],
    cooldown: ["Lat Stretch: 60 sec", "Child's Pose: 60 sec", "Bicep Stretch: 30 sec each", "Cat-Cow: 60 sec"],
    exercises: [
      { customName: "Barbell Rows", sets: 5, reps: "5", restSeconds: 120 },
      { customName: "Weighted Pull-ups", sets: 4, reps: "6", restSeconds: 120 },
      { customName: "Dumbbell Rows (Single-Arm)", sets: 4, reps: "8 each", restSeconds: 90 },
      { customName: "Cable Row", sets: 3, reps: "10", restSeconds: 90 },
      { customName: "Barbell Curls", sets: 4, reps: "8", restSeconds: 90 },
      { customName: "Dumbbell Curls", sets: 3, reps: "10", restSeconds: 60 },
      { customName: "Face Pulls", sets: 3, reps: "15", restSeconds: 60 },
      { customName: "Hammer Curls", sets: 2, reps: "10", restSeconds: 60 },
    ]
  },
  {
    name: "Leg Day (Machine-Based)",
    description: "Beginner-friendly leg workout using gym machines",
    category: "gym",
    durationMinutes: 50,
    difficulty: "beginner",
    equipment: ["Leg Press", "Leg Curl", "Leg Extension", "Calf Raise", "Hip Machines"],
    warmup: ["5 min easy bike/treadmill", "Leg swings: 10 each direction", "Bodyweight lunges: 10 each"],
    cooldown: ["Quad Stretch: 45 sec each", "Hamstring Stretch: 45 sec each", "Pigeon Pose: 60 sec each", "Butterfly Stretch: 60 sec"],
    exercises: [
      { customName: "Leg Press", sets: 4, reps: "8", restSeconds: 120 },
      { customName: "Leg Extension", sets: 4, reps: "10", restSeconds: 90 },
      { customName: "Leg Curl", sets: 4, reps: "10", restSeconds: 90 },
      { customName: "Walking Lunges", sets: 3, reps: "10 each", restSeconds: 60 },
      { customName: "Calf Raise Machine", sets: 4, reps: "15", restSeconds: 60 },
      { customName: "Hip Abductor", sets: 3, reps: "12", restSeconds: 60 },
      { customName: "Hip Adductor", sets: 3, reps: "12", restSeconds: 60 },
    ]
  },
  
  // HOME WORKOUTS
  {
    name: "Full Body Home (No Equipment)",
    description: "Complete bodyweight workout you can do anywhere",
    category: "home",
    durationMinutes: 40,
    difficulty: "beginner",
    equipment: [],
    warmup: ["Arm circles: 10 each direction", "Bodyweight squats: 10 reps", "Inchworms: 8 reps", "High knees: 30 sec"],
    cooldown: ["Chest Stretch: 45 sec", "Quad Stretch: 45 sec each", "Hamstring Stretch: 60 sec", "Child's Pose: 60 sec"],
    exercises: [
      { customName: "Push-ups", sets: 3, reps: "12", restSeconds: 90, notes: "3 rounds circuit style" },
      { customName: "Bodyweight Squats", sets: 3, reps: "15", restSeconds: 0 },
      { customName: "Reverse Lunges", sets: 3, reps: "10 each", restSeconds: 0 },
      { customName: "Tricep Dips (chair)", sets: 3, reps: "10", restSeconds: 0 },
      { customName: "Glute Bridges", sets: 3, reps: "15", restSeconds: 0 },
      { customName: "Mountain Climbers", sets: 3, reps: "20", restSeconds: 0 },
      { customName: "Burpees", sets: 3, reps: "8", restSeconds: 0 },
      { customName: "Plank Hold", sets: 3, reps: "45 sec", restSeconds: 90 },
    ]
  },
  {
    name: "Upper Body Home",
    description: "Target your upper body with minimal equipment",
    category: "home",
    durationMinutes: 35,
    difficulty: "beginner",
    equipment: ["Chair (optional)"],
    warmup: ["Arm circles: 15 each direction", "Push-ups: 8 reps", "Inchworms: 8 reps"],
    cooldown: ["Chest Stretch: 45 sec", "Shoulder Stretch: 30 sec each", "Tricep Stretch: 30 sec each", "Child's Pose: 60 sec"],
    exercises: [
      { customName: "Push-ups", sets: 4, reps: "12", restSeconds: 60, notes: "Knee push-ups if needed" },
      { customName: "Pike Push-ups", sets: 4, reps: "8", restSeconds: 60, notes: "Targets shoulders" },
      { customName: "Tricep Dips", sets: 4, reps: "12", restSeconds: 60 },
      { customName: "Plank Hold", sets: 4, reps: "45 sec", restSeconds: 60 },
      { customName: "Superman Holds", sets: 4, reps: "20 sec", restSeconds: 60 },
      { customName: "Wide-Grip Push-ups", sets: 4, reps: "10", restSeconds: 60 },
      { customName: "Diamond Push-ups", sets: 4, reps: "8", restSeconds: 60 },
    ]
  },
  {
    name: "Lower Body Home (No Equipment)",
    description: "Build strong legs without any equipment",
    category: "home",
    durationMinutes: 40,
    difficulty: "intermediate",
    equipment: [],
    warmup: ["Leg swings: 10 each direction", "Bodyweight squats: 10 reps", "Lunges: 8 each"],
    cooldown: ["Quad Stretch: 45 sec each", "Hamstring Stretch: 60 sec", "Pigeon Pose: 60 sec each", "Butterfly Stretch: 60 sec"],
    exercises: [
      { customName: "Bodyweight Squats", sets: 4, reps: "20", restSeconds: 60 },
      { customName: "Walking Lunges", sets: 4, reps: "12 each", restSeconds: 60 },
      { customName: "Reverse Lunges", sets: 4, reps: "10 each", restSeconds: 60 },
      { customName: "Glute Bridges", sets: 4, reps: "15", restSeconds: 60 },
      { customName: "Single-Leg Glute Bridges", sets: 4, reps: "8 each", restSeconds: 60 },
      { customName: "Bulgarian Split Squats", sets: 4, reps: "10 each", restSeconds: 60, notes: "Use couch" },
      { customName: "Jump Squats", sets: 4, reps: "12", restSeconds: 60 },
      { customName: "Wall Sit", sets: 4, reps: "45 sec", restSeconds: 60 },
    ]
  },
  {
    name: "Home EMOM Workout",
    description: "Every Minute on the Minute high-intensity workout",
    category: "home",
    durationMinutes: 35,
    difficulty: "intermediate",
    equipment: [],
    warmup: ["Arm circles", "Leg swings", "Bodyweight squats"],
    cooldown: ["Chest Stretch: 45 sec", "Quad Stretch: 45 sec each", "Hamstring Stretch: 60 sec", "Child's Pose: 60 sec"],
    exercises: [
      { customName: "Push-ups", sets: 6, reps: "12", notes: "Minute 1 - repeat pattern 6x" },
      { customName: "Bodyweight Squats", sets: 6, reps: "15", notes: "Minute 2" },
      { customName: "Burpees", sets: 6, reps: "10", notes: "Minute 3" },
      { customName: "Plank Hold", sets: 6, reps: "30 sec", notes: "Minute 4" },
      { customName: "Rest", sets: 6, reps: "60 sec", notes: "Minute 5" },
    ]
  },

  // TRAVEL & HOTEL ROUTINES
  {
    name: "Hotel Room Full Body",
    description: "Quick full body workout for small spaces",
    category: "travel",
    durationMinutes: 30,
    difficulty: "beginner",
    equipment: ["Bed/Chair (optional)"],
    warmup: ["Arm circles: 10 each direction", "Bodyweight squats: 10 reps", "Inchworms: 5 reps"],
    cooldown: ["Chest Stretch: 30 sec", "Quad Stretch: 30 sec each", "Hamstring Stretch: 45 sec", "Child's Pose: 45 sec"],
    exercises: [
      { customName: "Push-ups", sets: 3, reps: "10", restSeconds: 60 },
      { customName: "Bodyweight Squats", sets: 3, reps: "12", restSeconds: 60 },
      { customName: "Tricep Dips (bed)", sets: 3, reps: "10", restSeconds: 60 },
      { customName: "Reverse Lunges", sets: 3, reps: "8 each", restSeconds: 60 },
      { customName: "Glute Bridges", sets: 3, reps: "12", restSeconds: 60 },
      { customName: "Plank Hold", sets: 3, reps: "30 sec", restSeconds: 60 },
      { customName: "High Knees", sets: 3, reps: "30 sec", restSeconds: 60 },
      { customName: "Superman Hold", sets: 3, reps: "20 sec", restSeconds: 60 },
    ]
  },
  {
    name: "Airport/Airplane Mobility",
    description: "Gentle mobility routine for travel days",
    category: "travel",
    durationMinutes: 20,
    difficulty: "beginner",
    equipment: ["Chair"],
    warmup: [],
    cooldown: [],
    exercises: [
      { customName: "Seated Marching", sets: 1, reps: "30 sec" },
      { customName: "Seated Spinal Twist", sets: 1, reps: "30 sec each" },
      { customName: "Seated Forward Fold", sets: 1, reps: "45 sec" },
      { customName: "Seated Hip Opener (figure-4)", sets: 1, reps: "45 sec each" },
      { customName: "Standing Quad Stretch", sets: 1, reps: "30 sec each" },
      { customName: "Standing Hamstring Stretch", sets: 1, reps: "45 sec" },
      { customName: "Standing Hip Circles", sets: 1, reps: "20 sec each direction" },
      { customName: "Calf Stretch", sets: 1, reps: "30 sec each" },
      { customName: "Arm Circles", sets: 1, reps: "30 sec" },
      { customName: "Shoulder Rolls", sets: 1, reps: "30 sec" },
      { customName: "Neck Stretches", sets: 1, reps: "20 sec each direction" },
    ]
  },

  // DUMBBELL ONLY ROUTINES
  {
    name: "Dumbbell Full Body Strength",
    description: "Complete workout using only dumbbells",
    category: "dumbbell",
    durationMinutes: 50,
    difficulty: "intermediate",
    equipment: ["Dumbbells"],
    warmup: ["Light cardio: 2 min", "Arm circles: 10 each", "Bodyweight squats: 10 reps", "Light dumbbell rows: 10 reps"],
    cooldown: ["Chest Stretch: 45 sec", "Quad Stretch: 45 sec each", "Hamstring Stretch: 60 sec", "Child's Pose: 60 sec"],
    exercises: [
      { customName: "Dumbbell Goblet Squats", sets: 4, reps: "8", restSeconds: 90 },
      { customName: "Dumbbell Rows (alternating)", sets: 4, reps: "8 each", restSeconds: 90 },
      { customName: "Dumbbell Bench Press", sets: 4, reps: "8", restSeconds: 90 },
      { customName: "Dumbbell Romanian Deadlift", sets: 3, reps: "10", restSeconds: 60 },
      { customName: "Dumbbell Overhead Press", sets: 3, reps: "8", restSeconds: 90 },
      { customName: "Dumbbell Curls", sets: 3, reps: "10", restSeconds: 60 },
      { customName: "Dumbbell Tricep Extension", sets: 3, reps: "10", restSeconds: 60 },
      { customName: "Dumbbell Farmer's Walk", sets: 3, reps: "40 meters", restSeconds: 60 },
    ]
  },
  {
    name: "Dumbbell Upper Body",
    description: "Upper body focused dumbbell workout",
    category: "dumbbell",
    durationMinutes: 45,
    difficulty: "beginner",
    equipment: ["Dumbbells"],
    warmup: ["Arm circles: 15 each direction", "Push-ups: 8 reps", "Light dumbbell rows: 10 reps"],
    cooldown: ["Chest Stretch: 45 sec", "Shoulder Stretch: 30 sec each", "Tricep Stretch: 30 sec each", "Child's Pose: 60 sec"],
    exercises: [
      { customName: "Dumbbell Rows", sets: 4, reps: "10 each", restSeconds: 90 },
      { customName: "Dumbbell Bench Press", sets: 4, reps: "10", restSeconds: 90 },
      { customName: "Dumbbell Incline Press", sets: 3, reps: "10", restSeconds: 60 },
      { customName: "Dumbbell Pullovers", sets: 3, reps: "12", restSeconds: 60 },
      { customName: "Dumbbell Curls", sets: 3, reps: "10", restSeconds: 60 },
      { customName: "Dumbbell Overhead Tricep Extension", sets: 3, reps: "10", restSeconds: 60 },
      { customName: "Dumbbell Lateral Raises", sets: 3, reps: "12", restSeconds: 60 },
      { customName: "Dumbbell Hammer Curls", sets: 2, reps: "10", restSeconds: 60 },
    ]
  },
  {
    name: "Dumbbell Lower Body",
    description: "Target your legs with dumbbells",
    category: "dumbbell",
    durationMinutes: 45,
    difficulty: "intermediate",
    equipment: ["Dumbbells"],
    warmup: ["Leg swings: 10 each direction", "Bodyweight squats: 10 reps", "Glute bridges: 10 reps"],
    cooldown: ["Quad Stretch: 45 sec each", "Hamstring Stretch: 60 sec", "Pigeon Pose: 60 sec each", "Hip Flexor Lunge: 45 sec each"],
    exercises: [
      { customName: "Dumbbell Goblet Squats", sets: 4, reps: "10", restSeconds: 90 },
      { customName: "Dumbbell Walking Lunges", sets: 3, reps: "12 each", restSeconds: 60 },
      { customName: "Dumbbell Romanian Deadlift", sets: 4, reps: "10", restSeconds: 90 },
      { customName: "Dumbbell Bulgarian Split Squat", sets: 3, reps: "10 each", restSeconds: 90 },
      { customName: "Dumbbell Sumo Squat", sets: 3, reps: "12", restSeconds: 60 },
      { customName: "Dumbbell Calf Raises", sets: 4, reps: "15", restSeconds: 60 },
      { customName: "Dumbbell Glute Bridge", sets: 3, reps: "12", restSeconds: 60 },
    ]
  },

  // CARDIO & HIIT
  {
    name: "HIIT Circuit",
    description: "High-intensity interval training for fat burning",
    category: "cardio",
    durationMinutes: 30,
    difficulty: "intermediate",
    equipment: [],
    warmup: ["Light jog in place: 2 min", "Arm circles", "Leg swings", "Bodyweight squats: 10"],
    cooldown: ["Walking in place: 2 min", "Quad Stretch: 30 sec each", "Hamstring Stretch: 45 sec", "Child's Pose: 60 sec"],
    exercises: [
      { customName: "Burpees", sets: 4, reps: "45 sec work, 15 sec rest" },
      { customName: "Mountain Climbers", sets: 4, reps: "45 sec work, 15 sec rest" },
      { customName: "Jump Squats", sets: 4, reps: "45 sec work, 15 sec rest" },
      { customName: "High Knees", sets: 4, reps: "45 sec work, 15 sec rest" },
      { customName: "Push-ups", sets: 4, reps: "45 sec work, 15 sec rest" },
      { customName: "Jumping Lunges", sets: 4, reps: "45 sec work, 15 sec rest" },
    ]
  },
  {
    name: "Tabata Training",
    description: "Classic 4-minute Tabata intervals",
    category: "cardio",
    durationMinutes: 25,
    difficulty: "advanced",
    equipment: [],
    warmup: ["Light cardio: 3 min", "Dynamic stretches: 2 min"],
    cooldown: ["Walking: 2 min", "Full body stretch: 5 min"],
    exercises: [
      { customName: "Burpees", sets: 8, reps: "20 sec work, 10 sec rest", notes: "Tabata 1" },
      { customName: "Rest", sets: 1, reps: "60 sec" },
      { customName: "Jump Squats", sets: 8, reps: "20 sec work, 10 sec rest", notes: "Tabata 2" },
      { customName: "Rest", sets: 1, reps: "60 sec" },
      { customName: "Mountain Climbers", sets: 8, reps: "20 sec work, 10 sec rest", notes: "Tabata 3" },
    ]
  },

  // BODYWEIGHT/CALISTHENICS
  {
    name: "Calisthenics Fundamentals",
    description: "Build strength with bodyweight basics",
    category: "bodyweight",
    durationMinutes: 45,
    difficulty: "beginner",
    equipment: ["Pull-up Bar (optional)"],
    warmup: ["Arm circles: 15 each", "Leg swings: 10 each", "Bodyweight squats: 15", "Push-ups: 5"],
    cooldown: ["Chest Stretch: 45 sec", "Shoulder Stretch: 30 sec each", "Hamstring Stretch: 60 sec", "Child's Pose: 60 sec"],
    exercises: [
      { customName: "Push-ups", sets: 4, reps: "10-15", restSeconds: 60 },
      { customName: "Bodyweight Squats", sets: 4, reps: "15-20", restSeconds: 60 },
      { customName: "Pike Push-ups", sets: 3, reps: "8-10", restSeconds: 60 },
      { customName: "Lunges", sets: 3, reps: "10 each", restSeconds: 60 },
      { customName: "Plank Hold", sets: 3, reps: "45 sec", restSeconds: 60 },
      { customName: "Glute Bridges", sets: 3, reps: "15", restSeconds: 60 },
      { customName: "Superman Hold", sets: 3, reps: "20 sec", restSeconds: 60 },
    ]
  },
  {
    name: "Advanced Calisthenics",
    description: "Challenge yourself with advanced bodyweight moves",
    category: "bodyweight",
    durationMinutes: 60,
    difficulty: "advanced",
    equipment: ["Pull-up Bar", "Parallel Bars (optional)"],
    warmup: ["Light cardio: 3 min", "Dynamic stretches: 5 min", "Light push-ups: 10", "Scapular pull-ups: 8"],
    cooldown: ["Full body stretch: 10 min"],
    exercises: [
      { customName: "Pull-ups", sets: 4, reps: "8-12", restSeconds: 120 },
      { customName: "Dips", sets: 4, reps: "10-15", restSeconds: 120 },
      { customName: "Pistol Squats", sets: 3, reps: "5-8 each", restSeconds: 120 },
      { customName: "Archer Push-ups", sets: 3, reps: "8 each", restSeconds: 90 },
      { customName: "L-Sit Hold", sets: 3, reps: "15-30 sec", restSeconds: 90 },
      { customName: "Nordic Curls", sets: 3, reps: "5-8", restSeconds: 90 },
      { customName: "Handstand Hold (wall)", sets: 3, reps: "30-60 sec", restSeconds: 120 },
    ]
  },

  // BAND (Resistance Band) ROUTINES
  {
    name: "Full Body Resistance Band",
    description: "Complete workout using only resistance bands",
    category: "band",
    durationMinutes: 40,
    difficulty: "beginner",
    equipment: ["Resistance Bands"],
    warmup: ["Arm circles: 10 each direction", "Bodyweight squats: 10 reps", "Hip circles: 10 each"],
    cooldown: ["Chest Stretch: 45 sec", "Shoulder Stretch: 30 sec each", "Quad Stretch: 30 sec each", "Child's Pose: 60 sec"],
    exercises: [
      { customName: "Band Pull-Aparts", sets: 3, reps: "15", restSeconds: 60 },
      { customName: "Band Rows", sets: 4, reps: "12", restSeconds: 60 },
      { customName: "Band Chest Press", sets: 3, reps: "12", restSeconds: 60 },
      { customName: "Band Squats", sets: 4, reps: "15", restSeconds: 60 },
      { customName: "Band Lateral Walks", sets: 3, reps: "10 each", restSeconds: 60 },
      { customName: "Band Bicep Curls", sets: 3, reps: "12", restSeconds: 60 },
      { customName: "Band Tricep Extensions", sets: 3, reps: "12", restSeconds: 60 },
      { customName: "Band Face Pulls", sets: 3, reps: "15", restSeconds: 60 },
    ]
  },
  {
    name: "Band Upper Body",
    description: "Target your upper body with resistance bands",
    category: "band",
    durationMinutes: 35,
    difficulty: "beginner",
    equipment: ["Resistance Bands"],
    warmup: ["Arm circles: 15 each direction", "Band pull-aparts: 10 reps", "Shoulder rolls: 30 sec"],
    cooldown: ["Chest Stretch: 45 sec", "Shoulder Stretch: 30 sec each", "Tricep Stretch: 30 sec each"],
    exercises: [
      { customName: "Band Pull-Aparts", sets: 3, reps: "15", restSeconds: 60 },
      { customName: "Band Rows", sets: 4, reps: "12", restSeconds: 60 },
      { customName: "Band Chest Press", sets: 4, reps: "12", restSeconds: 60 },
      { customName: "Band Shoulder Press", sets: 3, reps: "10", restSeconds: 60 },
      { customName: "Band Lateral Raises", sets: 3, reps: "12", restSeconds: 60 },
      { customName: "Band Bicep Curls", sets: 3, reps: "12", restSeconds: 60 },
      { customName: "Band Tricep Pushdowns", sets: 3, reps: "12", restSeconds: 60 },
      { customName: "Band Face Pulls", sets: 3, reps: "15", restSeconds: 60 },
    ]
  },
  {
    name: "Band Lower Body",
    description: "Build leg strength with resistance bands",
    category: "band",
    durationMinutes: 35,
    difficulty: "intermediate",
    equipment: ["Resistance Bands", "Mini Bands"],
    warmup: ["Leg swings: 10 each", "Bodyweight squats: 10 reps", "Glute bridges: 10 reps"],
    cooldown: ["Quad Stretch: 45 sec each", "Hamstring Stretch: 60 sec", "Pigeon Pose: 60 sec each"],
    exercises: [
      { customName: "Band Squats", sets: 4, reps: "15", restSeconds: 60 },
      { customName: "Band Romanian Deadlift", sets: 4, reps: "12", restSeconds: 60 },
      { customName: "Band Glute Bridges", sets: 3, reps: "15", restSeconds: 60 },
      { customName: "Band Lateral Walks", sets: 3, reps: "10 each", restSeconds: 60 },
      { customName: "Band Monster Walks", sets: 3, reps: "10 each", restSeconds: 60 },
      { customName: "Band Clamshells", sets: 3, reps: "15 each", restSeconds: 60 },
      { customName: "Band Kickbacks", sets: 3, reps: "12 each", restSeconds: 60 },
    ]
  },

  // SUSPENSION BAND (TRX-style) ROUTINES
  {
    name: "Suspension Full Body",
    description: "Complete suspension trainer workout for all muscle groups",
    category: "suspension",
    durationMinutes: 45,
    difficulty: "intermediate",
    equipment: ["Suspension Trainer (TRX)"],
    warmup: ["Arm circles: 10 each", "Bodyweight squats: 10 reps", "Suspension Y raises: 8 reps"],
    cooldown: ["Chest Stretch: 45 sec", "Lat Stretch: 30 sec each", "Quad Stretch: 30 sec each", "Child's Pose: 60 sec"],
    exercises: [
      { customName: "TRX Rows", sets: 4, reps: "12", restSeconds: 60 },
      { customName: "TRX Chest Press", sets: 4, reps: "10", restSeconds: 60 },
      { customName: "TRX Squats", sets: 3, reps: "15", restSeconds: 60 },
      { customName: "TRX Bicep Curls", sets: 3, reps: "12", restSeconds: 60 },
      { customName: "TRX Tricep Extensions", sets: 3, reps: "12", restSeconds: 60 },
      { customName: "TRX Lunges", sets: 3, reps: "10 each", restSeconds: 60 },
      { customName: "TRX Pike", sets: 3, reps: "10", restSeconds: 60 },
      { customName: "TRX Plank", sets: 3, reps: "30 sec", restSeconds: 60 },
    ]
  },
  {
    name: "Suspension Upper Body",
    description: "Target your upper body with suspension training",
    category: "suspension",
    durationMinutes: 40,
    difficulty: "intermediate",
    equipment: ["Suspension Trainer (TRX)"],
    warmup: ["Arm circles: 15 each", "Light TRX rows: 10 reps", "Shoulder circles: 30 sec"],
    cooldown: ["Chest Stretch: 45 sec", "Lat Stretch: 30 sec each", "Tricep Stretch: 30 sec each"],
    exercises: [
      { customName: "TRX Rows", sets: 4, reps: "12", restSeconds: 60 },
      { customName: "TRX Chest Press", sets: 4, reps: "12", restSeconds: 60 },
      { customName: "TRX Y Fly", sets: 3, reps: "10", restSeconds: 60 },
      { customName: "TRX T Fly", sets: 3, reps: "10", restSeconds: 60 },
      { customName: "TRX Bicep Curls", sets: 3, reps: "12", restSeconds: 60 },
      { customName: "TRX Tricep Extensions", sets: 3, reps: "12", restSeconds: 60 },
      { customName: "TRX Face Pulls", sets: 3, reps: "15", restSeconds: 60 },
      { customName: "TRX Push-ups", sets: 3, reps: "10", restSeconds: 60 },
    ]
  },
  {
    name: "Suspension Core Focus",
    description: "Build core strength with suspension training",
    category: "suspension",
    durationMinutes: 30,
    difficulty: "intermediate",
    equipment: ["Suspension Trainer (TRX)"],
    warmup: ["Cat-Cow: 30 sec", "Dead Bug: 10 reps", "Bird Dog: 10 reps"],
    cooldown: ["Child's Pose: 60 sec", "Spinal Twist: 30 sec each", "Hip Flexor Stretch: 45 sec each"],
    exercises: [
      { customName: "TRX Plank", sets: 3, reps: "45 sec", restSeconds: 60 },
      { customName: "TRX Pike", sets: 3, reps: "10", restSeconds: 60 },
      { customName: "TRX Mountain Climbers", sets: 3, reps: "20", restSeconds: 60 },
      { customName: "TRX Knee Tucks", sets: 3, reps: "12", restSeconds: 60 },
      { customName: "TRX Side Plank", sets: 3, reps: "30 sec each", restSeconds: 60 },
      { customName: "TRX Body Saw", sets: 3, reps: "10", restSeconds: 60 },
      { customName: "TRX Oblique Crunch", sets: 3, reps: "10 each", restSeconds: 60 },
    ]
  },
];

async function seedRoutines() {
  console.log('🏋️ Seeding premade routines...');
  
  try {
    // Clear existing premade routines
    await prisma.routineExercise.deleteMany({
      where: { routine: { isPremade: true } },
    });
    await prisma.routine.deleteMany({
      where: { isPremade: true },
    });
    console.log('Cleared existing premade routines');

    let created = 0;
    
    for (const routineData of premadeRoutines) {
      await prisma.routine.create({
        data: {
          name: routineData.name,
          description: routineData.description,
          category: routineData.category,
          durationMinutes: routineData.durationMinutes,
          difficulty: routineData.difficulty,
          equipment: JSON.stringify(routineData.equipment),
          warmup: JSON.stringify(routineData.warmup),
          cooldown: JSON.stringify(routineData.cooldown),
          isPremade: true,
          exercises: {
            create: routineData.exercises.map((ex, index) => ({
              customName: ex.customName,
              positionOrder: index,
              sets: ex.sets,
              reps: ex.reps,
              restSeconds: ex.restSeconds || null,
              notes: ex.notes || null,
            })),
          },
        },
      });
      created++;
    }

    console.log(`✅ Created ${created} premade routines`);
    
    // Show counts by category
    const categories = await prisma.routine.groupBy({
      by: ['category'],
      _count: true,
      where: { isPremade: true },
    });
    
    console.log('\nRoutines by category:');
    for (const cat of categories) {
      console.log(`  ${cat.category}: ${cat._count}`);
    }
    
  } catch (error) {
    console.error('Error seeding routines:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedRoutines();
