# Ajor - Community Savings Platform

> Save Together. Grow Together.

Ajor is a modern web platform for managing rotating savings and credit associations (ROSCAs), inspired by traditional African savings practices like **ajo** (Nigeria) and **susu** (West Africa). It helps groups of friends, family, or colleagues pool their money together through structured contribution cycles.

## 🌟 What is Ajor?

Ajor digitizes the time-honored tradition of community-based savings groups where:
- Members contribute a fixed amount regularly (weekly, bi-weekly, or monthly)
- Each cycle, one member receives the full pot
- Everyone receives their payout exactly once throughout the rotation
- Trust and accountability are maintained through transparent tracking

## ✨ Key Features

### For Group Hosts
- **Create & Manage Groups**: Set up savings circles with customizable terms
- **Member Management**: Invite members, approve join requests, and track participation
- **Automated Reminders**: Email notifications for contributions and late payments
- **Payout Tracking**: Record and monitor payout distributions
- **Flexible Settings**: Configure grace periods, auto-approval, and request expiration

### For Members
- **Join Groups**: Request to join via invite links or codes
- **Track Contributions**: View payment history and upcoming due dates
- **Payout Schedule**: See when you'll receive your payout in the rotation
- **Notifications**: Stay informed about group activities and payment reminders

### Platform Features
- **Interactive Calculator**: Calculate potential savings on the landing page
- **FAQ & Help Center**: Comprehensive guidance for new users
- **Onboarding Tour**: Step-by-step walkthrough for first-time users
- **Mobile Optimized**: Fully responsive design with touch-friendly interfaces
- **Dark Mode Support**: Seamless light/dark theme switching
- **Email Notifications**: Powered by Resend with React Email templates

## 🛠 Tech Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Component library
- **React Router** - Client-side routing
- **React Query** - Server state management
- **React Hook Form** - Form handling
- **Zod** - Schema validation
- **date-fns** - Date utilities

### Backend (Lovable Cloud)
- **Supabase** - Backend as a service
- **PostgreSQL** - Database
- **Row Level Security** - Data access control
- **Edge Functions** - Serverless functions (Deno)
- **Resend** - Email delivery
- **React Email** - Email templates
- **pg_cron** - Scheduled tasks

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- A Lovable account (for deployment)

### Local Development

```sh
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to project directory
cd ajor

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Environment Variables

The following environment variables are automatically configured via Lovable Cloud:

```
VITE_SUPABASE_URL=<your-supabase-url>
VITE_SUPABASE_PUBLISHABLE_KEY=<your-publishable-key>
VITE_SUPABASE_PROJECT_ID=<your-project-id>
```

### Database Setup

The database schema includes:
- `profiles` - User profiles
- `groups` - Savings group details
- `members` - Group membership records
- `contributions` - Payment tracking
- `payouts` - Payout records
- `notification_preferences` - User notification settings
- `notification_history` - Sent notification logs

All tables use Row Level Security (RLS) for data protection.

## 📧 Email Configuration

Email notifications require:
1. **Resend API Key**: Create an account at [resend.com](https://resend.com)
2. **Verified Domain**: Verify your sending domain in Resend dashboard
3. **RESEND_API_KEY**: Set as a secret in Lovable Cloud

Email types:
- Welcome emails for new users
- Group creation confirmations
- Member invitation emails
- Join request notifications
- Approval/rejection notifications
- Contribution reminders (via cron job)
- Late payment reminders (via cron job)

## 🔄 Automated Tasks

Scheduled cron jobs run via Supabase:

```sql
-- Contribution reminders (daily at 9 AM)
'0 9 * * *' → send-contribution-reminders

-- Late payment reminders (daily at noon)
'0 12 * * *' → send-late-payment-reminders
```

## 🎨 Design System

Ajor uses an "Architectural Afro-Modern" design aesthetic:
- **Primary Color**: Matte Gold (`#D4AF37`)
- **Typography**: Inter font family
- **Design Tokens**: HSL-based semantic color system
- **Components**: Customized shadcn/ui variants
- **Shadows**: Elevated card and glow effects

## 📱 Mobile Optimization

All interactive elements meet the 44×44px minimum touch target requirement. Mobile-specific utilities include:
- Touch target validation
- Touch feedback
- iOS zoom prevention
- Safe area insets
- Drawer navigation with swipe-to-dismiss

## 🔐 Security

- Row Level Security (RLS) on all database tables
- JWT-based authentication
- CRON_SECRET protection for scheduled functions
- Secure secret management via Lovable Cloud
- Input validation with Zod schemas

## 🚢 Deployment

### Via Lovable (Recommended)
1. Open your [Lovable project](https://lovable.dev/projects/4c64b702-5fd6-4845-ba2e-2c4dc5ffae31)
2. Click **Share → Publish**
3. Your app is now live at `*.lovable.app`

### Custom Domain
1. Go to **Project > Settings > Domains**
2. Click **Connect Domain**
3. Follow the DNS configuration steps

[Learn more about custom domains](https://docs.lovable.dev/features/custom-domain)

## 📂 Project Structure

```
ajor/
├── src/
│   ├── components/       # React components
│   │   ├── ui/          # shadcn/ui base components
│   │   └── ...          # Feature components
│   ├── pages/           # Route pages
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Utility functions
│   ├── assets/          # Images and static files
│   └── integrations/    # Supabase client
├── supabase/
│   ├── functions/       # Edge functions
│   │   ├── send-notification/
│   │   ├── send-contribution-reminders/
│   │   └── send-late-payment-reminders/
│   └── config.toml      # Supabase configuration
├── public/              # Static assets
└── package.json         # Dependencies
```

## 🤝 Contributing

This is a Lovable project with bidirectional GitHub sync:
- Changes made in Lovable automatically push to GitHub
- Changes pushed to GitHub automatically sync to Lovable
- Use branches for feature development
- Pull requests are supported for code review

### Development Workflow
1. Make changes locally or in Lovable
2. Commit and push changes
3. Changes sync automatically
4. Preview updates in Lovable's live preview

## 📝 License

© 2025 Ajor. All rights reserved.

## 📧 Support

Questions or issues? Contact us at [support@ajor.app](mailto:support@ajor.app)

## 🔗 Links

- [Lovable Project](https://lovable.dev/projects/4c64b702-5fd6-4845-ba2e-2c4dc5ffae31)
- [Lovable Documentation](https://docs.lovable.dev/)
- [Supabase Documentation](https://supabase.com/docs)
- [React Email Documentation](https://react.email/)

---

Built with ❤️ using [Lovable](https://lovable.dev)