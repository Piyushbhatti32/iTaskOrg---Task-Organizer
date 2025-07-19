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
  - Light/Dark theme
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
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Date Handling**: date-fns
- **UI Components**: Custom components with Tailwind

## Project Structure

```
itaskorg/
├── src/
│   ├── app/                 # Next.js app router pages
│   ├── components/          # Reusable UI components
│   ├── store/              # Zustand store and state management
│   └── styles/             # Global styles and Tailwind config
├── public/                 # Static assets
└── docs/                   # Documentation
```

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## Development

See [DEVELOPMENT.md](DEVELOPMENT.md) for detailed development guidelines and best practices.

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for a list of changes and version history.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
