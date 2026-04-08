#!/bin/bash

echo "Generating Prisma client..."
npx prisma generate

echo "Setting up database directory..."
mkdir -p /app/disk

echo "Running database migrations..."
npx prisma migrate deploy

echo "Seeding database..."
npx tsx prisma/seed.ts || echo "Seeding skipped or failed"

echo "Build script completed!"
