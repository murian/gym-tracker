# Quick Start Guide

## First Time Setup

1. **Install Node.js** (if not already installed):
   - Download from https://nodejs.org/
   - Choose the LTS (Long Term Support) version
   - Verify installation: `node --version`

2. **Open terminal in this folder**:
   - Windows: Right-click in folder → "Open in Terminal" or "Git Bash Here"
   - Linux: Right-click → "Open in Terminal"

3. **Install dependencies**:
   ```bash
   npm install
   ```
   This will take a few minutes the first time.

4. **Start the app**:
   ```bash
   npm run dev
   ```

5. **Open in browser**:
   - Go to: http://localhost:3000
   - You should see your Gym Tracker app!

## Daily Use

After the first setup, you only need to:

```bash
npm run dev
```

Then open http://localhost:3000 in your browser.

## Quick Tips

- **Stop the server**: Press `Ctrl + C` in the terminal
- **Data storage**: All your workout data is saved in your browser
- **Different port**: If port 3000 is busy, use `npm run dev -- -p 3001`

## File Structure

```
gym-tracker/
├── app/              # Main application pages
│   ├── page.tsx      # Home page
│   ├── layout.tsx    # App layout
│   └── globals.css   # Global styles
├── components/       # Reusable components
│   ├── Calendar.tsx          # Calendar view
│   ├── WorkoutLogger.tsx     # Quick workout logging
│   ├── FreeWorkoutTracker.tsx # Detailed exercise tracking
│   └── ExerciseManager.tsx   # Exercise management
├── lib/              # Utilities and database
│   └── db.ts         # Database logic (localStorage)
└── package.json      # Project dependencies
```

## Common Issues

### "Command not found: npm"
- Node.js is not installed. Follow step 1 above.

### "Port 3000 already in use"
- Another app is using port 3000
- Use a different port: `npm run dev -- -p 3001`

### "Module not found"
- Run: `npm install`

### Page won't load
- Make sure the terminal shows "Ready" or "Compiled successfully"
- Check you're going to the correct URL (http://localhost:3000)

## Need Help?

1. Check the terminal for error messages
2. Try stopping (Ctrl+C) and restarting: `npm run dev`
3. If all else fails, delete `node_modules` and `.next` folders, then run `npm install` again

## Next Steps

Once running:
1. Click on today's date in the calendar
2. Select a workout type (try "Free Workout")
3. Save it
4. Click the date again to add exercises
5. Click "Manage Exercises" to customize your exercise list

Enjoy tracking your fitness journey! 💪
