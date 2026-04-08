# Contributing to White Hole Solutions

First off, thank you for considering contributing to White Hole Solutions! It's people like you that make this project better for everyone.

## 🤝 Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

## 🐛 How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates. When you create a bug report, include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples**
- **Describe the behavior you observed and what you expected**
- **Include screenshots if relevant**
- **Include your environment details** (OS, browser, Node version)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, include:

- **Use a clear and descriptive title**
- **Provide a detailed description of the suggested enhancement**
- **Explain why this enhancement would be useful**
- **List any similar features in other apps**

### Pull Requests

1. Fork the repo and create your branch from `main`
2. If you've added code that should be tested, add tests
3. Ensure the test suite passes
4. Make sure your code follows the existing style
5. Write a clear commit message

## 📝 Development Process

### Setting Up Your Environment

1. Fork and clone the repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env` and configure
4. Run database migrations: `npx prisma migrate dev`
5. Seed the database: `npx prisma db seed`
6. Start development server: `npm run dev`

### Coding Guidelines

#### TypeScript
- Use TypeScript for all new files
- Define proper interfaces and types
- Avoid `any` types when possible

#### React Components
- Use functional components with hooks
- Keep components small and focused
- Use proper prop typing

#### Naming Conventions
- Components: PascalCase (`CustomerTab.tsx`)
- Functions: camelCase (`formatCurrency`)
- Constants: UPPER_SNAKE_CASE (`API_BASE_URL`)
- CSS classes: kebab-case or Tailwind classes

#### File Organization
```
src/
├── app/              # Next.js pages and API routes
├── components/       # Reusable React components
├── lib/              # Utility functions and helpers
└── middleware.ts     # Middleware
```

### Commit Messages

Write clear, concise commit messages:

- Use present tense ("Add feature" not "Added feature")
- Use imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit first line to 72 characters
- Reference issues and pull requests when relevant

Examples:
```
Add customer password reset functionality
Fix invoice PDF generation bug (#123)
Update README with deployment instructions
Refactor authentication middleware
```

### Database Changes

When making schema changes:

1. Update `prisma/schema.prisma`
2. Create migration: `npx prisma migrate dev --name descriptive_name`
3. Test migration thoroughly
4. Update seed file if needed
5. Document breaking changes

### API Routes

When adding new API routes:

- Follow RESTful conventions
- Use proper HTTP methods (GET, POST, PATCH, DELETE)
- Implement authentication where needed
- Return consistent error responses
- Document the endpoint

### Testing

- Write tests for new features
- Update tests when modifying existing code
- Ensure all tests pass before submitting PR
- Test on multiple browsers and screen sizes

## 🎨 Style Guidelines

### Tailwind CSS
- Use Tailwind utility classes primarily
- Keep custom CSS minimal
- Use theme colors from `tailwind.config.ts`
- Follow mobile-first responsive design

### Accessibility
- Use semantic HTML
- Include proper ARIA labels
- Ensure keyboard navigation works
- Test with screen readers
- Maintain color contrast ratios

## 📚 Documentation

- Update README.md for user-facing changes
- Update inline code comments for complex logic
- Add JSDoc comments for functions
- Update DEPLOYMENT.md for infrastructure changes

## 🚀 Release Process

1. Update version in `package.json`
2. Update CHANGELOG.md
3. Create a new release on GitHub
4. Tag the release with version number

## ❓ Questions?

Feel free to open an issue with the "question" label or reach out to the maintainers.

---

Thank you for contributing! 🎉
