#!/usr/bin/env tsx

import { seedDatabase } from './seed-database.js';

async function main() {
  console.log('🌱 CapturedCCollective Database Seeding');
  console.log('=====================================');
  
  try {
    const result = await seedDatabase();
    console.log('\n🎉 Seeding completed successfully!');
    console.log(result);
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Seeding failed:', error);
    process.exit(1);
  }
}

main();