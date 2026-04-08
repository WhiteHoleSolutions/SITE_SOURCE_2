# White Hole Solutions - Business Media Portfolio & Client Management

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org)

A comprehensive full-stack web application for managing business media portfolios, client relationships, invoicing, and financial analytics. Perfect for photographers, videographers, and media production companies.

![Hero Banner](https://via.placeholder.com/1200x400/0071e3/ffffff?text=White+Hole+Solutions)

---

## 🌟 Features

### 🌐 Public Website
- **Dynamic Hero Banner**: Rotating media slider showcasing your best work from public albums
- **Portfolio Gallery**: Public albums displayed in an elegant grid layout
- **Inquiry Form**: Automatic customer profile creation from inquiries
- **Responsive Design**: Mobile-first design that works beautifully on all devices

### 👤 Customer Portal
- **Private Galleries**: Secure access to albums assigned by admin
- **Media Download**: Download high-quality images and videos
- **Invoice Management**: View and pay invoices with payment link integration
- **Dashboard Analytics**: Track spending and completed jobs
- **Profile Management**: View account details and history

### 🔧 Admin Panel
- **Album Management**: Create public/private albums with media upload
- **Customer Management**: Add customers manually or from inquiries, manage passwords
- **Access Control**: Assign specific customers to private albums
- **Invoice System**: 
  - Create detailed invoices with line items
  - PDF generation with business branding
  - Payment link integration (Revolut or custom)
  - Status tracking (Draft, Sent, Paid, Overdue, Cancelled)
- **Inquiry Management**: 
  - Search, filter, and sort customer inquiries
  - Status tracking (New, Contacted, Converted, Closed)
  - Delete with confirmation
- **Bills of Sale**: Track items sold with full details
- **Expense Tracking**: Monitor business expenses with GST calculation
- **Analytics Dashboard**: 
  - Revenue and expense reports
  - Tax position (GST collected vs. claimable)
  - Monthly financial summaries
  - By-category breakdowns
- **Business Settings**: Configure company info, tax rates, and payment terms

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org) (App Router) with TypeScript
- **Database**: [SQLite](https://www.sqlite.org) with [Prisma ORM](https://www.prisma.io)
- **Authentication**: JWT with HTTP-only cookies
- **Styling**: [Tailwind CSS](https://tailwindcss.com)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **PDF Generation**: jsPDF with autotable
- **Payment Integration**: Revolut Business API (optional)
- **Deployment**: [Render.com](https://render.com) with persistent disk storage

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18.0.0 or higher
- npm or yarn package manager

### Local Development Setup

1. **Clone the repository**
   \`\`\`bash
   git clone https://github.com/yourusername/white-hole-solutions.git
   cd white-hole-solutions
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Set up environment variables**
   \`\`\`bash
   cp .env.example .env
   \`\`\`
   
   Edit \`.env\` with your values:
   \`\`\`env
   DATABASE_URL="file:./dev.db"
   JWT_SECRET="your-secret-key"  # Generate with: openssl rand -base64 32
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   REVOLUT_API_KEY="your-api-key"  # Optional
   REVOLUT_API_URL="https://sandbox-b2b.revolut.com/api/1.0"
   ADMIN_EMAIL="admin@whiteholesolutions.com"
   ADMIN_PASSWORD="YourSecurePassword123!"
   \`\`\`

4. **Initialize the database**
   \`\`\`bash
   npx prisma migrate dev
   npx prisma db seed
   \`\`\`

5. **Run the development server**
   \`\`\`bash
   npm run dev
   \`\`\`

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

### Default Admin Login

After seeding:
- **Email**: Value from \`ADMIN_EMAIL\` in .env
- **Password**: Value from \`ADMIN_PASSWORD\` in .env

⚠️ **Change these credentials immediately after first login!**

---

## 📦 Deployment to Render

### Quick Deploy (Recommended)

This project uses **SQLite with Render's persistent disk** - no external database required!

1. **Fork or push this repository to GitHub**

2. **Click the Deploy Button** (or follow manual steps below)
   
   [![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

3. **Configure Environment Variables** in Render Dashboard:
   - \`NEXT_PUBLIC_APP_URL\`: Your Render app URL (e.g., \`https://your-app.onrender.com\`)
   - \`JWT_SECRET\`: Auto-generated (or set your own via \`openssl rand -base64 32\`)
   - \`ADMIN_PASSWORD\`: Auto-generated (check Render dashboard after deployment)
   - \`REVOLUT_API_KEY\`: Your Revolut API key (optional)

4. **Wait for deployment** - The build script will:
   - Install dependencies
   - Generate Prisma client
   - Run database migrations
   - Seed initial data
   - Build the Next.js app

5. **Access your site** at \`https://your-app.onrender.com\`

### Manual Deployment Steps

1. **Create Web Service on Render**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New +" → "Blueprint" (if using render.yaml)
   - Or "New +" → "Web Service" (manual setup)
   - Connect your GitHub repository

2. **Configure Service**
   - **Name**: \`white-hole-solutions\` (or your choice)
   - **Environment**: Node
   - **Build Command**: \`chmod +x build.sh && ./build.sh && npm run build\`
   - **Start Command**: \`npm start\`
   - **Plan**: Starter or higher

3. **Add Persistent Disk** (Critical for SQLite!)
   - In service settings → "Disks"
   - Click "Add Disk"
   - **Name**: \`sqlite-data\`
   - **Mount Path**: \`/app/disk\`
   - **Size**: 1 GB (or more if needed)

4. **Set Environment Variables**
   \`\`\`env
   DATABASE_URL=file:/app/disk/production.db
   NODE_ENV=production
   NEXT_PUBLIC_APP_URL=https://your-app.onrender.com
   JWT_SECRET=your-generated-secret
   REVOLUT_API_KEY=your-api-key-if-needed
   REVOLUT_API_URL=https://sandbox-b2b.revolut.com/api/1.0
   ADMIN_EMAIL=admin@yourdomain.com
   ADMIN_PASSWORD=YourSecurePassword123!
   \`\`\`

5. **Deploy!**

### Post-Deployment

1. Visit your app URL
2. Click "Client Login"
3. Log in with your \`ADMIN_EMAIL\` and \`ADMIN_PASSWORD\`
4. **Important**: Change admin password in settings!
5. Configure business information in Admin Panel → Settings

---

## 📚 Usage Guide

### For Admins

#### Setting Up Your Business
1. Navigate to **Admin Panel** → **Settings**
2. Fill in your business details (name, ABN, contact info)
3. Set tax rate and payment terms
4. Save changes

#### Creating Albums
1. Go to **Albums** tab
2. Click **"Add Album"**
3. Choose **PUBLIC** (visible to all) or **PRIVATE** (for specific customers)
4. Upload media files (images/videos)
5. Set cover image and description

#### Managing Private Album Access
1. In Albums list, click **"Access"** on a private album
2. Select customers who should have access
3. Save - customers will see the album in their dashboard

#### Creating Invoices
1. Go to **Invoices** tab
2. Click **"Create Invoice"**
3. Select customer, add line items
4. Set tax, notes, due date, and payment link
5. Invoice appears in customer dashboard with **"Pay Now"** button

#### Managing Inquiries
1. Go to **Inquiries** tab
2. Search, filter by status, or sort by date/name
3. Change status: NEW → CONTACTED → CONVERTED → CLOSED
4. Delete unwanted inquiries

#### Tracking Finances
1. Go to **Analytics** tab
2. View:
   - Total revenue and expenses
   - Tax position (GST collected vs claimable)
   - Monthly breakdowns
   - By-category summaries
3. Set date range filters for specific periods

### For Customers

#### Submitting an Inquiry
1. Visit homepage
2. Scroll to **"Get in Touch"**
3. Fill out form - account is auto-created
4. Wait for admin to contact you with login credentials

#### Viewing Private Albums
1. Log in to customer portal
2. See **"Your Private Albums"** section
3. Click album to view media
4. Click download button on images/videos

#### Paying Invoices
1. Log in to dashboard
2. Scroll to **"Your Invoices"**
3. Click **"Pay Now"** on unpaid invoices
4. Complete payment via provided link

---

## 🗄️ Database Schema

The application uses SQLite with the following main models:

- **User**: Authentication and basic info
- **Customer**: Extended customer data, links to User
- **Album**: Media collections (public/private)
- **Media**: Individual files in albums
- **AlbumAccess**: Junction table for customer-album permissions
- **Inquiry**: Customer inquiry submissions
- **Invoice**: Billing documents with line items
- **BillOfSale**: Sold items tracking
- **Expense**: Business expense tracking
- **BusinessInfo**: Company configuration (singleton)

See \`prisma/schema.prisma\` for complete schema.

---

## 🔒 Security Features

- ✅ JWT authentication with HTTP-only cookies
- ✅ Password hashing with bcryptjs
- ✅ Protected API routes with middleware
- ✅ Role-based access control (Admin/Customer)
- ✅ Image protection (prevents casual downloading)
- ✅ SQL injection protection via Prisma
- ✅ XSS protection via React escaping
- ✅ Environment variable security

---

## 🎨 Customization

### Branding
- Update business name in \`ADMIN_EMAIL\` during first deployment
- Modify in Admin Panel → Settings after deployment
- Business info appears on:
  - Hero banner
  - Navbar
  - Footer
  - Login page
  - Invoices (PDF)

### Colors
Edit \`tailwind.config.ts\`:
\`\`\`typescript
colors: {
  primary: { /* Your brand colors */ },
  dark: { /* Dark theme colors */ }
}
\`\`\`

### Features
Toggle features in admin components:
- Disable Revolut: Remove payment integration code
- Add new tabs: Create new component in \`src/components/admin/\`
- Modify workflow: Update status options in respective tabs

---

## 📁 Project Structure

\`\`\`
white-hole-solutions/
├── prisma/
│   ├── schema.prisma          # Database schema
│   ├── seed.ts                # Database seeding
│   └── migrations/            # Migration history
├── public/
│   └── uploads/               # User-uploaded media (gitignored)
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── api/               # API routes
│   │   ├── admin/             # Admin panel page
│   │   ├── dashboard/         # Customer dashboard
│   │   └── login/             # Login page
│   ├── components/            # React components
│   │   ├── admin/             # Admin panel tabs
│   │   ├── Hero.tsx
│   │   ├── Portfolio.tsx
│   │   └── ...
│   └── lib/                   # Utilities
│       ├── auth.ts            # Authentication helpers
│       ├── db.ts              # Prisma client
│       ├── pdf.ts             # PDF generation
│       └── utils.ts           # Common utilities
├── .env.example               # Environment template
├── build.sh                   # Render build script
├── render.yaml                # Render configuration
└── package.json
\`\`\`

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (\`git checkout -b feature/AmazingFeature\`)
3. Commit your changes (\`git commit -m 'Add some AmazingFeature'\`)
4. Push to the branch (\`git push origin feature/AmazingFeature\`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🐛 Troubleshooting

### Database Issues

**Problem**: "Cannot find database file"
- **Solution**: Ensure persistent disk is mounted at \`/app/disk\` on Render
- Check \`DATABASE_URL\` points to \`file:/app/disk/production.db\`

**Problem**: "Prisma Client validation errors"
- **Solution**: Run \`npx prisma generate\` locally or redeploy

### Build Failures

**Problem**: Build fails on Render
- Check build logs for specific errors
- Ensure \`build.sh\` has execute permissions
- Verify all environment variables are set

### Authentication Issues

**Problem**: "Unauthorized" errors
- Clear browser cookies
- Check \`JWT_SECRET\` is set
- Verify token expiration hasn't passed

### File Upload Issues

**Problem**: Uploads failing
- Check \`/public/uploads\` directory exists
- Verify write permissions
- Check file size limits in \`next.config.js\`

---

## 💡 Tips & Best Practices

- **Regular Backups**: Download your SQLite database regularly from Render disk
- **Image Optimization**: Use Next.js Image component for better performance
- **Security**: Rotate JWT_SECRET periodically
- **Monitoring**: Check Render logs for errors and performance
- **Updates**: Keep dependencies updated with \`npm update\`

---

## 🌍 Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| \`DATABASE_URL\` | Yes | \`file:./dev.db\` | SQLite database path |
| \`JWT_SECRET\` | Yes | - | Secret for JWT tokens (32+ chars) |
| \`NEXT_PUBLIC_APP_URL\` | Yes | \`http://localhost:3000\` | Your app's public URL |
| \`ADMIN_EMAIL\` | Yes | - | Initial admin email |
| \`ADMIN_PASSWORD\` | Yes | - | Initial admin password |
| \`REVOLUT_API_KEY\` | No | - | Revolut Business API key |
| \`REVOLUT_API_URL\` | No | Sandbox URL | Revolut API endpoint |
| \`NODE_ENV\` | No | \`development\` | Environment mode |

---

## 📞 Support

- **Documentation**: Check \`DEPLOYMENT.md\` and \`SETUP.md\` for detailed guides
- **Issues**: [GitHub Issues](https://github.com/yourusername/white-hole-solutions/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/white-hole-solutions/discussions)

---

## 🎯 Roadmap

- [ ] Email notifications for invoices and inquiries
- [ ] Multi-language support
- [ ] Advanced analytics with charts
- [ ] Calendar integration for bookings
- [ ] Mobile app (React Native)
- [ ] Stripe payment integration option
- [ ] Automated backup to cloud storage
- [ ] Contract generation and e-signatures

---

## 👏 Acknowledgments

- Built with [Next.js](https://nextjs.org) by Vercel
- Database powered by [Prisma](https://www.prisma.io)
- UI components styled with [Tailwind CSS](https://tailwindcss.com)
- Icons from [Lucide](https://lucide.dev)
- Hosted on [Render](https://render.com)

---

## ⭐ Show Your Support

If this project helped you, please consider giving it a ⭐ on GitHub!

---

**Built with ❤️ for the media production community**

\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Set up environment variables:
\`\`\`bash
cp .env.example .env
\`\`\`

Edit `.env` with your actual values:
- `DATABASE_URL`: Your PostgreSQL connection string
- `JWT_SECRET`: Generate with `openssl rand -base64 32`
- `REVOLUT_API_KEY`: Your Revolut Business API key
- `ADMIN_EMAIL` & `ADMIN_PASSWORD`: Initial admin credentials

4. Set up the database:
\`\`\`bash
npx prisma migrate dev
npx prisma db seed
\`\`\`

5. Run the development server:
\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) to view the site.

## Deployment to Render

### 1. Create a PostgreSQL Database

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" → "PostgreSQL"
3. Configure your database and create it
4. Copy the "Internal Database URL"

### 2. Create a Web Service

1. Click "New +" → "Web Service"
2. Connect your Git repository
3. Configure the service:
   - **Name**: white-hole-solutions
   - **Environment**: Node
   - **Build Command**: \`chmod +x build.sh && ./build.sh && npm run build\`
   - **Start Command**: \`npm start\`
   - **Instance Type**: Choose your plan

### 3. Set Environment Variables

Add these environment variables in Render:

\`\`\`
DATABASE_URL=<your-internal-database-url>
JWT_SECRET=<generate-secure-random-string>
NEXT_PUBLIC_APP_URL=<your-render-app-url>
REVOLUT_API_KEY=<your-revolut-api-key>
REVOLUT_API_URL=https://sandbox-b2b.revolut.com/api/1.0
ADMIN_EMAIL=admin@whiteholesolutions.com
ADMIN_PASSWORD=<secure-password>
NODE_ENV=production
\`\`\`

### 4. Deploy

Click "Create Web Service" and Render will automatically deploy your app!

## Default Admin Credentials

After deployment, log in with:
- **Email**: The value you set in `ADMIN_EMAIL`
- **Password**: The value you set in `ADMIN_PASSWORD`

**⚠️ Important**: Change these credentials after first login!

## Usage

### Admin Tasks

1. **Create Albums**:
   - Navigate to Admin Panel → Albums
   - Click "Create Album"
   - Choose PUBLIC (visible to everyone) or PRIVATE (customer-specific)
   - Upload images/videos

2. **Manage Customer Access**:
   - For private albums, click "Access"
   - Select which customers can view the album

3. **Create Invoices**:
   - Navigate to Admin Panel → Invoices
   - Click "Create Invoice"
   - Add line items, tax, and notes
   - Customer receives payment link via Revolut

4. **Manual Customer Creation**:
   - Navigate to Admin Panel → Customers
   - Click "Add Customer"
   - System generates a password (shown once)

### Customer Experience

1. **Submit Inquiry**:
   - Customer fills out contact form on homepage
   - System auto-creates account with random password
   - Admin can send credentials to customer

2. **View Private Galleries**:
   - Customer logs in
   - Sees private albums assigned to them
   - Can download media files

3. **Pay Invoices**:
   - Customer views invoices in dashboard
   - Clicks "Pay Now" → Redirected to Revolut
   - Invoice automatically marked as paid

## Image Protection

- **Public Albums**: Images are protected from right-click download and dragging
- **Private Albums**: Customers can download via provided download buttons
- CSS classes prevent casual copying while maintaining user experience

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Public
- `GET /api/albums` - Get public albums
- `POST /api/inquiries` - Submit inquiry

### Admin Only
- `POST /api/albums` - Create album
- `POST /api/albums/[id]/media` - Upload media
- `POST /api/albums/[id]/access` - Manage access
- `POST /api/customers` - Create customer
- `POST /api/invoices` - Create invoice

### Customer
- `GET /api/customers/[id]` - Get customer data
- `POST /api/invoices/[id]/pay` - Initiate payment

## Database Schema

- **Users**: Authentication and basic user info
- **Customers**: Customer-specific data and analytics
- **Albums**: Media galleries (public/private)
- **Media**: Individual images/videos
- **AlbumAccess**: Customer permissions for private albums
- **Invoices**: Invoice records
- **InvoiceItems**: Line items for invoices
- **Inquiries**: Contact form submissions

## License

MIT

## Support

For issues or questions, contact: info@whiteholesolutions.com
