# Contributing to TripIt Calendar Emoji Enhancer

Thank you for considering contributing to this project! 🎉

## How to Contribute

### Reporting Bugs

Open an issue on GitHub with:

- Clear description and steps to reproduce
- Expected vs actual behavior
- Your environment (calendar app, Cloudflare region, etc.)
- Any relevant error messages or logs

### Suggesting Features

Open an issue describing:

- The feature and why it's useful
- How you envision it working
- Any alternatives you've considered

### Contributing Code

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-emoji-type`)
3. Make your changes and test with `wrangler dev`
4. Commit with descriptive messages
5. Push to your fork and open a Pull Request

See the [Contributing section in README.md](README.md#-contributing) for detailed instructions on adding new event types.

## Development

```bash
# Clone your fork
git clone https://github.com/YOUR-USERNAME/tripit-emoji.git
cd tripit-emoji

# Create .dev.vars with your TripIt URL
cp .dev.vars.example .dev.vars
# Edit .dev.vars with your values

# Test locally
wrangler dev

# Visit http://localhost:8787 to see output
```

## Code Style

- Use ES6+ JavaScript features
- Add comments for complex logic
- Keep functions focused and small
- Follow existing naming conventions

## Commit Messages

Write clear, descriptive messages:

- ✅ `Add restaurant emoji detection`
- ✅ `Fix: Handle multi-line summaries correctly`
- ✅ `Docs: Update security token instructions`
- ❌ `fix stuff`
- ❌ `updates`

## Code of Conduct

- Be respectful and constructive
- Welcome newcomers and questions
- Keep discussions focused and on-topic

Thank you for contributing! 🙌
