/**
 * Download GIFs Script
 * Rate limited to 2 requests/second (120/minute)
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = process.env.RAPIDAPI_HOST || 'exercisedb.p.rapidapi.com';
const GIF_RESOLUTION = 360;

// 120 requests/minute = 2/second = 500ms between requests
const DELAY_MS = 550; // Slightly conservative

const GIFS_DIR = path.join(__dirname, '../../public/gifs');

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function downloadGifs() {
  console.log('🎬 GIF Download (120 req/min rate limit)');
  console.log(`📁 ${GIFS_DIR}`);
  console.log('---');

  if (!fs.existsSync(GIFS_DIR)) {
    fs.mkdirSync(GIFS_DIR, { recursive: true });
  }

  if (!RAPIDAPI_KEY) {
    console.error('❌ RAPIDAPI_KEY not set');
    process.exit(1);
  }

  const exercises = await prisma.exercise.findMany({
    where: { externalId: { not: null } },
    select: { externalId: true, name: true },
    orderBy: { name: 'asc' },
  });

  const existingFiles = new Set(fs.readdirSync(GIFS_DIR).map(f => f.replace('.gif', '')));
  const toDownload = exercises.filter(e => !existingFiles.has(e.externalId!));

  console.log(`✅ Already: ${existingFiles.size} | 📥 Remaining: ${toDownload.length}`);

  if (toDownload.length === 0) {
    console.log('🎉 All done!');
    await prisma.$disconnect();
    return;
  }

  let downloaded = 0;
  let errors = 0;

  for (let i = 0; i < toDownload.length; i++) {
    const ex = toDownload[i];
    const gifPath = path.join(GIFS_DIR, `${ex.externalId}.gif`);

    try {
      const url = `https://${RAPIDAPI_HOST}/image?exerciseId=${ex.externalId}&resolution=${GIF_RESOLUTION}`;
      const res = await fetch(url, {
        headers: { 'X-RapidAPI-Key': RAPIDAPI_KEY!, 'X-RapidAPI-Host': RAPIDAPI_HOST },
      });

      if (res.status === 429) {
        console.log('⚠️ Rate limited - waiting 60s...');
        await sleep(60000);
        i--; // Retry this one
        continue;
      }

      if (!res.ok) {
        errors++;
      } else {
        const buf = await res.arrayBuffer();
        fs.writeFileSync(gifPath, Buffer.from(buf));
        downloaded++;
      }

      // Progress every 50
      if ((i + 1) % 50 === 0 || i === toDownload.length - 1) {
        console.log(`Progress: ${existingFiles.size + downloaded}/${exercises.length} (${Math.round((existingFiles.size + downloaded) / exercises.length * 100)}%)`);
      }

    } catch (err) {
      errors++;
    }

    await sleep(DELAY_MS);
  }

  console.log('---');
  console.log(`✅ Downloaded: ${downloaded} | ❌ Errors: ${errors}`);
  console.log(`📊 Total: ${existingFiles.size + downloaded}/${exercises.length}`);

  // Size
  let size = 0;
  for (const f of fs.readdirSync(GIFS_DIR)) {
    size += fs.statSync(path.join(GIFS_DIR, f)).size;
  }
  console.log(`💾 Size: ${(size / 1024 / 1024).toFixed(0)} MB`);

  await prisma.$disconnect();
}

downloadGifs();
