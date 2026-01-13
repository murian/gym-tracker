# Gym Tracker

A modern, fast, and responsive gym workout tracking application built with Next.js, React, and TypeScript. Track your Crossfit, HIIT, and Free Workout sessions with intelligent progression tracking.

## Features

- **Calendar View**: Visual calendar showing all your workout sessions
- **3 Workout Types**:
  - **Crossfit**: Simple activity logging
  - **HIIT**: Simple activity logging
  - **Free Workout**: Detailed exercise tracking with sets, reps, and weights
- **Exercise Management**: Add, edit, and delete exercises with custom equipment and categories
- **Progressive Overload**: Automatic 10% weight increase suggestions every week
- **Progression Tracking**: Compare your actual performance vs. suggested progression
- **Modern UI**: Fast, responsive design with Tailwind CSS
- **Persistent Storage**: Data saved in browser localStorage
- **No Backend Required**: Works entirely in the browser

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (version 18 or higher)
- **npm** or **yarn** package manager

### Installing Node.js

#### Windows
1. Download Node.js from [nodejs.org](https://nodejs.org/)
2. Run the installer and follow the prompts
3. Verify installation by opening Command Prompt and running:
   ```bash
   node --version
   npm --version
   ```

#### Linux Mint
```bash
sudo apt update
sudo apt install nodejs npm
node --version
npm --version
```

If you need a newer version, use nvm (Node Version Manager):
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18
```

## Installation

1. **Navigate to the project directory**:
   ```bash
   cd "/c/Users/Murian.dosReisRibeir/OneDrive - Hogeschool Inholland/Documents/Gym"
   ```
   Or on Linux:
   ```bash
   cd ~/path/to/Gym
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser** and navigate to:
   ```
   http://localhost:3000
   ```

## Usage

### Logging a Workout

1. Click on any date in the calendar
2. Select your workout type (Crossfit, HIIT, or Free Workout)
3. Mark as completed if you've finished the workout
4. Click "Save Workout"

### Free Workout Details

1. After saving a Free Workout, click on the date again
2. Add exercises from your exercise list
3. For each exercise, you can:
   - Track multiple sets
   - Record reps, weight (kg), and rest time (seconds)
   - Mark sets as completed
   - See suggested weight increases (10% weekly progression)
   - Compare actual vs. suggested progression

### Managing Exercises

1. Click "Manage Exercises" in the top right
2. Add new exercises with:
   - Name
   - Equipment (optional)
   - Category (optional)
   - Default reps, sets, and rest time
3. Edit or delete existing exercises

### Pre-loaded Exercises

The app comes with these default exercises:
- RUN - Goal exercise time (Cardio)
- DUMBBELLS - Chest press - flat bench
- CABLE STATIONS 4 - Rowing - triangle (handle)
- CABLE STATIONS 4 - Face pull
- DAP ELT+ - French press
- CABLE JUNGLE - Arm curl with bar

## Deployment

### Deploy to Vercel (Recommended)

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel
   ```

4. Follow the prompts:
   - Set up and deploy? **Y**
   - Which scope? Choose your account
   - Link to existing project? **N**
   - Project name: **gym-tracker** (or your preferred name)
   - Directory: **./**, just press Enter
   - Override settings? **N**

5. Your app will be deployed and you'll receive a URL like: `https://gym-tracker-xxx.vercel.app`

### Deploy to Linux Mint Server

1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Start the production server**:
   ```bash
   npm start
   ```

3. **Run on a specific port** (optional):
   ```bash
   PORT=3000 npm start
   ```

4. **Keep it running with PM2**:
   ```bash
   npm install -g pm2
   pm2 start npm --name "gym-tracker" -- start
   pm2 save
   pm2 startup
   ```

5. **Setup Nginx as reverse proxy** (optional):
   ```bash
   sudo apt install nginx
   sudo nano /etc/nginx/sites-available/gym-tracker
   ```

   Add this configuration:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

   Enable the site:
   ```bash
   sudo ln -s /etc/nginx/sites-available/gym-tracker /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

## Data Storage

All data is stored in your browser's localStorage. This means:
- ✅ Fast and no server required
- ✅ Works offline
- ✅ No data leaves your device
- ⚠️ Data is tied to your browser
- ⚠️ Clearing browser data will delete your workouts

### Backup Your Data

To backup your data:
1. Open browser DevTools (F12)
2. Go to Application/Storage tab
3. Find localStorage
4. Copy the values for `gym-exercises` and `gym-workout-logs`
5. Save them in a text file

To restore:
1. Open DevTools
2. Go to Console
3. Paste:
   ```javascript
   localStorage.setItem('gym-exercises', 'YOUR_BACKUP_DATA_HERE')
   localStorage.setItem('gym-workout-logs', 'YOUR_BACKUP_DATA_HERE')
   ```

## Upgrading to a Database

To upgrade from localStorage to a real database:

1. Choose a database provider (e.g., Vercel Postgres, Supabase, PlanetScale)
2. Replace the `lib/db.ts` file with database queries
3. Keep the same interface (methods) for minimal changes
4. Migrate your localStorage data to the database

## Technology Stack

- **Next.js 15** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **date-fns** - Date utilities

## Browser Compatibility

Works on all modern browsers:
- Chrome/Edge (recommended)
- Firefox
- Safari
- Opera

## Performance

- Optimized for fast load times
- Client-side rendering for instant interactions
- Minimal dependencies
- Efficient localStorage usage

## Troubleshooting

### Port already in use
If port 3000 is already in use:
```bash
npm run dev -- -p 3001
```

### Build errors
Clear cache and reinstall:
```bash
rm -rf .next node_modules
npm install
npm run dev
```

### Data not persisting
Check if localStorage is enabled in your browser and not in private/incognito mode.

## License

This project is for personal use.

## Support

For issues or questions, check the console for error messages and ensure all dependencies are correctly installed.
