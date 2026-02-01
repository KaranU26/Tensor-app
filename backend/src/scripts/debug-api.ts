// Debug script to check what ExerciseDB API is returning
import fetch from 'node-fetch';
import * as dotenv from 'dotenv';

dotenv.config();

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = process.env.RAPIDAPI_HOST || 'exercisedb.p.rapidapi.com';

async function checkAPI() {
  console.log('API Key:', RAPIDAPI_KEY ? RAPIDAPI_KEY.substring(0, 10) + '...' : 'MISSING');
  console.log('Host:', RAPIDAPI_HOST);
  
  const response = await fetch(`https://${RAPIDAPI_HOST}/exercises?limit=2`, {
    headers: {
      'X-RapidAPI-Key': RAPIDAPI_KEY!,
      'X-RapidAPI-Host': RAPIDAPI_HOST,
    },
  });
  
  const data = await response.json() as any[];
  
  console.log('\n=== First Exercise ===');
  console.log(JSON.stringify(data[0], null, 2));
  
  console.log('\n=== Has gifUrl? ===', data[0]?.gifUrl ? 'YES' : 'NO');
}

checkAPI().catch(console.error);
