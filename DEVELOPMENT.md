# Development Guide

This guide provides detailed information for developers working on the iTaskOrg project.

## Development Environment

1. **Prerequisites**
   - Node.js 18+ (LTS recommended)
   - npm 9+ or yarn
   - Git

2. **Editor Setup**
   - VS Code recommended
   - Extensions:
     - ESLint
     - Prettier
     - Tailwind CSS IntelliSense
     - JavaScript and React snippets

3. **Environment Variables**
   ```env
   NEXT_PUBLIC_APP_NAME=iTaskOrg
   NEXT_PUBLIC_APP_VERSION=1.0.0
   ```

## Project Structure

```
itaskorg/
├── src/
│   ├── app/                 # Next.js app router pages
│   │   ├── layout.js       # Root layout
│   │   ├── page.js         # Home page
│   │   ├── calendar/       # Calendar feature
│   │   ├── focus/          # Pomodoro feature
│   │   ├── templates/      # Templates feature
│   │   ├── groups/         # Groups feature
│   │   ├── team/           # Team feature
│   │   ├── stats/          # Statistics feature
│   │   ├── settings/       # Settings feature
│   │   ├── profile/        # Profile feature
│   │   ├── completed/      # Completed tasks
│   │   └── login/          # Authentication
│   ├── components/         # Reusable components
│   │   ├── ui/            # UI components
│   │   └── features/      # Feature-specific components
│   ├── store/             # Zustand store
│   │   └── index.js       # Store configuration
│   └── styles/            # Global styles
├── public/                # Static assets
└── docs/                  # Documentation
```

## Code Style Guide

1. **JavaScript**
   - Use ES6+ features
   - Prefer const over let
   - Use arrow functions
   - Destructure props
   - Use optional chaining

2. **React**
   - Use functional components
   - Use hooks for state and effects
   - Keep components focused and small
   - Use prop-types for type checking

3. **Naming Conventions**
   - Components: PascalCase
   - Functions: camelCase
   - Files: kebab-case
   - Constants: UPPER_SNAKE_CASE

4. **State Management**
   - Use Zustand for global state
   - Use React state for local state
   - Keep state normalized
   - Document state shape

## Feature Development

1. **Planning**
   - Create feature branch
   - Document requirements
   - Plan component structure
   - Design state shape

2. **Implementation**
   - Start with UI components
   - Add state management
   - Implement business logic
   - Add error handling

3. **Testing**
   - Write unit tests
   - Test edge cases
   - Test responsiveness
   - Test accessibility

4. **Documentation**
   - Update component docs
   - Document state changes
   - Update README if needed
   - Add usage examples

## Git Workflow

1. **Branches**
   ```bash
   # Feature branch
   git checkout -b feature/feature-name
   
   # Bug fix branch
   git checkout -b fix/bug-name
   
   # Documentation branch
   git checkout -b docs/topic-name
   ```

2. **Commits**
   ```bash
   # Format
   type(scope): description
   
   # Examples
   feat(calendar): add month view
   fix(auth): resolve login error
   docs(api): update endpoints
   ```

3. **Pull Requests**
   - Use PR template
   - Add description
   - Link related issues
   - Request reviews

## Testing

1. **Unit Tests**
   ```bash
   # Run all tests
   npm test
   
   # Run specific test
   npm test -- path/to/test
   ```

2. **E2E Tests**
   ```bash
   # Run Cypress tests
   npm run cypress
   ```

## Deployment

1. **Build**
   ```bash
   # Production build
   npm run build
   
   # Start production server
   npm start
   ```

2. **Environment**
   - Set production variables
   - Check dependencies
   - Verify assets

## Performance

1. **Optimization**
   - Use React.memo for expensive renders
   - Lazy load components
   - Optimize images
   - Minimize bundle size

2. **Monitoring**
   - Check Lighthouse scores
   - Monitor load times
   - Track error rates
   - Measure Core Web Vitals

## Troubleshooting

1. **Common Issues**
   - Clear node_modules and reinstall
   - Clear Next.js cache
   - Check environment variables
   - Verify dependencies

2. **Debug Tools**
   - React DevTools
   - Network tab
   - Console logs
   - Error boundaries

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [React Documentation](https://reactjs.org/docs) 