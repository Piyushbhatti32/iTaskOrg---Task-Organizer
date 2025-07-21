# iTaskOrg - Task Organizer

A modern, feature-rich task management application built with Next.js and Tailwind CSS. Fully responsive and optimized for all devices.

## Features

- 📝 **Task Management**
  - Create, edit, and delete tasks
  - Add subtasks and track completion
  - Set priorities and due dates
  - Organize tasks in groups

- 📅 **Calendar View**
  - Monthly calendar view
  - Task visualization by date
  - Easy navigation and task scheduling

- ⏱️ **Pomodoro Timer**
  - Customizable focus sessions
  - Short and long break intervals
  - Session tracking and statistics

- 📋 **Templates**
  - Create reusable task templates
  - Quick task creation from templates
  - Template management

- 👥 **Team Collaboration**
  - Create and manage groups
  - Assign tasks to team members
  - Track team progress

- 📊 **Statistics**
  - Task completion metrics
  - Productivity insights
  - Time tracking analytics

- ⚙️ **Customization**
  - Light/Dark theme with dynamic accent colors
  - 8 beautiful accent color themes (Blue, Purple, Green, Red, Yellow, Pink, Indigo, Teal)
  - Notification preferences
  - Timer settings
  - Profile management

- 📱 **Mobile Responsive**
  - Fully responsive design for all devices
  - Mobile-first navigation with hamburger menu
  - Touch-friendly interface elements
  - Optimized layouts for phones, tablets, and desktops
  - Seamless experience across different screen sizes

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/itaskorg.git
   cd itaskorg
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

### Vercel (Recommended)

This app is optimized for deployment on Vercel, the platform from the creators of Next.js:

1. Connect your GitHub repository to Vercel:
   - Visit [vercel.com](https://vercel.com)
   - Import your repository
   - Vercel will auto-detect Next.js and configure build settings

2. Set up environment variables in Vercel dashboard:
   - Add your Firebase configuration variables
   - Add any other required environment variables

3. Deploy:
   ```bash
   # Automatic deployment on git push
   git push origin main
   ```

### Firebase Hosting (Static Export)

For static hosting without server-side features:

1. Modify `next.config.mjs` to enable static export:
   ```javascript
   /** @type {import('next').NextConfig} */
   const nextConfig = {
     output: 'export',
     trailingSlash: true,
     images: {
       unoptimized: true
     }
   };
   ```

2. Build and export:
   ```bash
   npm run build
   firebase deploy
   ```

### Other Deployment Platforms

- **Netlify** - Great for static sites
- **AWS Amplify** - Full-stack deployment
- **Google Cloud Platform** - Enterprise-scale deployment

## Tech Stack

- **Framework**: Next.js 14
- **Backend**: Firebase (Firestore, Authentication)
- **Styling**: Tailwind CSS with dynamic theming
- **State Management**: Zustand
- **Date Handling**: date-fns
- **UI Components**: Custom components with Tailwind

## Project Structure

```
itaskorg/
├── src/
│   ├── app/                 # Next.js app router pages and API routes
│   ├── components/          # Reusable UI components
│   ├── contexts/            # React contexts (Theme, etc.)
│   ├── store/              # Zustand store and state management
│   ├── utils/              # Utility functions
│   └── styles/             # Global styles and Tailwind config
├── public/                 # Static assets
└── docs/                   # Documentation and API fixes summary
```

## Recent Improvements

### Dynamic Theme System
- Implemented dynamic accent color theming with 8 color options
- CSS custom properties for seamless theme switching
- Persistent theme preferences with Firebase integration

### API Optimizations
- Fixed Firestore composite index issues across all endpoints
- Improved query performance with client-side sorting fallbacks
- Enhanced error handling and authentication flows
- See [API_FIXES_SUMMARY.md](docs/API_FIXES_SUMMARY.md) for detailed changes

### Mobile Experience
- Fully responsive design optimized for all screen sizes
- Touch-friendly interface elements
- Improved navigation and user experience

## Configuration

### Firebase Setup

1. Create a Firebase project at [https://console.firebase.google.com](https://console.firebase.google.com)

2. Enable the following services:
   - Authentication (Email/Password)
   - Firestore Database

3. Create a `.env.local` file in the root directory with your Firebase config:
   ```bash
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

### Firestore Security Rules

Apply these security rules to your Firestore database:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Tasks are user-specific
    match /tasks/{taskId} {
      allow read, write: if request.auth != null && 
        (resource.data.userId == request.auth.uid || 
         resource.data.assignedTo == request.auth.uid);
    }
    
    // Templates are user-specific
    match /templates/{templateId} {
      allow read, write: if request.auth != null && resource.data.userId == request.auth.uid;
    }
    
    // Groups and related collections
    match /groups/{groupId} {
      allow read, write: if request.auth != null && 
        request.auth.uid in resource.data.members;
    }
  }
}
```

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## Development

See [DEVELOPMENT.md](DEVELOPMENT.md) for detailed development guidelines and best practices.

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for a list of changes and version history.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
