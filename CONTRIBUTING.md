# Contributing to Telegraf Bot Framework

First off, thank you for considering contributing to the Telegraf Bot Framework! 🎉

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Pull Request Process](#pull-request-process)
- [Coding Guidelines](#coding-guidelines)

## Code of Conduct

This project and everyone participating in it is governed by respect and professionalism. Please be kind and courteous to others.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues. When creating a bug report, include:

- A clear and descriptive title
- Steps to reproduce the issue
- Expected vs actual behavior
- Code samples if applicable
- Your environment (Node.js version, OS, etc.)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, include:

- A clear and descriptive title
- Detailed description of the proposed feature
- Examples of how the feature would be used
- Why this enhancement would be useful

### Pull Requests

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add some amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## Development Setup

```bash
# Clone the repository
git clone https://github.com/paulorenan/telegraf-bot-framework.git
cd telegraf-bot-framework

# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test

# Run examples
npm run dev
```

## Pull Request Process

1. Ensure your code builds without errors (`npm run build`)
2. Update the README.md with details of changes if applicable
3. Update documentation in the `docs/` folder if needed
4. The PR will be merged once you have approval from maintainers

## Coding Guidelines

### TypeScript Style

- Use TypeScript for all new code
- Follow existing code style
- Use meaningful variable and function names
- Add JSDoc comments for public APIs

```typescript
/**
 * Registers a new command handler
 * 
 * @param handler - Command handler configuration
 */
registerCommand(handler: ICommandHandler): void {
  // Implementation
}
```

### File Organization

- Keep files focused and single-purpose
- Place tests in `tests/` directory mirroring `src/` structure
- Export public APIs through `src/index.ts`

### Commit Messages

- Use present tense ("Add feature" not "Added feature")
- Use imperative mood ("Move cursor to..." not "Moves cursor to...")
- Start with a capital letter
- Keep first line under 72 characters
- Reference issues and pull requests when applicable

Examples:
```
Add session management plugin
Fix memory leak in middleware pipeline
Update documentation for MenuPlugin
```

### Testing

- Write tests for new features
- Ensure existing tests pass
- Aim for high code coverage
- Use descriptive test names

```typescript
describe('BotEngine', () => {
  it('should register a command successfully', () => {
    // Test implementation
  });
});
```

## Documentation

- Update relevant documentation for new features
- Add examples for new plugins or features
- Keep code comments up to date
- Write clear and concise documentation

## Questions?

Feel free to reach out:
- Email: rennandeveloper@gmail.com
- GitHub Issues: [Create an issue](https://github.com/paulorenan/telegraf-bot-framework/issues)

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing! 🚀**

**Made with ❤️ by Paulo Renan**

