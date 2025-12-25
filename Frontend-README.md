# TeamCollab Frontend

Modern React frontend for the TeamCollab real-time team collaboration platform featuring project management, Kanban boards, team chat, and an AI-powered task assistant.

## Tech Stack

- **React 19** + **TypeScript** - UI framework and type safety
- **Vite** - Build tooling and dev server
- **Tailwind CSS v4** - Utility-first styling
- **Zustand** - State management
- **React Router v7** - Client-side routing
- **@hello-pangea/dnd** - Drag-and-drop functionality
- **Socket.IO Client** - Real-time communication
- **Firebase SDK** - Authentication

## Features

- 🔐 **Authentication** - Email/password and Google OAuth via Firebase
- 📊 **Project Management** - Create and manage projects with role-based access
- 📋 **Kanban Boards** - Drag-and-drop task management
- 💬 **Real-Time Chat** - Team messaging with typing indicators
- 🤖 **AI Assistant** - Natural language task commands
- 🎨 **Dark Mode** - System-aware theme switching
- 👥 **Team Management** - Role-based access control (Admin, Manager, Member)

## Project Structure

```
frontend/
├── src/
│   ├── components/     # Reusable UI components
│   ├── config/         # Firebase configuration
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Utility functions
│   ├── pages/          # Route page components
│   ├── services/       # API service layer
│   ├── stores/         # Zustand state stores
│   ├── types/          # TypeScript type definitions
│   ├── App.tsx         # Root application component
│   └── main.tsx        # Application entry point
├── public/             # Static assets
├── .env.example        # Environment variables template
├── index.html          # HTML entry point
├── package.json
├── tsconfig.json       # TypeScript configuration
├── tailwind.config.js  # Tailwind CSS configuration
└── vite.config.ts      # Vite configuration
```

## Getting Started

### Prerequisites

- Node.js 18 or higher
- Firebase project with Authentication enabled
- Backend API running (see backend README)

### Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing one
3. Enable Authentication:
   - Go to Authentication → Sign-in method
   - Enable **Email/Password** provider
   - Enable **Google** provider
4. Register your web app:
   - Go to Project Settings → General
   - Click "Add app" → Web (</> icon)
   - Register app and copy the Firebase config object

### Installation

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env
```

### Environment Configuration

Edit `.env` with your Firebase configuration:

```env
# Backend API
VITE_API_URL=http://localhost:5000

# Firebase Configuration
VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

**Note**: Get these values from your Firebase project settings → General → Your apps → Web app config.

### Running the Application

```bash
# Development mode with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npm run type-check

# Linting
npm run lint
```

The application will open at `http://localhost:5173`

## Key Components

### Authentication

- **LoginPage** - Email/password and Google sign-in
- **RegisterPage** - New user registration with team creation
- **ProtectedRoute** - Route guard for authenticated users

### Project Management

- **ProjectList** - Grid view of all team projects
- **ProjectForm** - Create/edit project modal
- **ProjectCard** - Individual project display with actions

### Task Management

- **KanbanBoard** - Drag-and-drop task board
- **TaskCard** - Individual task display
- **TaskForm** - Create/edit task modal
- **TaskDetails** - Full task view with comments

### Team Features

- **ChatPanel** - Real-time team messaging
- **TeamSettings** - Manage team members and roles
- **UserProfile** - Update user information

### AI Assistant

- **AssistantPanel** - Natural language command interface
- Supports commands like:
  - "Create a task called [name]"
  - "Assign [task] to [user]"
  - "Move [task] to done"
  - "List all tasks"

## State Management

The app uses Zustand for state management with the following stores:

- **authStore** - Authentication state and user data
- **projectStore** - Projects and current project
- **taskStore** - Tasks and Kanban board state
- **chatStore** - Messages and chat state
- **themeStore** - Dark mode preferences

Example usage:

```typescript
import { useAuthStore } from '@/stores/authStore';

function MyComponent() {
  const { user, isAuthenticated, logout } = useAuthStore();
  
  return (
    <div>
      {isAuthenticated && <p>Welcome, {user?.displayName}</p>}
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

## Routing

Routes are defined in `App.tsx` using React Router v7:

| Path | Component | Auth Required | Description |
|------|-----------|---------------|-------------|
| `/` | Dashboard | Yes | Main dashboard |
| `/login` | LoginPage | No | User login |
| `/register` | RegisterPage | No | User registration |
| `/projects` | ProjectsPage | Yes | Project list |
| `/projects/:id` | ProjectDetailPage | Yes | Project Kanban board |
| `/chat` | ChatPage | Yes | Team chat |
| `/settings` | SettingsPage | Yes | Team settings |
| `/profile` | ProfilePage | Yes | User profile |

## Real-Time Features

Socket.IO integration for live updates:

```typescript
import { socket } from '@/services/socket';

// Listen for task updates
socket.on('task:updated', (task) => {
  // Update task in store
});

// Emit typing indicator
socket.emit('user:typing', { userId, isTyping: true });
```

## Styling

The app uses Tailwind CSS v4 with custom configuration:

- Responsive design (mobile-first)
- Dark mode support via `class` strategy
- Custom color palette
- Component classes for consistency

Example:

```tsx
<button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 
                   text-white rounded-lg transition-colors
                   dark:bg-blue-500 dark:hover:bg-blue-600">
  Click Me
</button>
```

## API Integration

API calls are organized in `src/services/`:

```typescript
import { api } from '@/services/api';

// Get all projects
const projects = await api.get('/projects');

// Create task
const task = await api.post('/tasks', {
  title: 'New task',
  status: 'todo',
  projectId: '123'
});
```

The API service handles:
- JWT token management
- Request/response interceptors
- Error handling
- Base URL configuration

## Building for Production

```bash
# Create optimized production build
npm run build

# Preview production build locally
npm run preview
```

Build output will be in the `dist/` directory.

### Deployment

The app can be deployed to:

- **Vercel** (recommended for Vite apps)
- **Netlify**
- **Firebase Hosting**
- **Any static hosting service**

Remember to set environment variables in your hosting platform.

## Development Tips

### Type Safety

Use TypeScript types from `src/types/`:

```typescript
import { Task, Project, User } from '@/types';

const task: Task = {
  id: '1',
  title: 'My task',
  status: 'todo',
  // ...
};
```

### Custom Hooks

Leverage custom hooks from `src/hooks/`:

```typescript
import { useAuth } from '@/hooks/useAuth';
import { useSocket } from '@/hooks/useSocket';

function MyComponent() {
  const { user, isAdmin } = useAuth();
  const { isConnected } = useSocket();
  
  // Component logic
}
```

## Troubleshooting

### Firebase Authentication Issues

- Ensure Firebase config is correct in `.env`
- Check that authentication providers are enabled in Firebase Console
- Verify authorized domains in Firebase Console → Authentication → Settings

### Socket.IO Connection Issues

- Confirm backend is running
- Check CORS settings in backend
- Verify `VITE_API_URL` points to correct backend URL

### Build Errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf node_modules/.vite
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT