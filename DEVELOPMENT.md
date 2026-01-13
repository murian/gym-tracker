# Development Guide

## Getting Started

### First Time Setup

1. **Install Node.js** (https://nodejs.org/) - Version 18 or higher
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Start development server**:
   ```bash
   npm run dev
   ```
4. **Open browser**: http://localhost:3000

## Available Scripts

```bash
npm run dev          # Start development server with Turbopack (fast!)
npm run build        # Build for production
npm start            # Run production build
npm run lint         # Run ESLint to check code quality
```

## Project Structure Explained

### `/app` - Next.js App Router
- `layout.tsx` - Root layout, wraps all pages, includes metadata
- `page.tsx` - Home page (main app), handles all state and view logic
- `globals.css` - Global CSS styles and Tailwind directives

### `/components` - React Components
- `Calendar.tsx` - Monthly calendar view with workout indicators
- `WorkoutLogger.tsx` - Modal for quick Crossfit/HIIT logging
- `FreeWorkoutTracker.tsx` - Detailed exercise tracking interface
- `ExerciseManager.tsx` - Modal for managing exercise library

### `/lib` - Utilities and Logic
- `db.ts` - Database abstraction layer
  - Handles localStorage persistence
  - Defines TypeScript types
  - Calculates progression suggestions
  - Easy to replace with real DB later

## Key Technologies

### Next.js 15
- **App Router**: Modern routing system
- **Server Components**: Optimal performance
- **Turbopack**: Ultra-fast development bundler
- **TypeScript**: First-class support

### React 19
- **Hooks**: useState, useEffect for state management
- **Client Components**: Interactive UI with 'use client'

### Tailwind CSS
- **Utility-first**: Rapid styling with classes
- **Responsive**: Mobile-first breakpoints (lg:, md:, sm:)
- **Customizable**: See `tailwind.config.ts`

### TypeScript
- **Type Safety**: Catch errors at compile time
- **IntelliSense**: Better IDE autocomplete
- **Interfaces**: See `lib/db.ts` for data models

## Data Flow

```
User Action (Click date)
    ↓
App Component (page.tsx) - handleDateClick()
    ↓
Database (lib/db.ts) - getWorkoutLogByDate()
    ↓
LocalStorage - Load data
    ↓
Component Re-render - Show workout details
    ↓
User Edits - updateWorkoutLog()
    ↓
LocalStorage - Save data
    ↓
Component Update - Reflect changes
```

## State Management

All state is in `app/page.tsx`:
- `workoutLogs` - Array of all workouts
- `selectedDate` - Currently selected date
- `viewMode` - 'calendar' | 'log' | 'detail'
- `currentLog` - Current workout being viewed/edited
- `showExerciseManager` - Exercise manager visibility

## Database Schema

### Exercise
```typescript
{
  id: string;                  // Unique identifier
  name: string;                // Exercise name
  equipment?: string;          // Equipment type
  category?: string;           // Muscle group
  defaultReps?: number;        // Default reps per set
  defaultSets?: number;        // Default number of sets
  defaultRestTime?: number;    // Default rest seconds
}
```

### WorkoutLog
```typescript
{
  id: string;                  // Unique identifier
  date: string;                // ISO date (YYYY-MM-DD)
  type: 'crossfit' | 'hiit' | 'free-workout';
  completed: boolean;          // Workout done?
  exercises?: FreeWorkoutExercise[];  // Only for free-workout
  notes?: string;              // Optional notes
}
```

### ExerciseSet
```typescript
{
  reps: number;                // Repetitions
  weight: number;              // Weight in kg
  restTime: number;            // Rest in seconds
  completed: boolean;          // Set completed?
}
```

## Progression Logic

Located in `lib/db.ts`, method `getSuggestedWeight()`:

1. Find most recent workout with this exercise from ≥7 days ago
2. Get max weight used in that workout
3. Calculate 10% increase: `maxWeight * 1.1`
4. Round to nearest 0.5kg
5. Return suggested weight

Comparison in `FreeWorkoutTracker.tsx`:
- Green check: Current weight ≥ suggested
- Blue alert: Current weight < suggested

## Styling Patterns

### Color Scheme
- **Primary**: Blue (workout tracking)
- **Success**: Green (completion, on-track)
- **Warning**: Orange (Crossfit)
- **Info**: Purple (HIIT)
- **Danger**: Red (delete actions)

### Common Patterns
```tsx
// Button
className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"

// Card
className="bg-white rounded-xl shadow-lg p-6"

// Input
className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
```

## Adding New Features

### Add a New Workout Type

1. Update type in `lib/db.ts`:
   ```typescript
   export type WorkoutType = 'crossfit' | 'hiit' | 'free-workout' | 'yoga';
   ```

2. Add color to Calendar.tsx:
   ```typescript
   case 'yoga':
     return 'bg-green-500';
   ```

3. Add option to WorkoutLogger.tsx

### Add a New Database Field

1. Update interface in `lib/db.ts`
2. Update localStorage migration in constructor
3. Update components that use the data

### Add Real Database

1. Install database package (e.g., `@vercel/postgres`)
2. Create database schema (tables)
3. Replace methods in `lib/db.ts` with SQL queries
4. Keep same method signatures for compatibility
5. Update constructor to connect to DB instead of localStorage

## Performance Tips

### Keep It Fast
- ✅ Use `'use client'` only when needed (we need it for interactivity)
- ✅ Minimize state updates
- ✅ Use keys in lists for efficient React updates
- ✅ Lazy load heavy components if needed

### Optimization Ideas
- Add React.memo() to Calendar if re-renders are slow
- Virtualize long lists of exercises
- Use Next.js Image component for future images
- Implement code splitting for exercise manager

## Debugging

### React DevTools
1. Install React DevTools extension
2. Open browser DevTools
3. See Components and Profiler tabs
4. Inspect state and props

### Check localStorage
```javascript
// Console
localStorage.getItem('gym-exercises')
localStorage.getItem('gym-workout-logs')

// Clear all data
localStorage.clear()
```

### Common Issues

**Hydration Errors**
- Happens when server/client render differently
- Usually due to Date() or localStorage in wrong place
- Fix: Use useEffect for client-only code

**State Not Updating**
- Check if you're mutating state directly
- Always use setState with new object: `setState([...array])`

**Styles Not Applying**
- Tailwind needs to see class names in files
- Don't use string interpolation: `className={`bg-${color}`}` ❌
- Use full names: `className={color === 'blue' ? 'bg-blue-500' : 'bg-red-500'}` ✅

## Testing Locally

### Manual Testing Checklist
- [ ] Add a workout (all 3 types)
- [ ] Edit a workout
- [ ] Delete a workout
- [ ] Add exercises to free workout
- [ ] Check progression suggestion appears
- [ ] Add custom exercise
- [ ] Edit exercise
- [ ] Delete exercise
- [ ] Navigate between months
- [ ] Check data persists on page reload

### Test in Different Browsers
- Chrome/Edge
- Firefox
- Safari (if on Mac)

## Deployment

### Before Deploying
```bash
npm run build       # Test production build
npm start           # Test production server locally
```

### Deploy to Vercel
```bash
vercel              # First time
vercel --prod       # Production deployment
```

### Environment Variables
For future features (API keys, DB URLs):
1. Add to `.env.local` (local development)
2. Add to Vercel dashboard (production)
3. Never commit `.env.local` to git

## Code Style

### TypeScript
- Use interfaces for data shapes
- Use types for unions/primitives
- Enable strict mode (already on)

### React
- Functional components only
- Hooks for state and effects
- Props interfaces for all components

### Naming
- Components: PascalCase
- Functions: camelCase
- Files: PascalCase.tsx for components
- Constants: UPPER_SNAKE_CASE

## Version Control

### Git Workflow
```bash
git add .
git commit -m "feat: add progression tracking"
git push
```

### Commit Message Convention
- `feat:` new feature
- `fix:` bug fix
- `docs:` documentation
- `style:` formatting
- `refactor:` code restructure
- `test:` add tests
- `chore:` maintenance

## Useful Resources

- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vercel Deployment](https://vercel.com/docs)

## Need Help?

1. Check browser console for errors (F12)
2. Check terminal for build errors
3. Read error messages carefully
4. Search error on Google/Stack Overflow
5. Check if packages are up to date: `npm outdated`

## Future Enhancements

### Easy Wins
- [ ] Add notes field to workouts
- [ ] Add workout duration tracking
- [ ] Export data as JSON
- [ ] Import data from JSON
- [ ] Dark mode toggle

### Medium Complexity
- [ ] Charts for progression
- [ ] Exercise history view
- [ ] Personal records tracking
- [ ] Workout templates
- [ ] Print workout logs

### Advanced
- [ ] User authentication
- [ ] Real database (PostgreSQL)
- [ ] Cloud sync
- [ ] Mobile app (React Native)
- [ ] Social features

Happy coding! 💻
