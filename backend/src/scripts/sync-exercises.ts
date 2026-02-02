/**
 * Sync Exercises Script
 * Run this to populate/update the local exercise database from ExerciseDB
 * 
 * Usage: npx ts-node src/scripts/sync-exercises.ts
 */

import { PrismaClient } from '@prisma/client';
import { fetchAllExercises, ExerciseDBExercise } from '../services/exercisedb';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const prisma = new PrismaClient();

async function syncExercises() {
  console.log('Starting exercise sync from ExerciseDB...');
  console.log('---');
  
  try {
    // Fetch all exercises from ExerciseDB API
    const apiExercises = await fetchAllExercises();
    
    console.log(`Syncing ${apiExercises.length} exercises to local database...`);
    
    let created = 0;
    let updated = 0;
    let errors = 0;
    
    // Process in batches to avoid memory issues
    const batchSize = 100;
    
    for (let i = 0; i < apiExercises.length; i += batchSize) {
      const batch = apiExercises.slice(i, i + batchSize);
      
      await Promise.all(batch.map(async (exercise: ExerciseDBExercise) => {
        try {
          // Check if exercise already exists by externalId
          const existing = await prisma.exercise.findUnique({
            where: { externalId: exercise.id }
          });

          if (existing) {
            // Update existing
            await prisma.exercise.update({
              where: { externalId: exercise.id },
              data: {
                name: exercise.name,
                bodyPart: exercise.bodyPart,
                equipment: exercise.equipment,
                target: exercise.target,
                secondaryMuscles: JSON.stringify(exercise.secondaryMuscles || []),
                instructions: JSON.stringify(exercise.instructions || []),
                gifUrl: exercise.gifUrl,
                // Additional fields from upgraded API
                description: exercise.description || null,
                difficulty: exercise.difficulty || 'beginner',
                category: exercise.category || mapEquipmentToCategory(exercise.equipment),
              },
            });
            updated++;
          } else {
            // Create new
            await prisma.exercise.create({
              data: {
                externalId: exercise.id,
                name: exercise.name,
                bodyPart: exercise.bodyPart,
                equipment: exercise.equipment,
                target: exercise.target,
                category: exercise.category || mapEquipmentToCategory(exercise.equipment),
                primaryMuscles: JSON.stringify([exercise.target]),
                secondaryMuscles: JSON.stringify(exercise.secondaryMuscles || []),
                instructions: JSON.stringify(exercise.instructions || []),
                gifUrl: exercise.gifUrl,
                // Additional fields from upgraded API
                description: exercise.description || null,
                difficulty: exercise.difficulty || 'beginner',
              },
            });
            created++;
          }
        } catch (err) {
          errors++;
          console.error(`Error syncing exercise ${exercise.id}: ${exercise.name}`, err);
        }
      }));
      
      // Progress indicator
      const progress = Math.min(i + batchSize, apiExercises.length);
      console.log(`Progress: ${progress}/${apiExercises.length} (${Math.round(progress / apiExercises.length * 100)}%)`);
    }
    
    console.log('---');
    console.log('Sync complete!');
    console.log(`Created: ${created}`);
    console.log(`Updated: ${updated}`);
    console.log(`Errors: ${errors}`);
    
    // Show final count
    const totalCount = await prisma.exercise.count();
    console.log(`Total exercises in database: ${totalCount}`);
    
  } catch (error) {
    console.error('Sync failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Map ExerciseDB equipment to our category system
 */
function mapEquipmentToCategory(equipment: string): string {
  const mapping: Record<string, string> = {
    'barbell': 'barbell',
    'dumbbell': 'dumbbell',
    'cable': 'cable',
    'kettlebell': 'kettlebell',
    'band': 'resistance_band',
    'body weight': 'bodyweight',
    'assisted': 'machine',
    'leverage machine': 'machine',
    'sled machine': 'machine',
    'smith machine': 'machine',
    'weighted': 'weighted',
    'olympic barbell': 'barbell',
    'ez barbell': 'barbell',
    'trap bar': 'barbell',
    'medicine ball': 'other',
    'stability ball': 'other',
    'bosu ball': 'other',
    'roller': 'other',
    'rope': 'cable',
    'skierg machine': 'machine',
    'stationary bike': 'machine',
    'stepmill machine': 'machine',
    'tire': 'other',
    'upper body ergometer': 'machine',
    'wheel roller': 'other',
  };
  
  return mapping[equipment.toLowerCase()] || 'other';
}

// Run sync
syncExercises();
