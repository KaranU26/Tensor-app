import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================
// STRETCHES (Core Library - 30 stretches)
// ============================================

const stretches = [
  // Lower Body (10)
  {
    name: 'Standing Hamstring Stretch',
    description: 'Classic standing stretch targeting the hamstrings',
    durationSeconds: 30,
    difficulty: 'beginner',
    primaryMuscles: ['hamstrings'],
    secondaryMuscles: ['calves', 'lower_back'],
    instructions: 'Stand tall, extend one leg forward with heel on ground, hinge at hips keeping back straight.',
    tips: ['Keep your back straight', 'Breathe deeply into the stretch', 'Don\'t bounce'],
    commonMistakes: ['Rounding the back', 'Locking the knee', 'Holding breath'],
    equipment: [],
    tags: ['hamstrings', 'legs', 'beginner', 'standing']
  },
  {
    name: 'Seated Forward Fold',
    description: 'Deep hamstring and lower back stretch while seated',
    durationSeconds: 45,
    difficulty: 'beginner',
    primaryMuscles: ['hamstrings'],
    secondaryMuscles: ['lower_back', 'calves'],
    instructions: 'Sit with legs extended, hinge at hips reaching toward toes.',
    tips: ['Lead with your chest', 'Keep legs straight but not locked'],
    commonMistakes: ['Rounding excessively', 'Pulling on feet'],
    equipment: [],
    tags: ['hamstrings', 'back', 'seated', 'beginner']
  },
  {
    name: 'Pigeon Pose',
    description: 'Deep hip opener targeting glutes and hip flexors',
    durationSeconds: 60,
    difficulty: 'intermediate',
    primaryMuscles: ['glutes', 'hip_flexors'],
    secondaryMuscles: ['lower_back'],
    instructions: 'From hands and knees, bring one knee forward, extend opposite leg back, lower hips toward floor.',
    tips: ['Keep hips square', 'Use a block under hip if needed'],
    commonMistakes: ['Tilting to one side', 'Forcing the stretch'],
    equipment: ['yoga_mat'],
    tags: ['hips', 'glutes', 'yoga', 'intermediate']
  },
  {
    name: 'Quad Stretch (Standing)',
    description: 'Standing stretch for the quadriceps',
    durationSeconds: 30,
    difficulty: 'beginner',
    primaryMuscles: ['quadriceps'],
    secondaryMuscles: ['hip_flexors'],
    instructions: 'Stand on one leg, bend opposite knee bringing heel toward glute, hold ankle.',
    tips: ['Keep knees together', 'Stand tall', 'Use wall for balance if needed'],
    commonMistakes: ['Arching lower back', 'Knee flaring out'],
    equipment: [],
    tags: ['quads', 'legs', 'standing', 'beginner']
  },
  {
    name: 'Hip Flexor Lunge Stretch',
    description: 'Deep lunge targeting hip flexors',
    durationSeconds: 45,
    difficulty: 'beginner',
    primaryMuscles: ['hip_flexors'],
    secondaryMuscles: ['quadriceps', 'glutes'],
    instructions: 'Kneel on one knee, front foot flat on floor, push hips forward gently.',
    tips: ['Engage core', 'Keep front knee over ankle', 'Squeeze back glute'],
    commonMistakes: ['Leaning forward', 'Front knee going past toes'],
    equipment: ['yoga_mat'],
    tags: ['hips', 'legs', 'kneeling', 'beginner']
  },
  {
    name: 'Butterfly Stretch',
    description: 'Seated stretch for inner thighs and hips',
    durationSeconds: 45,
    difficulty: 'beginner',
    primaryMuscles: ['adductors', 'hips'],
    secondaryMuscles: ['groin'],
    instructions: 'Sit with soles of feet together, knees out to sides, gently press knees down.',
    tips: ['Sit tall', 'Hold ankles not toes', 'Use elbows to press knees'],
    commonMistakes: ['Rounding back', 'Forcing knees down'],
    equipment: ['yoga_mat'],
    tags: ['hips', 'groin', 'seated', 'beginner']
  },
  {
    name: 'Calf Stretch (Wall)',
    description: 'Wall-assisted stretch for calves',
    durationSeconds: 30,
    difficulty: 'beginner',
    primaryMuscles: ['calves'],
    secondaryMuscles: ['achilles'],
    instructions: 'Face wall, step one foot back, press heel into floor, lean forward.',
    tips: ['Back leg straight', 'Heel stays on ground', 'Lean into wall'],
    commonMistakes: ['Lifting back heel', 'Bending back knee'],
    equipment: [],
    tags: ['calves', 'legs', 'standing', 'beginner']
  },
  {
    name: 'Figure Four Stretch',
    description: 'Supine stretch for piriformis and glutes',
    durationSeconds: 45,
    difficulty: 'beginner',
    primaryMuscles: ['glutes', 'piriformis'],
    secondaryMuscles: ['hips'],
    instructions: 'Lie on back, cross one ankle over opposite knee, pull legs toward chest.',
    tips: ['Keep head on floor', 'Flex crossed foot', 'Relax shoulders'],
    commonMistakes: ['Lifting head', 'Holding breath'],
    equipment: ['yoga_mat'],
    tags: ['glutes', 'hips', 'supine', 'beginner']
  },
  {
    name: 'IT Band Stretch (Standing)',
    description: 'Standing stretch for the iliotibial band',
    durationSeconds: 30,
    difficulty: 'intermediate',
    primaryMuscles: ['it_band'],
    secondaryMuscles: ['hips', 'glutes'],
    instructions: 'Cross one leg behind the other, lean to the side of the back leg.',
    tips: ['Keep both feet flat', 'Reach overhead for deeper stretch'],
    commonMistakes: ['Bending forward', 'Lifting back heel'],
    equipment: [],
    tags: ['it_band', 'legs', 'standing', 'intermediate']
  },
  {
    name: 'Deep Squat Hold',
    description: 'Full squat position for hip and ankle mobility',
    durationSeconds: 60,
    difficulty: 'intermediate',
    primaryMuscles: ['hips', 'ankles'],
    secondaryMuscles: ['glutes', 'calves'],
    instructions: 'Squat down as low as possible, heels on floor, elbows pressing knees out.',
    tips: ['Hold onto something if needed', 'Keep chest up'],
    commonMistakes: ['Heels coming up', 'Knees caving in'],
    equipment: [],
    tags: ['hips', 'ankles', 'full_body', 'intermediate']
  },

  // Upper Body (10)
  {
    name: 'Doorway Chest Stretch',
    description: 'Stretch for chest and anterior shoulders using a doorway',
    durationSeconds: 30,
    difficulty: 'beginner',
    primaryMuscles: ['chest'],
    secondaryMuscles: ['shoulders', 'biceps'],
    instructions: 'Place forearm on doorframe at 90 degrees, step through doorway.',
    tips: ['Keep core engaged', 'Don\'t arch back'],
    commonMistakes: ['Arching lower back', 'Shoulder rolling forward'],
    equipment: [],
    tags: ['chest', 'shoulders', 'standing', 'beginner']
  },
  {
    name: 'Cross-Body Shoulder Stretch',
    description: 'Classic shoulder stretch pulling arm across body',
    durationSeconds: 30,
    difficulty: 'beginner',
    primaryMuscles: ['shoulders'],
    secondaryMuscles: ['upper_back'],
    instructions: 'Pull one arm across chest with opposite hand at or above elbow.',
    tips: ['Keep shoulder down', 'Look straight ahead'],
    commonMistakes: ['Raising shoulder', 'Twisting torso'],
    equipment: [],
    tags: ['shoulders', 'upper_body', 'standing', 'beginner']
  },
  {
    name: 'Overhead Tricep Stretch',
    description: 'Stretch for triceps with arm overhead',
    durationSeconds: 30,
    difficulty: 'beginner',
    primaryMuscles: ['triceps'],
    secondaryMuscles: ['shoulders', 'lats'],
    instructions: 'Raise one arm overhead, bend elbow, use other hand to gently push elbow back.',
    tips: ['Keep core engaged', 'Don\'t lean to side'],
    commonMistakes: ['Leaning', 'Pushing too hard'],
    equipment: [],
    tags: ['triceps', 'arms', 'standing', 'beginner']
  },
  {
    name: 'Neck Side Tilt',
    description: 'Gentle neck stretch for the sides of the neck',
    durationSeconds: 30,
    difficulty: 'beginner',
    primaryMuscles: ['neck'],
    secondaryMuscles: ['trapezius'],
    instructions: 'Tilt head to one side, bringing ear toward shoulder.',
    tips: ['Keep shoulders down', 'Gentle pressure with hand optional'],
    commonMistakes: ['Raising shoulder', 'Forcing the stretch'],
    equipment: [],
    tags: ['neck', 'upper_body', 'seated', 'beginner']
  },
  {
    name: 'Cat-Cow Stretch',
    description: 'Dynamic spinal mobility exercise',
    durationSeconds: 45,
    difficulty: 'beginner',
    primaryMuscles: ['spine'],
    secondaryMuscles: ['core', 'shoulders'],
    instructions: 'On hands and knees, alternate between arching and rounding the spine.',
    tips: ['Move slowly', 'Breathe with the movement', 'Keep arms straight'],
    commonMistakes: ['Moving too fast', 'Not engaging core'],
    equipment: ['yoga_mat'],
    tags: ['spine', 'back', 'kneeling', 'beginner']
  },
  {
    name: 'Child\'s Pose',
    description: 'Restful stretch for back, hips, and shoulders',
    durationSeconds: 60,
    difficulty: 'beginner',
    primaryMuscles: ['lower_back'],
    secondaryMuscles: ['hips', 'shoulders', 'lats'],
    instructions: 'Kneel, sit back on heels, extend arms forward on floor, rest forehead down.',
    tips: ['Spread knees for deeper hip stretch', 'Breathe into lower back'],
    commonMistakes: ['Tensing shoulders', 'Not relaxing fully'],
    equipment: ['yoga_mat'],
    tags: ['back', 'hips', 'relaxation', 'beginner']
  },
  {
    name: 'Thread the Needle',
    description: 'Rotational stretch for thoracic spine and shoulders',
    durationSeconds: 45,
    difficulty: 'intermediate',
    primaryMuscles: ['thoracic_spine', 'shoulders'],
    secondaryMuscles: ['lats', 'chest'],
    instructions: 'From hands and knees, thread one arm under body, rotating spine.',
    tips: ['Follow your hand with your eyes', 'Keep hips stable'],
    commonMistakes: ['Hips shifting', 'Not rotating enough'],
    equipment: ['yoga_mat'],
    tags: ['spine', 'shoulders', 'rotation', 'intermediate']
  },
  {
    name: 'Lat Stretch (Wall)',
    description: 'Wall-assisted stretch for the latissimus dorsi',
    durationSeconds: 30,
    difficulty: 'beginner',
    primaryMuscles: ['lats'],
    secondaryMuscles: ['shoulders', 'triceps'],
    instructions: 'Face wall, place hands high on wall, step back and push hips back.',
    tips: ['Keep arms straight', 'Push chest toward floor'],
    commonMistakes: ['Bending elbows', 'Arching lower back'],
    equipment: [],
    tags: ['lats', 'back', 'standing', 'beginner']
  },
  {
    name: 'Wrist Flexor Stretch',
    description: 'Stretch for the forearm flexors',
    durationSeconds: 20,
    difficulty: 'beginner',
    primaryMuscles: ['forearms'],
    secondaryMuscles: ['wrists'],
    instructions: 'Extend arm, palm up, use other hand to gently pull fingers back.',
    tips: ['Keep arm straight', 'Gentle pressure only'],
    commonMistakes: ['Bending elbow', 'Pulling too hard'],
    equipment: [],
    tags: ['forearms', 'wrists', 'arms', 'beginner']
  },
  {
    name: 'Upper Trap Stretch',
    description: 'Targeted stretch for upper trapezius',
    durationSeconds: 30,
    difficulty: 'beginner',
    primaryMuscles: ['trapezius'],
    secondaryMuscles: ['neck'],
    instructions: 'Tilt head to side and slightly forward, gentle pressure with hand.',
    tips: ['Keep opposite shoulder down', 'Breathe deeply'],
    commonMistakes: ['Raising shoulder', 'Pulling too aggressively'],
    equipment: [],
    tags: ['traps', 'neck', 'seated', 'beginner']
  },

  // Full Body / Dynamic (10)
  {
    name: 'Downward Dog',
    description: 'Classic yoga pose stretching entire posterior chain',
    durationSeconds: 45,
    difficulty: 'beginner',
    primaryMuscles: ['hamstrings', 'calves', 'shoulders'],
    secondaryMuscles: ['lats', 'spine'],
    instructions: 'From plank, push hips up and back into inverted V shape.',
    tips: ['Pedal feet to warm up calves', 'Press chest toward thighs'],
    commonMistakes: ['Rounding back', 'Locking elbows'],
    equipment: ['yoga_mat'],
    tags: ['full_body', 'yoga', 'beginner']
  },
  {
    name: 'World\'s Greatest Stretch',
    description: 'Dynamic full-body stretch hitting multiple muscle groups',
    durationSeconds: 60,
    difficulty: 'intermediate',
    primaryMuscles: ['hip_flexors', 'hamstrings', 'thoracic_spine'],
    secondaryMuscles: ['glutes', 'shoulders', 'groin'],
    instructions: 'Lunge forward, place same-side elbow inside foot, rotate and reach up.',
    tips: ['Move through slowly', 'Keep back leg straight'],
    commonMistakes: ['Rushing movements', 'Not rotating enough'],
    equipment: ['yoga_mat'],
    tags: ['full_body', 'dynamic', 'warmup', 'intermediate']
  },
  {
    name: 'Standing Side Stretch',
    description: 'Lateral stretch for obliques and lats',
    durationSeconds: 30,
    difficulty: 'beginner',
    primaryMuscles: ['obliques', 'lats'],
    secondaryMuscles: ['shoulders', 'intercostals'],
    instructions: 'Raise one arm overhead, lean to opposite side.',
    tips: ['Keep hips squared', 'Reach up and over'],
    commonMistakes: ['Leaning forward', 'Twisting'],
    equipment: [],
    tags: ['obliques', 'lats', 'standing', 'beginner']
  },
  {
    name: 'Scorpion Stretch',
    description: 'Dynamic stretch for hip flexors and spine',
    durationSeconds: 45,
    difficulty: 'advanced',
    primaryMuscles: ['hip_flexors', 'spine'],
    secondaryMuscles: ['chest', 'shoulders'],
    instructions: 'Lie face down, rotate one leg over body toward opposite hand.',
    tips: ['Keep shoulders down', 'Move slowly and controlled'],
    commonMistakes: ['Moving too fast', 'Forcing rotation'],
    equipment: ['yoga_mat'],
    tags: ['hips', 'spine', 'advanced', 'dynamic']
  },
  {
    name: 'Lying Spinal Twist',
    description: 'Supine rotational stretch for spine',
    durationSeconds: 45,
    difficulty: 'beginner',
    primaryMuscles: ['spine', 'obliques'],
    secondaryMuscles: ['glutes', 'chest'],
    instructions: 'Lie on back, bring one knee across body while keeping shoulders flat.',
    tips: ['Look opposite direction from knee', 'Let gravity do the work'],
    commonMistakes: ['Lifting shoulders', 'Forcing the rotation'],
    equipment: ['yoga_mat'],
    tags: ['spine', 'rotation', 'supine', 'beginner']
  },
  {
    name: 'Happy Baby Pose',
    description: 'Relaxing hip opener on back',
    durationSeconds: 45,
    difficulty: 'beginner',
    primaryMuscles: ['hips', 'groin'],
    secondaryMuscles: ['lower_back', 'hamstrings'],
    instructions: 'Lie on back, grab outsides of feet, pull knees toward armpits.',
    tips: ['Keep lower back on floor', 'Rock side to side gently'],
    commonMistakes: ['Lifting head', 'Tensing shoulders'],
    equipment: ['yoga_mat'],
    tags: ['hips', 'groin', 'relaxation', 'beginner']
  },
  {
    name: 'Cobra Stretch',
    description: 'Gentle backbend stretching the front body',
    durationSeconds: 30,
    difficulty: 'beginner',
    primaryMuscles: ['hip_flexors', 'abs'],
    secondaryMuscles: ['chest', 'spine'],
    instructions: 'Lie face down, place hands by shoulders, press up keeping hips on floor.',
    tips: ['Keep elbows slightly bent', 'Engage glutes'],
    commonMistakes: ['Lifting too high', 'Tensing shoulders'],
    equipment: ['yoga_mat'],
    tags: ['back', 'abs', 'yoga', 'beginner']
  },
  {
    name: 'Frog Stretch',
    description: 'Deep groin and hip stretch on all fours',
    durationSeconds: 60,
    difficulty: 'intermediate',
    primaryMuscles: ['groin', 'adductors'],
    secondaryMuscles: ['hips'],
    instructions: 'From hands and knees, spread knees wide, push hips back.',
    tips: ['Use padding under knees', 'Move slowly into position'],
    commonMistakes: ['Going too deep too fast', 'Arching back'],
    equipment: ['yoga_mat'],
    tags: ['groin', 'hips', 'intermediate']
  },
  {
    name: 'Seated Spinal Twist',
    description: 'Seated rotation for the spine',
    durationSeconds: 45,
    difficulty: 'beginner',
    primaryMuscles: ['spine', 'obliques'],
    secondaryMuscles: ['glutes', 'hips'],
    instructions: 'Sit with legs extended, cross one leg over, twist toward bent knee.',
    tips: ['Sit tall', 'Use arm to deepen twist'],
    commonMistakes: ['Rounding back', 'Forcing rotation'],
    equipment: ['yoga_mat'],
    tags: ['spine', 'rotation', 'seated', 'beginner']
  },
  {
    name: 'Standing Forward Fold',
    description: 'Standing full forward fold for posterior chain',
    durationSeconds: 45,
    difficulty: 'beginner',
    primaryMuscles: ['hamstrings'],
    secondaryMuscles: ['calves', 'lower_back'],
    instructions: 'Stand with feet hip-width, fold forward from hips letting arms hang.',
    tips: ['Bend knees if needed', 'Let head hang heavy', 'Grab opposite elbows'],
    commonMistakes: ['Locking knees', 'Rounding excessively'],
    equipment: [],
    tags: ['hamstrings', 'back', 'standing', 'beginner']
  }
];

// ============================================
// ROUTINES (Pre-built - 10 routines)
// ============================================

const routines = [
  {
    name: 'Quick Morning Mobility',
    description: '5-minute routine to wake up your body and get moving',
    difficulty: 'beginner',
    targetAreas: ['spine', 'hips', 'shoulders'],
    tags: ['morning', 'quick', 'mobility', 'daily'],
    stretches: ['Cat-Cow Stretch', 'Downward Dog', 'Standing Side Stretch', 'Hip Flexor Lunge Stretch', 'Neck Side Tilt']
  },
  {
    name: 'Post-Leg Day Recovery',
    description: 'Essential stretches after an intense leg workout',
    difficulty: 'beginner',
    targetAreas: ['hamstrings', 'quads', 'glutes', 'hips'],
    tags: ['post-workout', 'legs', 'recovery'],
    stretches: ['Standing Hamstring Stretch', 'Quad Stretch (Standing)', 'Pigeon Pose', 'Figure Four Stretch', 'Calf Stretch (Wall)']
  },
  {
    name: 'Upper Body Recovery',
    description: 'Relieve tension after pushing or pulling workouts',
    difficulty: 'beginner',
    targetAreas: ['chest', 'shoulders', 'back', 'arms'],
    tags: ['post-workout', 'upper-body', 'recovery'],
    stretches: ['Doorway Chest Stretch', 'Cross-Body Shoulder Stretch', 'Overhead Tricep Stretch', 'Lat Stretch (Wall)', 'Cat-Cow Stretch']
  },
  {
    name: 'Desk Worker Relief',
    description: 'Counteract hours of sitting with targeted stretches',
    difficulty: 'beginner',
    targetAreas: ['hips', 'back', 'neck', 'shoulders'],
    tags: ['office', 'desk', 'posture', 'daily'],
    stretches: ['Hip Flexor Lunge Stretch', 'Doorway Chest Stretch', 'Neck Side Tilt', 'Upper Trap Stretch', 'Seated Spinal Twist']
  },
  {
    name: 'Evening Wind Down',
    description: 'Relaxing routine to prepare for sleep',
    difficulty: 'beginner',
    targetAreas: ['full_body', 'relaxation'],
    tags: ['evening', 'relaxation', 'sleep', 'gentle'],
    stretches: ['Child\'s Pose', 'Lying Spinal Twist', 'Happy Baby Pose', 'Seated Forward Fold', 'Neck Side Tilt']
  },
  {
    name: 'Hip Opener Flow',
    description: 'Deep hip stretches for improved mobility',
    difficulty: 'intermediate',
    targetAreas: ['hips', 'glutes', 'groin'],
    tags: ['hips', 'mobility', 'flexibility'],
    stretches: ['Butterfly Stretch', 'Pigeon Pose', 'Hip Flexor Lunge Stretch', 'Frog Stretch', 'Deep Squat Hold']
  },
  {
    name: 'Full Body Flexibility',
    description: 'Comprehensive stretch routine hitting all major areas',
    difficulty: 'intermediate',
    targetAreas: ['full_body'],
    tags: ['full-body', 'flexibility', 'comprehensive'],
    stretches: ['Downward Dog', 'World\'s Greatest Stretch', 'Pigeon Pose', 'Doorway Chest Stretch', 'Seated Forward Fold', 'Lying Spinal Twist']
  },
  {
    name: 'Pre-Workout Dynamic Warmup',
    description: 'Dynamic stretches to prepare your body for exercise',
    difficulty: 'beginner',
    targetAreas: ['full_body', 'warmup'],
    tags: ['warmup', 'dynamic', 'pre-workout'],
    stretches: ['Cat-Cow Stretch', 'World\'s Greatest Stretch', 'Deep Squat Hold', 'Standing Side Stretch', 'Downward Dog']
  },
  {
    name: 'Runner\'s Recovery',
    description: 'Essential stretches for after running',
    difficulty: 'beginner',
    targetAreas: ['legs', 'hips', 'calves'],
    tags: ['running', 'cardio', 'recovery'],
    stretches: ['Standing Hamstring Stretch', 'Quad Stretch (Standing)', 'Calf Stretch (Wall)', 'IT Band Stretch (Standing)', 'Hip Flexor Lunge Stretch']
  },
  {
    name: 'Spine Health',
    description: 'Maintain spinal mobility and reduce back pain',
    difficulty: 'beginner',
    targetAreas: ['spine', 'back'],
    tags: ['spine', 'back', 'mobility', 'pain-relief'],
    stretches: ['Cat-Cow Stretch', 'Child\'s Pose', 'Thread the Needle', 'Cobra Stretch', 'Lying Spinal Twist']
  }
];

// ============================================
// STRENGTH EXERCISES (Core Library - 20 exercises)
// ============================================

const exercises = [
  // Push Exercises - MET 6.0 for vigorous weight lifting
  { name: 'Bench Press', category: 'push', primaryMuscles: ['chest'], secondaryMuscles: ['shoulders', 'triceps'], equipment: ['barbell', 'bench'], description: 'Classic compound pressing movement', forceType: 'push', mechanic: 'compound', metValue: 6.0, is1RMEligible: true },
  { name: 'Incline Dumbbell Press', category: 'push', primaryMuscles: ['upper_chest'], secondaryMuscles: ['shoulders', 'triceps'], equipment: ['dumbbells', 'incline_bench'], description: 'Upper chest focused pressing', forceType: 'push', mechanic: 'compound', metValue: 6.0, is1RMEligible: true },
  { name: 'Overhead Press', category: 'push', primaryMuscles: ['shoulders'], secondaryMuscles: ['triceps', 'core'], equipment: ['barbell'], description: 'Vertical pressing for shoulders', forceType: 'push', mechanic: 'compound', metValue: 6.0, is1RMEligible: true },
  { name: 'Dumbbell Lateral Raise', category: 'push', primaryMuscles: ['shoulders'], secondaryMuscles: [], equipment: ['dumbbells'], description: 'Lateral deltoid isolation', forceType: 'push', mechanic: 'isolation', metValue: 3.5, is1RMEligible: false },
  { name: 'Tricep Pushdown', category: 'push', primaryMuscles: ['triceps'], secondaryMuscles: [], equipment: ['cable'], description: 'Tricep isolation', forceType: 'push', mechanic: 'isolation', metValue: 3.5, is1RMEligible: false },
  
  // Pull Exercises
  { name: 'Barbell Row', category: 'pull', primaryMuscles: ['back'], secondaryMuscles: ['biceps', 'rear_delts'], equipment: ['barbell'], description: 'Horizontal pull for back thickness', forceType: 'pull', mechanic: 'compound', metValue: 6.0, is1RMEligible: true },
  { name: 'Lat Pulldown', category: 'pull', primaryMuscles: ['lats'], secondaryMuscles: ['biceps'], equipment: ['cable'], description: 'Vertical pull for lat width', forceType: 'pull', mechanic: 'compound', metValue: 5.0, is1RMEligible: false },
  { name: 'Pull-ups', category: 'pull', primaryMuscles: ['lats'], secondaryMuscles: ['biceps', 'forearms'], equipment: ['pull_up_bar'], description: 'Bodyweight vertical pull', forceType: 'pull', mechanic: 'compound', metValue: 8.0, is1RMEligible: false },
  { name: 'Dumbbell Curl', category: 'pull', primaryMuscles: ['biceps'], secondaryMuscles: ['forearms'], equipment: ['dumbbells'], description: 'Classic bicep isolation', forceType: 'pull', mechanic: 'isolation', metValue: 3.5, is1RMEligible: false },
  { name: 'Face Pulls', category: 'pull', primaryMuscles: ['rear_delts'], secondaryMuscles: ['upper_back'], equipment: ['cable'], description: 'Rear delt and rotator cuff work', forceType: 'pull', mechanic: 'isolation', metValue: 3.5, is1RMEligible: false },
  
  // Legs
  { name: 'Barbell Squat', category: 'legs', primaryMuscles: ['quads', 'glutes'], secondaryMuscles: ['hamstrings', 'core'], equipment: ['barbell', 'squat_rack'], description: 'King of leg exercises', forceType: 'push', mechanic: 'compound', metValue: 6.0, is1RMEligible: true },
  { name: 'Romanian Deadlift', category: 'legs', primaryMuscles: ['hamstrings'], secondaryMuscles: ['glutes', 'lower_back'], equipment: ['barbell'], description: 'Hip hinge for posterior chain', forceType: 'pull', mechanic: 'compound', metValue: 6.0, is1RMEligible: true },
  { name: 'Leg Press', category: 'legs', primaryMuscles: ['quads', 'glutes'], secondaryMuscles: ['hamstrings'], equipment: ['leg_press'], description: 'Machine compound leg movement', forceType: 'push', mechanic: 'compound', metValue: 5.0, is1RMEligible: true },
  { name: 'Walking Lunges', category: 'legs', primaryMuscles: ['quads', 'glutes'], secondaryMuscles: ['hamstrings'], equipment: ['dumbbells'], description: 'Unilateral leg work', forceType: 'push', mechanic: 'compound', metValue: 6.0, is1RMEligible: false },
  { name: 'Leg Curl', category: 'legs', primaryMuscles: ['hamstrings'], secondaryMuscles: [], equipment: ['machine'], description: 'Hamstring isolation', forceType: 'pull', mechanic: 'isolation', metValue: 3.5, is1RMEligible: false },
  { name: 'Calf Raises', category: 'legs', primaryMuscles: ['calves'], secondaryMuscles: [], equipment: ['machine'], description: 'Calf isolation', forceType: 'push', mechanic: 'isolation', metValue: 3.5, is1RMEligible: false },
  
  // Core & Full Body
  { name: 'Deadlift', category: 'full_body', primaryMuscles: ['back', 'glutes', 'hamstrings'], secondaryMuscles: ['forearms', 'core'], equipment: ['barbell'], description: 'Ultimate full body strength builder', forceType: 'pull', mechanic: 'compound', metValue: 6.0, is1RMEligible: true },
  { name: 'Plank', category: 'core', primaryMuscles: ['core'], secondaryMuscles: ['shoulders'], equipment: [], description: 'Core stability hold', forceType: 'static', mechanic: 'isolation', metValue: 3.0, is1RMEligible: false },
  { name: 'Cable Crunch', category: 'core', primaryMuscles: ['abs'], secondaryMuscles: [], equipment: ['cable'], description: 'Weighted ab isolation', forceType: 'pull', mechanic: 'isolation', metValue: 3.5, is1RMEligible: false },
  { name: 'Farmer Carries', category: 'full_body', primaryMuscles: ['forearms', 'core'], secondaryMuscles: ['traps', 'shoulders'], equipment: ['dumbbells'], description: 'Loaded carry for grip and stability', forceType: 'static', mechanic: 'compound', metValue: 6.0, is1RMEligible: false },
];

async function seed() {
  console.log('🌱 Seeding database...');

  // Clear existing data
  await prisma.routineStretch.deleteMany();
  await prisma.stretchingRoutine.deleteMany();
  await prisma.stretch.deleteMany();
  await prisma.exercise.deleteMany();

  console.log('📝 Creating stretches...');
  
  // Create stretches
  const createdStretches = await Promise.all(
    stretches.map((stretch) =>
      prisma.stretch.create({
        data: {
          name: stretch.name,
          description: stretch.description,
          durationSeconds: stretch.durationSeconds,
          difficulty: stretch.difficulty,
          primaryMuscles: JSON.stringify(stretch.primaryMuscles),
          secondaryMuscles: JSON.stringify(stretch.secondaryMuscles),
          instructions: stretch.instructions,
          tips: JSON.stringify(stretch.tips),
          commonMistakes: JSON.stringify(stretch.commonMistakes),
          equipment: JSON.stringify(stretch.equipment),
          tags: JSON.stringify(stretch.tags)
        }
      })
    )
  );

  console.log(`✅ Created ${createdStretches.length} stretches`);

  // Create a map of stretch names to IDs
  const stretchMap = new Map(createdStretches.map((s) => [s.name, s.id]));

  console.log('📝 Creating routines...');

  // Create routines
  for (const routine of routines) {
    const stretchIds = routine.stretches
      .map((name) => stretchMap.get(name))
      .filter((id): id is string => id !== undefined);

    const totalDuration = routine.stretches.reduce((sum, name) => {
      const stretch = stretches.find((s) => s.name === name);
      return sum + (stretch?.durationSeconds || 30);
    }, 0);

    await prisma.stretchingRoutine.create({
      data: {
        name: routine.name,
        description: routine.description,
        difficulty: routine.difficulty,
        durationSeconds: totalDuration,
        targetAreas: JSON.stringify(routine.targetAreas),
        tags: JSON.stringify(routine.tags),
        isPublic: true,
        isSystem: true,
        stretches: {
          create: stretchIds.map((stretchId, index) => ({
            stretchId,
            positionOrder: index + 1
          }))
        }
      }
    });
  }

  console.log(`✅ Created ${routines.length} routines`);

  console.log('💪 Creating exercises...');

  // Create exercises
  const createdExercises = await Promise.all(
    exercises.map((exercise) =>
      prisma.exercise.create({
        data: {
          name: exercise.name,
          description: exercise.description,
          category: exercise.category,
          primaryMuscles: JSON.stringify(exercise.primaryMuscles),
          secondaryMuscles: JSON.stringify(exercise.secondaryMuscles),
          equipmentNeeded: JSON.stringify(exercise.equipment),
          forceType: exercise.forceType,
          mechanic: exercise.mechanic,
          metValue: exercise.metValue,
          is1RMEligible: exercise.is1RMEligible,
          isCompound: exercise.mechanic === 'compound',
        }
      })
    )
  );

  console.log(`✅ Created ${createdExercises.length} exercises`);
  console.log('🎉 Seeding complete!');
}

seed()
  .catch((e) => {
    console.error('Error seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

