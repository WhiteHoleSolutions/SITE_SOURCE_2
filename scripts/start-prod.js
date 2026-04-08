#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting production server...');

// Create disk directory if it doesn't exist (for production)
const diskPath = '/app/disk';
if (!fs.existsSync(diskPath)) {
  console.log(`📁 Creating directory: ${diskPath}`);
  try {
    fs.mkdirSync(diskPath, { recursive: true });
  } catch (err) {
    console.warn(`⚠️  Could not create ${diskPath}:`, err.message);
  }
}

// Run database migrations
console.log('🔄 Running database migrations...');
try {
  execSync('npx prisma migrate deploy', { stdio: 'inherit' });
  console.log('✅ Migrations completed successfully');
} catch (err) {
  console.error('❌ Migration failed:', err.message);
  console.log('⚠️  Continuing anyway...');
}

// Seed database if needed (first deployment)
const dbPath = path.join(diskPath, 'production.db');
const isFirstRun = !fs.existsSync(dbPath);

if (isFirstRun) {
  console.log('🌱 First run detected - seeding database...');
  try {
    execSync('npx tsx prisma/seed.ts', { stdio: 'inherit' });
    console.log('✅ Database seeded successfully');
  } catch (err) {
    console.error('⚠️  Seeding failed:', err.message);
    console.log('Continuing anyway...');
  }
}

// Start Next.js server
console.log('🎯 Starting Next.js server...');
execSync('npm start', { stdio: 'inherit' });
