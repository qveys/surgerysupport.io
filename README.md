# Surgery Support Platform

A comprehensive surgery preparation and recovery support platform with personalized care plans, progress tracking, and secure multilingual communication with healthcare providers.

## Features

- **Role-Based Access Control**: Support for Sales, Recovery Coordinators, Nurses, Clinic Administrators, and Patients
- **Multilingual Support**: English and Thai language support
- **Secure Authentication**: Powered by Supabase Auth with Row Level Security
- **Real-time Communication**: Secure messaging between patients and healthcare providers
- **Document Management**: Upload, share, and manage medical documents
- **Medication Tracking**: Track medications, schedules, and adherence
- **Appointment Management**: Schedule and manage medical appointments
- **Progress Tracking**: Pre and post-operative checklists and progress monitoring

## Tech Stack

- **Frontend**: Next.js 13, React, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Real-time)
- **UI Components**: Radix UI, shadcn/ui
- **Icons**: Lucide React
- **Deployment**: Static export ready

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd surgery-support-platform
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

Fill in your Supabase credentials in `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

4. Set up the database:
   - Create a new Supabase project
   - Run the migration files in the Supabase SQL Editor **IN ORDER**:
     1. `supabase/migrations/20250628011102_long_morning.sql`
     2. `supabase/migrations/20250628011133_black_base.sql`
     3. `supabase/migrations/20250628011155_late_manor.sql`
     4. `supabase/migrations/20250628224919_damp_hall.sql`
     5. `supabase/migrations/20250629000035_old_heart.sql`
     6. `supabase/migrations/20250629013018_teal_cave.sql`
     7. `supabase/migrations/20250630102906_muddy_silence.sql`
     8. `supabase/migrations/20250630124450_ancient_spark.sql`
     9. `supabase/migrations/20250630143027_billowing_grass.sql`
     10. `supabase/migrations/20250630143326_stark_spring.sql`
     11. `supabase/migrations/20250630164301_red_grass.sql`

   **IMPORTANT**: Execute each migration file completely before moving to the next one. Copy and paste the entire content of each file into the Supabase SQL Editor and run it.

   **CRITICAL**: If you encounter the error "JSON object requested, multiple (or no) rows returned" or "PGRST116", it means user profiles are missing. Run migration #11 (`20250630164301_red_grass.sql`) immediately to create missing user profiles and set up automatic profile creation for new users.

5. Start the development server:
```bash
npm run dev
```

## Database Setup

### Regional Compliance

For AU/NZ/TH compliance, ensure your Supabase project is created in an appropriate region:
- **Australia/New Zealand**: Sydney (ap-southeast-2)
- **Thailand**: Singapore (ap-southeast-1) or Jakarta (ap-southeast-3)

### Migration Files

The database schema is managed through migration files located in `supabase/migrations/`. These must be executed in chronological order:

1. **20250628011102_long_morning.sql** - Initial database schema with core tables
2. **20250628011133_black_base.sql** - Row Level Security policies
3. **20250628011155_late_manor.sql** - Data retention and cleanup functions
4. **20250628224919_damp_hall.sql** - Patient images table
5. **20250629000035_old_heart.sql** - Updated RLS policies
6. **20250629013018_teal_cave.sql** - Authentication and user profile fixes
7. **20250630102906_muddy_silence.sql** - Schema fixes and missing columns
8. **20250630124450_ancient_spark.sql** - Appointments RLS policy fixes
9. **20250630143027_billowing_grass.sql** - User profiles table enhancements
10. **20250630143326_stark_spring.sql** - Final authentication flow fixes
11. **20250630164301_red_grass.sql** - **CRITICAL**: Missing user profiles fix and automatic profile creation

### User Roles

The platform supports five user roles with different permissions:

1. **Sales**: Lead management and sales data access
2. **Patient**: Personal data management and communication
3. **Recovery Coordinator**: Patient care coordination and appointment management
4. **Nurse**: Medical data management and medication tracking
5. **Clinic Administrator**: Full system access and user management

### Data Retention

- **PHI Data**: 7 years (user profiles, appointments, medications, documents, checklist items)
- **Messages**: 2 years
- **Audit Logs**: 5 years

Automated cleanup functions are included to ensure compliance.

## Troubleshooting

### Common Issues

#### "Supabase request failed" or "PGRST116" Error
This error occurs when a user exists in `auth.users` but doesn't have a corresponding profile in `user_profiles`. 

**Solution**: 
1. Run the migration `supabase/migrations/20250630164301_red_grass.sql` in your Supabase SQL Editor
2. This will create missing profiles for existing users and set up automatic profile creation for new users
3. You can also manually sync profiles by running: `SELECT * FROM public.sync_missing_user_profiles();` in the SQL Editor

#### Authentication Issues
- Ensure all migration files have been run in the correct order
- Check that your environment variables are correctly set
- Verify that Row Level Security policies are properly configured

## Security Features

- **Row Level Security (RLS)**: All tables protected with role-based policies
- **Soft Deletes**: Data marked as deleted but retained for compliance
- **Audit Logging**: All significant actions logged for compliance
- **HIPAA Compliance**: Designed with healthcare data protection in mind
- **Secure File Storage**: Documents stored in Supabase Storage with access controls

## Development

### Project Structure

```
├── app/                    # Next.js app directory
├── components/            # React components
│   ├── auth/             # Authentication components
│   ├── dashboard/        # Dashboard components
│   └── ui/               # Reusable UI components
├── contexts/             # React contexts
├── lib/                  # Utility libraries
│   └── supabase/        # Supabase client and utilities
├── supabase/            # Database migrations
└── public/              # Static assets
```

### Key Components

- **AuthContext**: Manages authentication state and user sessions
- **LanguageContext**: Handles internationalization
- **DatabaseService**: Provides CRUD operations for all entities
- **AuthService**: Handles authentication and authorization

### Adding New Features

1. Create database tables in a new migration file
2. Update TypeScript types in `lib/supabase/types.ts`
3. Add RLS policies for the new tables
4. Create service methods in `DatabaseService`
5. Build UI components following the existing patterns

## Deployment

The application is configured for static export and can be deployed to any static hosting provider:

```bash
npm run build
```

For dynamic features requiring server-side functionality, deploy to Vercel or similar platforms that support Next.js.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is proprietary software. All rights reserved.

## Support

For technical support or questions about the platform, please contact the development team.