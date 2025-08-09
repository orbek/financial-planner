# Local Database Setup Guide

This guide will help you set up a local PostgreSQL database for development and testing, eliminating the need for external services like Supabase during development.

## 🎯 Quick Start

### Option 1: Using Docker (Recommended)

1. **Start the local database**:
   ```bash
   docker-compose -f docker-compose.dev.yml up postgres redis -d
   ```

2. **Wait for the database to be ready** (about 10-15 seconds)

3. **The database will auto-initialize** with schema and sample data from the `database/init/` folder

4. **Verify the setup**:
   ```bash
   docker logs financial_planner_db
   ```

### Option 2: Manual PostgreSQL Installation

1. **Install PostgreSQL** (if not already installed):
   ```bash
   # macOS with Homebrew
   brew install postgresql
   brew services start postgresql

   # Ubuntu/Debian
   sudo apt-get install postgresql postgresql-contrib
   sudo systemctl start postgresql

   # Windows
   # Download from https://www.postgresql.org/download/windows/
   ```

2. **Create database and user**:
   ```bash
   psql -U postgres
   CREATE DATABASE financial_planner;
   CREATE USER financial_planner_user WITH PASSWORD 'password123';
   GRANT ALL PRIVILEGES ON DATABASE financial_planner TO financial_planner_user;
   \q
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.local.example .env
   # Edit .env with your database credentials
   ```

4. **Install server dependencies**:
   ```bash
   cd server
   npm install
   ```

5. **Set up database schema**:
   ```bash
   npm run db:setup
   ```

6. **Seed with sample data**:
   ```bash
   npm run db:seed
   ```

## 📊 Database Schema

The local database includes the following tables:

### Core Tables
- **`users`** - User profiles (local auth support)
- **`accounts`** - Financial accounts (checking, savings, credit, etc.)
- **`transactions`** - All financial transactions
- **`statement_uploads`** - PDF upload tracking

### New Feature Tables
- **`budgets`** - Budget categories and limits
- **`goals`** - Financial goals and targets
- **`goal_contributions`** - Goal progress tracking

### Sample Data Included

When you run `npm run db:seed`, you'll get:
- **1 sample user** (Carlos Barbosa)
- **4 accounts** (Checking, Savings, Credit Card, Investment)
- **20+ transactions** (last 3 months)
- **5 budget categories**
- **4 financial goals** with progress

## 🛠 Database Management Commands

```bash
# Set up database schema (creates tables, indexes, triggers)
npm run db:setup

# Seed with sample data
npm run db:seed

# Reset database (drop + recreate + seed)
npm run db:reset

# Check database health
node -e "require('./src/config/database-local').Database.healthCheck().then(console.log)"
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the `server/` directory:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=financial_planner
DB_USER=postgres
DB_PASSWORD=postgres

# Optional: Redis for caching
REDIS_URL=redis://localhost:6379

# Application Configuration
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:3000
JWT_SECRET=your_local_development_secret

# Microsoft OAuth (for authentication)
CLIENT_ID=your_azure_client_id
CLIENT_SECRET=your_azure_client_secret
TENANT_ID=your_azure_tenant_id

# Google AI (for PDF processing)
GOOGLE_API_KEY=your_google_ai_api_key
```

### Docker Configuration

The `docker-compose.dev.yml` file includes:
- **PostgreSQL 15** with persistent data
- **Redis** for caching
- **Auto-initialization** with schema and sample data
- **Health checks** to ensure services are ready

## 🚀 Starting the Development Environment

### Full Stack with Docker

```bash
# Start all services (database, backend, frontend)
docker-compose -f docker-compose.dev.yml up

# Or start just the database services
docker-compose -f docker-compose.dev.yml up postgres redis -d

# Then run the app locally
npm run dev
```

### Manual Start

```bash
# 1. Start PostgreSQL and Redis (if using Docker for just DB)
docker-compose -f docker-compose.dev.yml up postgres redis -d

# 2. Start the backend
cd server
npm run dev

# 3. Start the frontend (in another terminal)
cd client
npm run dev
```

## 🗄️ Database Connection Details

When running locally, the app will automatically detect and use the local PostgreSQL database instead of Supabase.

**Default Connection:**
- Host: `localhost`
- Port: `5432`
- Database: `financial_planner`
- User: `postgres`
- Password: `postgres`

## 📊 Accessing the Database

### Using psql (Command Line)

```bash
# Connect to the database
psql -h localhost -p 5432 -U postgres -d financial_planner

# Some useful queries
\dt                              # List all tables
SELECT * FROM accounts LIMIT 5; # View sample accounts
SELECT * FROM transactions ORDER BY date DESC LIMIT 10; # Recent transactions
```

### Using GUI Tools

Popular PostgreSQL GUI tools that work with the local database:
- **pgAdmin** (web-based)
- **DBeaver** (free, cross-platform)
- **TablePlus** (macOS)
- **DataGrip** (JetBrains)

**Connection Details:**
- Host: `localhost`
- Port: `5432`
- Database: `financial_planner`
- Username: `postgres`
- Password: `postgres`

## 🔄 Switching Between Local and Supabase

The application supports both local PostgreSQL and Supabase. To switch:

### Use Local Database (Default)
```env
# In your .env file
DB_HOST=localhost
# ... other DB_ variables
# DO NOT set USE_SUPABASE=true
```

### Use Supabase
```env
# In your .env file
USE_SUPABASE=true
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
# Comment out or remove DB_ variables
```

## 🧪 Testing

The local database is perfect for testing:

```bash
# Run tests against local database
npm test

# Reset database before testing
npm run db:reset
npm test

# Test specific features
npm run db:seed
# Test your new features with fresh sample data
```

## 🔧 Troubleshooting

### Common Issues

1. **Database connection failed**
   ```bash
   # Check if PostgreSQL is running
   docker ps | grep postgres
   # Or for manual installation
   pg_isready -h localhost -p 5432
   ```

2. **Tables don't exist**
   ```bash
   # Run the setup script
   npm run db:setup
   ```

3. **Permission denied**
   ```bash
   # Make sure your user has the right permissions
   psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE financial_planner TO postgres;"
   ```

4. **Port already in use**
   ```bash
   # Check what's using port 5432
   lsof -i :5432
   # Kill the process or use a different port
   ```

### Reset Everything

If you need to start completely fresh:

```bash
# Stop all containers
docker-compose -f docker-compose.dev.yml down -v

# Remove volumes (this deletes all data)
docker volume rm financial-planner-1_postgres_data financial-planner-1_redis_data

# Start fresh
docker-compose -f docker-compose.dev.yml up postgres redis -d

# Wait a moment, then verify
docker logs financial_planner_db
```

## 🎯 Benefits of Local Database

### Advantages
- **No external dependencies** - Work offline
- **Faster development** - No network latency
- **Full control** - Customize schema as needed
- **Cost effective** - No cloud database costs
- **Better testing** - Reset data easily
- **Privacy** - All data stays local

### When to Use Each
- **Local PostgreSQL**: Development, testing, prototyping
- **Supabase**: Production, staging, team collaboration

## 📈 Performance

The local setup is optimized for development:
- **Connection pooling** (up to 20 connections)
- **Proper indexes** on commonly queried fields
- **Optimized queries** with JOINs and aggregations
- **Redis caching** for frequently accessed data

## 🔮 Advanced Features

### Database Migrations

For schema changes, create new SQL files in `database/migrations/`:

```sql
-- database/migrations/003-add-new-feature.sql
ALTER TABLE accounts ADD COLUMN interest_rate DECIMAL(5,4) DEFAULT 0.0000;
CREATE INDEX idx_accounts_interest_rate ON accounts(interest_rate);
```

### Custom Seed Data

Modify `database/init/02-seed-data.sql` to customize sample data for your testing needs.

### Backup and Restore

```bash
# Create backup
pg_dump -h localhost -p 5432 -U postgres financial_planner > backup.sql

# Restore backup
psql -h localhost -p 5432 -U postgres financial_planner < backup.sql
```

---

🎉 **You're all set!** Your local database is ready for development. The sample data includes realistic financial scenarios to test all features of the application.
