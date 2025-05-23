# Time Management App

A local-first time management app built with Expo, React Native, and Drizzle ORM for local SQLite storage.

## Features

- ⏱️ Pomodoro Timer with customizable work/break durations
- ✅ Task Management with priority levels
- 📊 Statistics and productivity tracking
- 🗄️ Local-first data storage with SQLite
- 🌙 Dark theme UI

## Tech Stack

### Core Framework

- **Expo** - Cross-platform React Native framework
- **Expo Router** - File-based routing
- **React Native Paper** - Material Design components

### Database & Storage

- **Expo SQLite** - Local SQLite database
- **Drizzle ORM** - TypeScript ORM for SQL databases
- **Drizzle Kit** - CLI tool for database migrations

### State Management

- **Zustand** - Lightweight state management

## Database Schema

The app uses a local SQLite database with the following tables:

### Tasks

- `id` - Primary key
- `title` - Task title
- `description` - Task description
- `completed` - Boolean completion status
- `priority` - Priority level (low, medium, high)
- `category` - Task category
- `due_date` - Due date
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

### Habits

- `id` - Primary key
- `name` - Habit name
- `description` - Habit description
- `created_at` - Creation timestamp

### Habit Completions

- `id` - Primary key
- `habit_id` - Foreign key to habits table
- `completed_date` - Date of completion (YYYY-MM-DD)
- `notes` - Optional notes
- `created_at` - Creation timestamp

### Time Sessions

- `id` - Primary key
- `task_id` - Optional foreign key to tasks table
- `category` - Session category (work, study, break, etc.)
- `duration_minutes` - Session duration in minutes
- `start_time` - Session start time
- `end_time` - Session end time
- `notes` - Optional notes
- `created_at` - Creation timestamp

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- npm or yarn
- Expo CLI

### Installation

1. Clone the repository

```bash
git clone <repository-url>
cd time-management-app
```

2. Install dependencies

```bash
npm install
```

3. Install Expo SQLite and Drizzle dependencies

```bash
npx expo install expo-sqlite
npm i drizzle-orm
npm i -D drizzle-kit babel-plugin-inline-import
```

4. Generate database migrations

```bash
npx drizzle-kit generate
```

5. Start the development server

```bash
npx expo start
```

## Database Development

### Drizzle Studio

The app includes Drizzle Studio integration for database inspection during development. When running the app in development mode, you can access the database browser through the Expo dev tools.

### Database Testing

Navigate to Settings > Database Testing to test database operations including:

- Creating sample tasks and habits
- Viewing stored data
- Clearing all data

### Making Schema Changes

1. Update the schema in `db/schema.ts`
2. Generate new migrations:

```bash
npx drizzle-kit generate
```

3. The migrations will be automatically applied on app startup

## Project Structure

```
├── app/                    # Expo Router pages
│   ├── _layout.tsx        # Root layout with database setup
│   ├── index.tsx          # Timer screen
│   ├── tasks.tsx          # Task management
│   ├── stats.tsx          # Statistics
│   └── settings.tsx       # Settings with database testing
├── components/            # Reusable components
│   └── DatabaseExample.tsx # Database testing component
├── db/                    # Database configuration
│   ├── client.ts          # Database client setup
│   ├── schema.ts          # Database schema definition
│   └── services.ts        # Database service functions
├── drizzle/              # Generated migrations
├── hooks/                # Custom React hooks
│   └── useTasksData.ts   # Task data management hook
├── stores/               # Zustand stores
│   └── taskStore.ts      # Task state management
├── babel.config.js       # Babel configuration for SQL imports
├── drizzle.config.ts     # Drizzle Kit configuration
└── metro.config.js       # Metro bundler configuration
```

## Local-First Architecture

This app implements a local-first approach where:

- All data is stored locally on the device using SQLite
- No internet connection required for core functionality
- Data persists across app sessions
- Fast, responsive user experience with immediate data access

## Development Tools

### Drizzle Studio

Access the database browser during development to inspect and modify data directly.

### Database Services

The `db/services.ts` file provides a clean API for database operations:

- `taskService` - CRUD operations for tasks
- `habitService` - CRUD operations for habits
- `habitCompletionService` - Habit completion tracking
- `timeSessionService` - Time tracking sessions

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Update database schema if needed and generate migrations
5. Test your changes
6. Submit a pull request

## License

This project is licensed under the MIT License.
