# White Hole Solutions - Quick Start Guide

## Setup Instructions

### 1. Install Dependencies
\`\`\`bash
npm install
\`\`\`

### 2. Configure Environment
Copy `.env.example` to `.env` and update with your values:
\`\`\`bash
cp .env.example .env
\`\`\`

### 3. Setup Database
\`\`\`bash
# Create database and tables
npx prisma migrate dev

# Seed with admin user
npx prisma db seed
\`\`\`

### 4. Run Development Server
\`\`\`bash
npm run dev
\`\`\`

Visit: http://localhost:3000

## Default Admin Login

Email: admin@whiteholesolutions.com
Password: ChangeThisPassword123!

(Or whatever you set in your .env file)

## Deployment to Render

1. **Create PostgreSQL Database** on Render
2. **Create Web Service** connected to your Git repo
3. **Set Environment Variables**:
   - DATABASE_URL
   - JWT_SECRET
   - REVOLUT_API_KEY
   - ADMIN_EMAIL
   - ADMIN_PASSWORD

4. **Configure Build**:
   - Build Command: `chmod +x build.sh && ./build.sh && npm run build`
   - Start Command: `npm start`

## Key Features

✅ Public portfolio with hero banner
✅ Inquiry form with auto customer creation
✅ Admin panel for managing albums, customers, invoices
✅ Customer portal with private galleries
✅ Revolut payment integration
✅ Image/video upload and protection
✅ Privacy controls for albums
✅ Invoice tracking and analytics

## Project Structure

\`\`\`
├── src/
│   ├── app/              # Next.js pages
│   │   ├── api/          # API routes
│   │   ├── admin/        # Admin panel
│   │   ├── dashboard/    # Customer portal
│   │   └── login/        # Login page
│   ├── components/       # React components
│   └── lib/              # Utilities & helpers
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── seed.ts           # Database seeding
└── public/
    └── uploads/          # Uploaded media files
\`\`\`

## Need Help?

Check README.md for detailed documentation.
