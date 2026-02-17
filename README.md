# IIT Ropar Problem Ticket Raising System

A comprehensive web-based system for managing problem tickets at IIT Ropar. Students can raise tickets, admins can assign them to workers, and workers can complete the tasks with verification via OTP.

## Features

### Student Portal
- Create and track problem tickets
- View ticket status and assigned worker details
- Receive OTP for ticket completion verification
- Submit tickets across multiple categories with priority levels

### Admin Portal
- View all pending tickets
- Manage worker accounts
- Assign tickets to appropriate workers
- Send OTP verification to workers

### Worker Portal
- View assigned tickets
- Mark tickets as completed
- Track completion history

## Tech Stack

- **Frontend**: Next.js 16 with React 19
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Session-based with bcrypt password hashing
- **Email**: Nodemailer for OTP delivery
- **UI**: shadcn/ui components with Tailwind CSS

## Prerequisites

- Node.js 18+ and npm/pnpm
- PostgreSQL database
- Email service credentials (Gmail or similar)

## Setup Instructions

### 1. Environment Configuration

Create a `.env.local` file in the project root with the following variables:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/iit_ropar_tickets"

# Email Service
EMAIL_SERVICE="gmail"
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-password"

# Session
SESSION_SECRET="your-secure-random-secret"
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Setup Database

Run Prisma migrations and seed initial data:

```bash
# Generate Prisma client
pnpm exec prisma generate

# Create database tables
pnpm exec prisma db push

# Seed categories
pnpm exec ts-node scripts/seed-categories.ts
```

### 4. Run Development Server

```bash
pnpm dev
```

Visit `http://localhost:3000` to access the application.

## User Roles

### Student
- Email: Create any IIT Ropar email
- Password: Custom (minimum 6 characters recommended)
- Roll Number: Required during signup

### Admin
- Created directly in database (use login endpoint)
- Email and password required
- Can manage workers and assign tickets

### Worker
- Created by admin through the admin portal
- Email and password provided by admin
- Receives notifications for ticket assignments

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Student registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/session` - Get current session

### Tickets
- `GET /api/tickets` - Get tickets (role-based filtering)
- `POST /api/tickets` - Create new ticket (students only)
- `GET /api/tickets/[id]` - Get ticket details
- `PATCH /api/tickets/[id]` - Update ticket status

### Admin
- `GET /api/admin/workers` - List all workers
- `POST /api/admin/workers` - Create new worker
- `POST /api/admin/assign` - Assign ticket to worker

### OTP
- `POST /api/otp/send` - Send OTP to email
- `POST /api/otp/verify` - Verify OTP and mark ticket as complete

### Categories
- `GET /api/categories` - List all ticket categories

## Ticket Status Flow

1. **PENDING**: Newly created ticket waiting for assignment
2. **ASSIGNED**: Admin has assigned the ticket to a worker
3. **COMPLETED**: Worker has marked the ticket as complete
4. **DONE**: Student has verified completion via OTP

## Email Templates

### Welcome Email
Sent to new student accounts with account creation confirmation

### Worker Assignment Notification
Sent to workers when a ticket is assigned to them

### OTP Verification Email
Sent to students when verification is requested for completed tickets

## Database Schema

### Users
- Role-based access control (STUDENT, ADMIN, WORKER)
- Bcrypt password hashing
- Session management

### Tickets
- Status tracking
- Priority levels (LOW, MEDIUM, HIGH)
- Category assignment
- Student-worker linking via assignments

### Categories
- Predefined problem categories
- 10 default categories (Infrastructure, Academics, Hostel, etc.)

### Sessions
- HTTP-only cookies
- 30-day expiration
- Automatic cleanup of expired sessions

### OTP
- 6-digit verification codes
- 10-minute expiration
- Single-use verification

## Security Features

- Password hashing with bcrypt
- HTTP-only session cookies
- CSRF protection via middleware
- Role-based access control
- Parameterized database queries
- Input validation and sanitization

## Troubleshooting

### Database Connection Issues
- Verify DATABASE_URL is correct
- Ensure PostgreSQL service is running
- Check database credentials

### Email Not Sending
- Verify EMAIL_USER and EMAIL_PASS are correct
- Enable "Less secure app access" for Gmail
- Check spam/junk folder

### Session Expired
- Clear cookies and login again
- Sessions expire after 30 days of inactivity

## Development Notes

### File Structure
```
app/
  ├── (auth)/          # Authentication pages
  ├── admin/           # Admin dashboard
  ├── student/         # Student portal
  ├── worker/          # Worker portal
  ├── api/             # API routes
  └── page.tsx         # Home page

components/
  ├── auth-form.tsx
  ├── admin-header.tsx
  ├── student-header.tsx
  ├── worker-header.tsx
  └── ticket-card.tsx

lib/
  ├── auth.ts          # Authentication utilities
  ├── db.ts            # Database client
  ├── email.ts         # Email service
  ├── otp.ts           # OTP generation and validation
  └── utils.ts         # General utilities

prisma/
  └── schema.prisma    # Database schema
```

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

MIT License - See LICENSE file for details

## Support

For issues and support, contact the IIT Ropar administration or create an issue in the repository.
