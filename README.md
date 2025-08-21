# 🍩 EventLoop

**Where your team comes together** - A modern team event management platform for Sentry.

Create and join after-work activities with your colleagues. From padel tournaments to climbing sessions, crossfit challenges to casual meetups – build stronger connections outside the office.

## 🏗️ **Architecture**

### **Frontend** (`apps/web`)

- **Framework**: React + TypeScript + Vite
- **Styling**: Tailwind CSS + DaisyUI
- **Routing**: TanStack Router
- **State**: TanStack Query
- **Auth**: Clerk
- **Deployment**: Vercel

### **Backend** (`apps/api`)

- **Runtime**: Deno
- **Framework**: Hono
- **Database**: PostgreSQL + Drizzle ORM
- **Auth**: Clerk (JWT validation)
- **Deployment**: Deno Deploy

### **Database**

- **Engine**: PostgreSQL 15
- **Hosting**: Northflank (Docker)
- **Migrations**: Drizzle Kit

## 🚀 **Local Development**

### **Prerequisites**

- Node.js 18+ and pnpm
- Deno 1.45+
- Docker and Docker Compose
- Clerk account (free tier)

### **Setup**

```bash
# Install dependencies
pnpm install

# Start local database
docker compose -f docker/compose.yml up -d

# Start development servers
pnpm dev
```

This will start:

- **Web app**: http://localhost:5173
- **API**: http://localhost:8787
- **Database**: localhost:5432

## ✨ **Features**

- **🎯 Event Management**: Create, edit, and manage team events
- **👥 RSVP System**: Register/unregister for events with attendee tracking
- **💬 Comments**: Discuss events with your team
- **🏢 Multi-Office**: Support for VIE, SFO, YYZ, AMS, SEA offices
- **🌙 Dark Mode**: System preference + manual toggle
- **📱 Responsive**: Beautiful UI on all devices
- **🔒 Security**: Email domain restrictions and secure authentication

### **Environment Variables**

**Deno Deploy (Backend):**

```env
DATABASE_URL=postgresql://xxx
CLERK_SECRET_KEY=sk_live_...
CLERK_PUBLISHABLE_KEY=pk_live_...
CORS_ORIGIN=https://your-app.vercel.app
```

**Vercel (Frontend):**

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_live_...
VITE_API_URL=https://your-api.deno.dev
```

## 🛠️ **Development Scripts**

```bash
# Start all services
pnpm dev

# Build all apps
pnpm build

# Run database migrations
cd apps/api && deno task migrate

# Type checking
pnpm lint
```
