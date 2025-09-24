# Collabrix Frontend

A modern, real-time collaborative document editing platform built with React, Vite, and cutting-edge web technologies. This frontend provides an intuitive user interface for seamless document collaboration with real-time editing, presence awareness, and advanced sharing capabilities.

## 🚀 Features

### **Core Features**

- **Real-time Collaborative Editing**: Live document editing with Yjs and WebSocket integration
- **Rich Text Editor**: TipTap-powered editor with advanced formatting capabilities
- **User Presence**: Real-time cursor tracking and user activity indicators
- **Document Management**: Create, edit, share, and organize documents
- **Advanced Sharing**: Customizable permissions and public/private document sharing
- **Activity Tracking**: Complete audit trail with notifications
- **Responsive Design**: Mobile-first design that works on all devices

### **UI/UX Features**

- **Glass Morphism Design**: Modern glassmorphic interface with neon accents
- **Smooth Animations**: Framer Motion powered transitions and micro-interactions
- **Dark Theme**: Beautiful dark theme with purple/teal accent colors
- **Interactive Components**: Hover effects, loading states, and feedback animations
- **Accessibility**: WCAG compliant with keyboard navigation support

### **Technical Features**

- **Offline Support**: IndexedDB integration for offline document access
- **TypeScript Ready**: Full TypeScript support with type definitions
- **Modern Tooling**: Vite for fast development and optimized builds
- **ESLint Integration**: Code quality and consistency enforcement
- **Tailwind CSS**: Utility-first styling with custom design system

## 🏗️ Project Structure

```
client/
├── public/
│   └── vite.svg                 # App favicon and assets
├── src/
│   ├── components/              # Reusable UI components
│   │   ├── AnimatedButton.jsx   # Custom animated button component
│   │   ├── AuthCard.jsx         # Authentication form wrapper
│   │   ├── CollaborativeEditor.jsx # Real-time editor component
│   │   ├── Layout.jsx           # Main layout wrapper
│   │   ├── Navbar.jsx           # Navigation with notifications
│   │   ├── ShareModal.jsx       # Document sharing interface
│   │   └── ...                  # Other UI components
│   ├── pages/                   # Main application pages
│   │   ├── Dashboard.jsx        # User dashboard with documents
│   │   ├── Editor.jsx           # Document editor page
│   │   ├── Landing.jsx          # Landing page
│   │   ├── Login.jsx            # Authentication page
│   │   ├── Profile.jsx          # User profile management
│   │   └── ...                  # Other pages
│   ├── context/                 # React Context providers
│   │   ├── AuthContext.jsx      # Authentication state management
│   │   └── ThemeContext.jsx     # Theme and preferences
│   ├── utils/                   # Utility functions
│   │   ├── customFetch.js       # API request wrapper
│   │   └── documentAPI.js       # Document-related API calls
│   ├── lib/                     # External library configurations
│   ├── assets/                  # Static assets and images
│   ├── App.jsx                  # Main application component
│   ├── main.jsx                 # Application entry point
│   └── index.css                # Global styles and Tailwind imports
├── index.html                   # HTML template
├── vite.config.js              # Vite configuration
├── tailwind.config.js          # Tailwind CSS configuration
├── postcss.config.js           # PostCSS configuration
├── eslint.config.js            # ESLint configuration
└── package.json                # Dependencies and scripts
```

## 🛠️ Technology Stack

- **Framework**: React 18 with Hooks and Context API
- **Build Tool**: Vite for fast development and optimized builds
- **Styling**: Tailwind CSS with custom design system
- **Animations**: Framer Motion for smooth transitions
- **Icons**: Lucide React for consistent iconography
- **Real-time**: Yjs with y-websocket for collaborative editing
- **Editor**: TipTap (ProseMirror) with collaboration extensions
- **HTTP Client**: Axios for API requests
- **Routing**: React Router DOM for client-side navigation
- **Notifications**: Sonner for toast notifications
- **Storage**: IndexedDB for offline document storage

## 📋 Prerequisites

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **Collabrix Backend** running on port 5000

## 🚀 Quick Start

### 1. Navigate to Client Directory

```bash
cd client
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env` file in the client directory:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:5000/api/v1
VITE_WS_URL=ws://localhost:5000

# App Configuration
VITE_APP_NAME=Collabrix
VITE_APP_VERSION=1.0.0

# Feature Flags (optional)
VITE_ENABLE_AI_ASSISTANT=true
VITE_ENABLE_OFFLINE_MODE=true
```

### 4. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 🔧 Available Scripts

### Development

```bash
# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Lint code for errors and warnings
npm run lint
```

### Build Configuration

```bash
# Development build (with source maps)
npm run dev

# Production build (optimized and minified)
npm run build

# Analyze bundle size
npm run build -- --analyze
```

## 🎨 Design System

### **Color Palette**

```css
/* Primary Colors */
--neon-purple: #a855f7
--neon-teal: #14b8a6
--neon-orange: #f97316

/* Neutral Colors */
--dark-bg: #0f0f0f
--dark-surface: #1a1a1a
--glass-white: rgba(255, 255, 255, 0.1)

/* Text Colors */
--text-primary: #ffffff
--text-secondary: #d1d5db
--text-muted: #9ca3af
```

### **Typography**

- **Headings**: Inter font family with custom font weights
- **Body Text**: System font stack for optimal readability
- **Code**: JetBrains Mono for code snippets and IDs

### **Components**

- **Glass Morphism**: Backdrop blur with subtle borders
- **Neon Accents**: Glowing effects for interactive elements
- **Smooth Transitions**: 300ms duration for all interactions
- **Micro-interactions**: Hover and click feedback on all buttons

## 🔌 API Integration

### **Backend Connection**

```javascript
// API Base Configuration
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";
const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:5000";
```

### **Authentication Flow**

```javascript
// Login flow
const login = async (credentials) => {
  const response = await documentAPI.login(credentials);
  if (response.success) {
    localStorage.setItem("authToken", response.data.token);
    setUser(response.data.user);
  }
};
```

### **Real-time Collaboration**

```javascript
// WebSocket connection for real-time editing
const wsProvider = new WebsocketProvider(
  `${WS_URL}/${docId}?token=${token}`,
  docId,
  ydoc
);
```

## 🎛️ Configuration

### **Vite Configuration**

```javascript
// vite.config.js
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true, // Allow external connections
  },
  build: {
    outDir: "dist",
    sourcemap: true,
  },
});
```

### **Tailwind Configuration**

```javascript
// tailwind.config.js - Custom theme extensions
module.exports = {
  theme: {
    extend: {
      colors: {
        "neon-purple": "#a855f7",
        "neon-teal": "#14b8a6",
        "neon-orange": "#f97316",
      },
      backdropBlur: {
        xs: "2px",
      },
      animation: {
        glow: "glow 2s ease-in-out infinite alternate",
      },
    },
  },
};
```

## 📱 Features Deep Dive

### **Real-time Collaborative Editing**

- **Yjs Integration**: Conflict-free replicated data types (CRDT)
- **Live Cursors**: See other users' cursors in real-time
- **Presence Indicators**: Know who's online and typing
- **Automatic Sync**: Changes sync automatically across all clients

### **Document Management**

- **Create/Edit/Delete**: Full document lifecycle management
- **Version History**: Track changes and document evolution
- **Search**: Find documents quickly with instant search
- **Filters**: Organize by date, type, or collaboration status

### **Sharing & Permissions**

- **Public Links**: Share documents with anyone
- **Permission Levels**: Owner, Edit, View permissions
- **Access Requests**: Request access to private documents
- **Share Modal**: Intuitive sharing interface

### **User Experience**

- **Responsive Design**: Mobile-first approach
- **Loading States**: Skeleton loaders and progress indicators
- **Error Handling**: Graceful error recovery
- **Offline Support**: Continue working without internet

## 🔒 Security Features

### **Authentication**

- **JWT Tokens**: Secure token-based authentication
- **Auto-refresh**: Automatic token renewal
- **Protected Routes**: Route guards for authenticated pages
- **Logout**: Secure session termination

### **Data Protection**

- **Input Validation**: Client-side validation for all forms
- **XSS Protection**: Sanitized HTML rendering
- **CSRF Prevention**: Token-based request verification
- **Secure Storage**: Encrypted local storage for sensitive data

## 🎯 Performance Optimizations

### **Code Splitting**

```javascript
// Lazy loading for better performance
const Editor = lazy(() => import("./pages/Editor"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
```

### **Bundle Optimization**

- **Tree Shaking**: Remove unused code automatically
- **Code Splitting**: Lazy load components and routes
- **Asset Optimization**: Image compression and WebP support
- **Caching**: Service worker for offline functionality

### **Real-time Performance**

- **Debounced Updates**: Prevent excessive API calls
- **Optimistic Updates**: Update UI before server confirmation
- **Connection Pooling**: Efficient WebSocket management
- **Memory Management**: Proper cleanup of resources

## 🧪 Development

### **Project Setup for Development**

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run linting
npm run lint

# Build for production
npm run build
```

### **Code Style**

- **ESLint**: Consistent code formatting
- **Prettier**: Automatic code formatting
- **Husky**: Pre-commit hooks for code quality
- **Component Structure**: Consistent file organization

### **Testing (Recommended Setup)**

```bash
# Install testing dependencies
npm install --save-dev @testing-library/react @testing-library/jest-dom vitest

# Add test scripts to package.json
"test": "vitest",
"test:ui": "vitest --ui"
```

## 🚀 Deployment

### **Build for Production**

```bash
npm run build
```

### **Deploy to Netlify**

```bash
# Build command
npm run build

# Publish directory
dist

# Environment variables
VITE_API_BASE_URL=https://your-backend-url.com/api/v1
VITE_WS_URL=wss://your-backend-url.com
```

### **Deploy to Vercel**

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### **Static File Server**

```bash
# Serve built files
npx serve dist
```

## 🔧 Troubleshooting

### **Common Issues**

#### WebSocket Connection Failed

```javascript
// Check if backend is running on port 5000
// Verify VITE_WS_URL in .env file
// Check browser console for WebSocket errors
```

#### API Requests Failing

```javascript
// Verify VITE_API_BASE_URL is correct
// Check if backend server is running
// Inspect network tab in browser dev tools
```

#### Styling Issues

```javascript
// Ensure Tailwind CSS is properly configured
// Check if postcss.config.js exists
// Verify @tailwind directives in index.css
```

### **Development Tips**

- Use React Developer Tools for debugging
- Enable Vite's HMR for faster development
- Use browser's developer tools for WebSocket debugging
- Check console for any JavaScript errors

## 📚 Additional Resources

### **Documentation**

- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [Framer Motion Documentation](https://www.framer.com/motion/)
- [Yjs Documentation](https://docs.yjs.dev/)

### **Learning Resources**

- [React Hooks Guide](https://react.dev/reference/react)
- [Modern JavaScript Features](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
- [CSS Grid and Flexbox](https://css-tricks.com/)
- [WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### **Development Guidelines**

- Follow the existing code style and conventions
- Add proper TypeScript types for new components
- Include comments for complex logic
- Test your changes across different screen sizes
- Ensure accessibility standards are met

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

## 🙏 Acknowledgments

- **TipTap** for the excellent rich text editor
- **Yjs** for the collaborative editing capabilities
- **Framer Motion** for smooth animations
- **Tailwind CSS** for the utility-first styling
- **Lucide** for the beautiful icon set

---

**Made with ❤️ by [thejaAshwin62](https://github.com/thejaAshwin62)**

**Collabrix Frontend** - Modern Collaborative Document Editing Interface+ Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
