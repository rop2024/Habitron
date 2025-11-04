# Habitron 🏃‍♂️

A modern, cross-platform habit tracking application built with Electron, React, and SQLite. Track your daily habits, monitor progress, and build lasting positive routines.

![Habitron](https://img.shields.io/badge/Habitron-v1.0.0-blue?style=for-the-badge)
![Electron](https://img.shields.io/badge/Electron-39.0.0-47848F?style=flat-square&logo=electron)
![React](https://img.shields.io/badge/React-18.2.0-61DAFB?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-4.9.5-3178C6?style=flat-square&logo=typescript)
![SQLite](https://img.shields.io/badge/SQLite-5.1.7-003B57?style=flat-square&logo=sqlite)

## ✨ Features

- **📱 Cross-Platform**: Runs on Windows, macOS, and Linux
- **🎯 Habit Tracking**: Create and manage daily/weekly habits with custom goals
- **📊 Progress Analytics**: View completion rates, streaks, and statistics
- **🎨 Customizable**: Color-coded habits with emoji icons
- **💾 Local Database**: SQLite-powered local storage (no cloud required)
- **🔒 Privacy-First**: All data stays on your device
- **⚡ Fast & Lightweight**: Built with modern web technologies
- **🎭 Modern UI**: Clean interface with Tailwind CSS

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/rop2024/Habitron.git
   cd Habitron
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the application**
   ```bash
   # Development mode (with hot reload)
   npm run electron-dev

   # Production mode
   npm run electron
   ```

The app will launch automatically. The first run will create a local SQLite database in your user data directory.

## 📖 Usage

### Creating Your First Habit

Open the app and use the browser console (F12) to test the API:

```javascript
// Create a new habit
window.electronAPI.habits.create({
  name: "Morning Workout",
  description: "30 minutes of exercise",
  color: "#FF6B6B",
  icon: "🏃",
  goal_count: 1,
  frequency: "daily"
}).then(result => console.log("Habit created:", result));
```

### Basic Operations

```javascript
// Get all habits
window.electronAPI.habits.getAll().then(habits => console.log(habits));

// Get habits with today's status
window.electronAPI.habits.getWithTodayStatus().then(habits => console.log(habits));

// Mark a habit as completed
window.electronAPI.habits.checkin({
  habit_id: 1,
  completed: true,
  notes: "Great workout session!"
});

// Update a habit
window.electronAPI.habits.update(1, {
  name: "Updated Habit Name",
  color: "#4ECDC4"
});

// Delete a habit
window.electronAPI.habits.delete(1);
```

## 🛠️ Development

### Project Structure

```
Habitron/
├── public/
│   ├── electron.js          # Main Electron process
│   ├── preload.js           # IPC preload script
│   └── electron/
│       ├── db/
│       │   └── database.js  # SQLite database setup
│       └── managers/
│           └── HabitManager.js # Habit business logic
├── src/
│   ├── App.tsx             # Main React component
│   ├── index.tsx           # React entry point
│   └── types/
│       ├── database.ts     # Database type definitions
│       └── electron.d.ts   # Electron API types
├── build/                  # Production build output
├── package.json
└── README.md
```

### Available Scripts

```bash
# Development
npm run electron-dev    # Start with React dev server + Electron
npm start              # React development server only
npm run electron       # Production Electron app

# Building
npm run build          # Build React app for production
npm run electron-build # Build distributable Electron app
npm run dist           # Create platform-specific installers

# Testing
npm test               # Run React tests
```

### Database Schema

The app uses SQLite with the following tables:

- **habits**: Core habit information
- **habit_checkins**: Daily completion records
- **tasks**: Simple task management (legacy)
- **settings**: App configuration

## 🔧 API Reference

### Habits API

All methods return Promises and are available via `window.electronAPI.habits.*`

#### Core CRUD Operations

```typescript
// Create a habit
create(habitData: {
  name: string;
  description?: string;
  frequency?: string;
  goal_count?: number;
  color?: string;
  icon?: string;
}): Promise<Habit>

// Read operations
getAll(): Promise<Habit[]>
getById(id: number): Promise<Habit | undefined>
getWithTodayStatus(): Promise<HabitWithStatus[]>

// Update a habit
update(id: number, updates: Partial<Habit>): Promise<Habit>

// Delete a habit (soft delete)
delete(id: number): Promise<void>
```

#### Check-in Operations

```typescript
// Add/update a check-in
checkin(checkinData: {
  habit_id: number;
  checkin_date?: string;
  completed: boolean;
  notes?: string;
}): Promise<HabitCheckin>

// Get check-ins
getCheckins(habitId: number, startDate?: string, endDate?: string): Promise<HabitCheckin[]>
getTodaysCheckins(): Promise<HabitCheckin[]>
```

#### Analytics

```typescript
// Get habit statistics
getStats(habitId: number, days?: number): Promise<HabitStats>

// Get current streak
getStreak(habitId: number): Promise<number>
```

### Tasks API (Legacy)

```typescript
window.electronAPI.database.getAllTasks(): Promise<Task[]>
window.electronAPI.database.createTask(task: TaskInput): Promise<Task>
window.electronAPI.database.updateTask(id: number, updates: Partial<Task>): Promise<Task>
window.electronAPI.database.deleteTask(id: number): Promise<void>
```

## 🎨 Customization

### Habit Properties

- **Name**: Display name for the habit
- **Description**: Optional detailed description
- **Color**: Hex color code for UI theming
- **Icon**: Emoji or icon identifier
- **Goal Count**: Target completions per frequency period
- **Frequency**: "daily" or "weekly"

### Themes & Styling

The app uses Tailwind CSS for styling. Customize colors and themes by modifying the Tailwind configuration in `tailwind.config.js`.

## 📦 Building for Distribution

### Windows
```bash
npm run build-all  # Creates .exe installer
```

### macOS
```bash
npm run dist       # Creates .dmg installer
```

### Linux
```bash
npm run dist       # Creates .deb/.rpm packages
```

## 🐛 Troubleshooting

### Common Issues

1. **"Database not initialized"**
   - The app needs to run once to create the database
   - Check file permissions in the user data directory

2. **"Module not found" errors**
   ```bash
   npm install  # Reinstall dependencies
   ```

3. **Build failures**
   ```bash
   npm run build  # Clean rebuild
   ```

### Debug Mode

- Press `F12` to open developer tools
- Check the console for error messages
- Database files are stored in:
  - Windows: `%APPDATA%\my-electron-app\Consist\`
  - macOS: `~/Library/Application Support/my-electron-app/Consist/`
  - Linux: `~/.config/my-electron-app/Consist/`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and test thoroughly
4. Commit your changes: `git commit -am 'Add feature'`
5. Push to the branch: `git push origin feature-name`
6. Submit a pull request

### Development Guidelines

- Use TypeScript for type safety
- Follow React best practices
- Test database operations thoroughly
- Maintain consistent code style
- Update documentation for API changes

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Electron](https://electronjs.org/)
- UI powered by [React](https://reactjs.org/) and [Tailwind CSS](https://tailwindcss.com/)
- Database by [SQLite](https://sqlite.org/)
- Icons from [Emoji](https://emojipedia.org/)

## 📞 Support

- Create an [issue](https://github.com/rop2024/Habitron/issues) for bugs or feature requests
- Check the [discussions](https://github.com/rop2024/Habitron/discussions) for community support

---

**Happy habit tracking!** 🎯

*Built with ❤️ for building better habits*
