import { Router, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth, AuthRequest } from '../middleware/auth.js';
import { ApiError } from '../middleware/errorHandler.js';
import { z } from 'zod';

const router = Router();

// PATCH /api/v1/user/profile - Update user profile
const updateProfileSchema = z.object({
  username: z.string().min(3).optional(),
  email: z.string().email().optional(),
});

router.patch('/profile', requireAuth, async (req: AuthRequest, res: Response, next) => {
  try {
    const data = updateProfileSchema.parse(req.body);

    if (data.username) {
      const existing = await prisma.user.findUnique({ where: { username: data.username } });
      if (existing && existing.id !== req.userId) {
        throw new ApiError(409, 'USERNAME_TAKEN', 'Username is already taken');
      }
    }

    if (data.email) {
      const existing = await prisma.user.findUnique({ where: { email: data.email } });
      if (existing && existing.id !== req.userId) {
        throw new ApiError(409, 'EMAIL_TAKEN', 'Email is already taken');
      }
    }

    const user = await prisma.user.update({
      where: { id: req.userId },
      data,
      select: { id: true, email: true, username: true, createdAt: true },
    });

    res.json({ user });
  } catch (error) {
    next(error);
  }
});

// PUT /api/v1/user/onboarding - Save onboarding data
const onboardingSchema = z.object({
  primaryGoal: z.string().optional(),
  experienceLevel: z.string().optional(),
  toeTouchScore: z.number().optional(),
  shoulderReachScore: z.number().optional(),
  hipFlexibilityScore: z.number().optional(),
  overallFlexibilityScore: z.number().optional(),
  flexibilityLevel: z.string().optional(),
  workoutDays: z.array(z.string()).optional(),
  preferredWorkoutTime: z.string().optional(),
  stretchingPreference: z.string().optional(),
  completed: z.boolean().optional(),
  skipped: z.boolean().optional(),
});

router.put('/onboarding', requireAuth, async (req: AuthRequest, res: Response, next) => {
  try {
    const data = onboardingSchema.parse(req.body);

    const onboarding = await prisma.userOnboarding.upsert({
      where: { userId: req.userId! },
      create: {
        userId: req.userId!,
        primaryGoal: data.primaryGoal,
        experienceLevel: data.experienceLevel,
        toeTouchScore: data.toeTouchScore,
        shoulderReachScore: data.shoulderReachScore,
        hipFlexibilityScore: data.hipFlexibilityScore,
        overallFlexibilityScore: data.overallFlexibilityScore,
        flexibilityLevel: data.flexibilityLevel,
        workoutDays: data.workoutDays ? JSON.stringify(data.workoutDays) : null,
        preferredWorkoutTime: data.preferredWorkoutTime,
        stretchingPreference: data.stretchingPreference,
        completedAt: data.completed ? new Date() : null,
        skipped: data.skipped ?? false,
      },
      update: {
        primaryGoal: data.primaryGoal,
        experienceLevel: data.experienceLevel,
        toeTouchScore: data.toeTouchScore,
        shoulderReachScore: data.shoulderReachScore,
        hipFlexibilityScore: data.hipFlexibilityScore,
        overallFlexibilityScore: data.overallFlexibilityScore,
        flexibilityLevel: data.flexibilityLevel,
        workoutDays: data.workoutDays ? JSON.stringify(data.workoutDays) : undefined,
        preferredWorkoutTime: data.preferredWorkoutTime,
        stretchingPreference: data.stretchingPreference,
        completedAt: data.completed ? new Date() : undefined,
        skipped: data.skipped,
      },
    });

    res.json({
      onboarding: {
        ...onboarding,
        workoutDays: onboarding.workoutDays ? JSON.parse(onboarding.workoutDays) : [],
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/user/settings - Get notification preferences
router.get('/settings', requireAuth, async (req: AuthRequest, res: Response, next) => {
  try {
    const prefs = await prisma.notificationPreference.findUnique({
      where: { userId: req.userId! },
    });

    if (!prefs) {
      return res.json({ notifications: null });
    }

    res.json({
      notifications: {
        ...prefs,
        reminderDays: prefs.reminderDays ? JSON.parse(prefs.reminderDays) : [],
      },
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/v1/user/settings - Update notification preferences
const settingsSchema = z.object({
  notificationsEnabled: z.boolean().optional(),
  stretchReminders: z.boolean().optional(),
  workoutReminders: z.boolean().optional(),
  streakNotifications: z.boolean().optional(),
  goalNotifications: z.boolean().optional(),
  socialNotifications: z.boolean().optional(),
  recoverySuggestions: z.boolean().optional(),
  inactivityNudges: z.boolean().optional(),
  quietHoursEnabled: z.boolean().optional(),
  quietHoursStart: z.string().optional(),
  quietHoursEnd: z.string().optional(),
  maxDailyNotifications: z.number().optional(),
  stretchReminderTime: z.string().optional(),
  workoutReminderTime: z.string().optional(),
  reminderDays: z.array(z.string()).optional(),
});

router.put('/settings', requireAuth, async (req: AuthRequest, res: Response, next) => {
  try {
    const data = settingsSchema.parse(req.body);

    const prefs = await prisma.notificationPreference.upsert({
      where: { userId: req.userId! },
      create: {
        userId: req.userId!,
        ...data,
        reminderDays: data.reminderDays ? JSON.stringify(data.reminderDays) : undefined,
      },
      update: {
        ...data,
        reminderDays: data.reminderDays ? JSON.stringify(data.reminderDays) : undefined,
      },
    });

    res.json({
      notifications: {
        ...prefs,
        reminderDays: prefs.reminderDays ? JSON.parse(prefs.reminderDays) : [],
      },
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/v1/user/push-token - Register Expo push token
const pushTokenSchema = z.object({
  pushToken: z.string().min(1),
});

router.put('/push-token', requireAuth, async (req: AuthRequest, res: Response, next) => {
  try {
    const { pushToken } = pushTokenSchema.parse(req.body);

    await prisma.user.update({
      where: { id: req.userId },
      data: { expoPushToken: pushToken },
    });

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/user/subscription - Get current subscription
router.get('/subscription', requireAuth, async (req: AuthRequest, res: Response, next) => {
  try {
    const sub = await prisma.subscription.findUnique({
      where: { userId: req.userId! },
    });

    res.json({ subscription: sub });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/user/subscription - Create or update subscription (after purchase)
const subscriptionSchema = z.object({
  planType: z.string(),
  status: z.string(),
  provider: z.string(),
  providerSubscriptionId: z.string().optional(),
  providerCustomerId: z.string().optional(),
  pricePaid: z.number().optional(),
  expiresAt: z.string().datetime().optional(),
});

router.post('/subscription', requireAuth, async (req: AuthRequest, res: Response, next) => {
  try {
    const data = subscriptionSchema.parse(req.body);

    const sub = await prisma.subscription.upsert({
      where: { userId: req.userId! },
      create: {
        userId: req.userId!,
        planType: data.planType,
        status: data.status,
        provider: data.provider,
        providerSubscriptionId: data.providerSubscriptionId,
        providerCustomerId: data.providerCustomerId,
        pricePaid: data.pricePaid,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
        startedAt: new Date(),
      },
      update: {
        planType: data.planType,
        status: data.status,
        provider: data.provider,
        providerSubscriptionId: data.providerSubscriptionId,
        providerCustomerId: data.providerCustomerId,
        pricePaid: data.pricePaid,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      },
    });

    res.json({ subscription: sub });
  } catch (error) {
    next(error);
  }
});

export default router;
