# Secure Fair

Frontend and Backend for the Secure Fair system - Social Service Fair Registration System.

## Frontend - React Application

React + TypeScript frontend for the Secure Fair system.

## Structure

```
frontend/
├── src/
│   ├── components/       # Reusable components
│   │   ├── common/       # Generic components
│   │   ├── auth/         # Auth-related
│   │   ├── student/      # Student-specific
│   │   ├── socio/        # Socio-specific
│   │   └── admin/        # Admin-specific
│   ├── pages/            # Page components
│   │   ├── Login.tsx
│   │   ├── student/
│   │   ├── socio/
│   │   └── admin/
│   ├── services/         # API clients
│   │   ├── api.ts        # Axios instance
│   │   ├── auth.ts
│   │   ├── student.ts
│   │   ├── socio.ts
│   │   └── admin.ts
│   ├── hooks/            # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useProjects.ts
│   │   └── ...
│   ├── utils/            # Utility functions
│   │   ├── constants.ts
│   │   ├── validation.ts
│   │   └── ...
│   ├── types/            # TypeScript types
│   │   ├── user.ts
│   │   ├── project.ts
│   │   └── ...
│   ├── App.tsx           # Main app component
│   ├── main.tsx          # Entry point
│   └── routes.tsx        # Route configuration
├── public/               # Static files
├── package.json
├── tsconfig.json
├── vite.config.ts
├── .env.example
└── README.md
```

## Setup

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env
# Edit .env with your configuration
```

### Environment Variables

Create `.env` file:

```bash
VITE_API_URL=http://localhost:8000/api
VITE_APP_NAME=Secure Fair
```

### Run Development Server

```bash
npm run dev
```

Access at: http://localhost:5173

## Available Scripts

```bash
# Development
npm run dev              # Start dev server

# Build
npm run build            # Production build
npm run preview          # Preview production build

# Linting
npm run lint             # Run ESLint
npm run lint:fix         # Fix linting issues

# Formatting
npm run format           # Format with Prettier

# Testing
npm test                 # Run tests
npm run test:ui          # Run tests with UI
npm run test:coverage    # Coverage report
```

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **React Router v6** - Routing
- **React Query (TanStack Query)** - Data fetching
- **Material-UI** - Component library
- **Axios** - HTTP client
- **React Hook Form** - Forms
- **Zod** - Validation

## Project Features

### Authentication
- Login/logout
- Protected routes by role
- Token management

### Student Dashboard
- View available time slots
- Register for slots
- Display QR code for check-in
- Redeem enrollment codes
- View enrollment status

### Socioformador Dashboard
- View assigned projects
- Generate enrollment codes
- View enrolled students
- Export student lists

### Admin Dashboard
- Manage periods, organizations, projects
- Configure time slots
- Perform check-ins
- View analytics
- Export data

## Routing Structure

```
/login                    # Login page

/student/*                # Student routes
  /slots                  # Browse slots
  /my-qr                  # QR code
  /enroll                 # Redeem code
  /status                 # Enrollment status

/socio/*                  # Socio routes
  /projects               # My projects
  /generate-code          # Generate codes
  /students               # Enrolled students

/admin/*                  # Admin routes
  /periods                # Manage periods
  /organizations          # Manage orgs
  /projects               # Manage projects
  /slots                  # Manage slots
  /checkin                # Perform check-in
  /dashboard              # Analytics
  /exports                # Data exports
```

## State Management

Using React Query for server state:

```typescript
// Example: Fetching projects
const { data, isLoading, error } = useQuery({
  queryKey: ['projects'],
  queryFn: () => api.getProjects()
});
```

## API Integration

All API calls in `src/services/`:

```typescript
// services/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

## Component Guidelines

- Use functional components with hooks
- TypeScript for all components
- Props interfaces defined
- Error boundaries for error handling
- Loading states for async operations
- Form validation with Zod schemas

## Code Style

```bash
# ESLint configuration in .eslintrc.json
# Prettier configuration in .prettierrc

# Format before commit
npm run format
npm run lint:fix
```

## Building for Production

```bash
# Create production build
npm run build

# Output in dist/ directory
# Deploy dist/ to static hosting (Vercel, Netlify, etc.)
```

## Environment-Specific Builds

```bash
# Development
npm run dev

# Staging
VITE_API_URL=https://staging-api.com npm run build

# Production
VITE_API_URL=https://api.securefair.com npm run build
```

## Testing

```bash
# Unit tests with Vitest
npm test

# Component tests
npm run test:ui

# E2E tests (if configured)
npm run test:e2e
```

## Best Practices

- Keep components small and focused
- Use custom hooks for reusable logic
- Implement proper error handling
- Add loading states for better UX
- Validate all user inputs
- Use TypeScript strictly
- Write tests for critical paths

## Troubleshooting

**Port already in use**:
```bash
# Change port in vite.config.ts
export default defineConfig({
  server: { port: 3001 }
});
```

**API connection errors**:
- Check VITE_API_URL in .env
- Ensure backend is running
- Check CORS configuration

**Build fails**:
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Production Deployment

See main project documentation for deployment guide.
