# Contributing to iTaskOrg

Thank you for your interest in contributing to iTaskOrg! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct:

- Be respectful and inclusive
- Use welcoming and inclusive language
- Be collaborative
- Accept constructive criticism
- Focus on what is best for the community

## How to Contribute

1. **Fork the Repository**
   ```bash
   # Clone your fork
   git clone https://github.com/your-username/itaskorg.git
   cd itaskorg
   
   # Add upstream remote
   git remote add upstream https://github.com/original/itaskorg.git
   ```

2. **Create a Branch**
   ```bash
   # For features
   git checkout -b feature/your-feature-name
   
   # For bug fixes
   git checkout -b fix/bug-name
   
   # For documentation
   git checkout -b docs/topic-name
   ```

3. **Make Changes**
   - Follow the code style guide in [DEVELOPMENT.md](DEVELOPMENT.md)
   - Write clear, concise commit messages
   - Add tests if applicable
   - Update documentation as needed

4. **Test Your Changes**
   ```bash
   # Install dependencies
   npm install
   
   # Run tests
   npm test
   
   # Run development server
   npm run dev
   ```

5. **Submit a Pull Request**
   - Update your fork
   - Push your changes
   - Create a pull request
   - Fill out the PR template

## Pull Request Process

1. **Before Submitting**
   - Ensure tests pass
   - Update documentation
   - Add to CHANGELOG.md
   - Verify code style

2. **PR Description**
   - Clear description of changes
   - Link related issues
   - List breaking changes
   - Add screenshots if UI changes

3. **Review Process**
   - Maintainers will review
   - Address feedback
   - Changes may be requested
   - Approval from maintainer required

4. **After Merge**
   - Delete your branch
   - Update your fork
   - Celebrate! 🎉

## Development Guidelines

### Code Style

- Use ESLint and Prettier
- Follow existing patterns
- Keep functions small
- Write clear comments
- Use meaningful names

### Testing

- Write unit tests
- Test edge cases
- Check accessibility
- Verify mobile responsiveness

### Documentation

- Update README.md
- Add JSDoc comments
- Document new features
- Update API documentation

### Commit Messages

```
type(scope): description

[optional body]

[optional footer]
```

Types:
- feat: New feature
- fix: Bug fix
- docs: Documentation
- style: Formatting
- refactor: Code restructuring
- test: Adding tests
- chore: Maintenance

### Branch Strategy

- main: Production code
- develop: Development code
- feature/*: New features
- fix/*: Bug fixes
- docs/*: Documentation

## Issue Guidelines

1. **Before Creating**
   - Search existing issues
   - Check FAQ
   - Verify against latest version

2. **Issue Template**
   - Use provided templates
   - Be specific
   - Include reproduction steps
   - Add system information

3. **Issue Types**
   - Bug Report
   - Feature Request
   - Documentation
   - Question

## Getting Help

- Join our community chat
- Check documentation
- Ask in issues
- Contact maintainers

## Recognition

Contributors will be:
- Added to CONTRIBUTORS.md
- Mentioned in release notes
- Thanked in our community

## License

By contributing, you agree that your contributions will be licensed under the same license as the project (see LICENSE file). 