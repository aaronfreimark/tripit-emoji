# Contributing to TripIt Calendar Emoji Enhancer

First off, thank you for considering contributing to this project! 🎉

## How Can I Contribute?

### 🐛 Reporting Bugs

Before creating bug reports, please check existing issues. When creating a bug report, include:

- **Clear title** - Describe the issue concisely
- **Steps to reproduce** - List the exact steps
- **Expected behavior** - What should happen
- **Actual behavior** - What actually happens
- **Environment** - Cloudflare Worker version, calendar app, etc.
- **Logs** - Include relevant error messages or logs

### 💡 Suggesting Enhancements

Enhancement suggestions are welcome! Please provide:

- **Clear description** - What feature would you like?
- **Use case** - Why is this feature useful?
- **Examples** - How would it work?
- **Alternatives** - Have you considered alternatives?

### 🔧 Pull Requests

1. **Fork the repo** and create your branch from `main`
2. **Make your changes**
   - Write clear, commented code
   - Follow the existing code style
   - Test your changes thoroughly
3. **Update documentation** if needed
4. **Commit with clear messages**
   ```
   Add feature: Support for train event emojis
   
   - Added TRAIN emoji type
   - Updated getEventType() to detect rail events
   - Added documentation for train detection
   ```
5. **Push to your fork** and submit a pull request

## Development Setup

### Prerequisites
- Node.js 18+ 
- Wrangler CLI: `npm install -g wrangler`
- A Cloudflare account

### Local Development

1. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR-USERNAME/tripit-emoji-worker.git
   cd tripit-emoji-worker
   ```

2. **Test locally**
   ```bash
   wrangler dev
   ```

3. **Make changes** to `tripit-emoji-worker.js`

4. **Test your changes**
   - Visit `http://localhost:8787` 
   - Verify the ICS output looks correct
   - Check that emojis are added properly

### Testing

Since this is a simple worker, manual testing is usually sufficient:

1. **Unit test your logic**
   - Test the `getEventType()` function with various inputs
   - Verify emoji placement is correct
   - Check edge cases (events without descriptions, etc.)

2. **Integration test**
   - Deploy to a test worker
   - Subscribe to the feed in a calendar app
   - Verify events display correctly

3. **Test with real data**
   - Use your actual TripIt feed
   - Check all event types are detected properly

## Code Style

### JavaScript
- Use ES6+ features
- Clear variable names
- Comment complex logic
- Keep functions focused and small

### Comments
```javascript
/**
 * Determines the event type based on summary and description
 * @param {string} summary - Event summary from ICS
 * @param {string} description - Event description from ICS
 * @returns {string|null} Event type or null if unknown
 */
function getEventType(summary, description) {
  // Implementation
}
```

## Adding New Event Types

To add support for a new event type:

1. **Add the emoji** to the `EMOJIS` object
   ```javascript
   const EMOJIS = {
     FLIGHT: '✈️',
     HOTEL: '🛎️',
     CAR_RENTAL: '🚘',
     PARKING: '🚙',
     TRAIN: '🚂'  // New!
   };
   ```

2. **Add detection logic** to `getEventType()`
   ```javascript
   // Check for train/rail
   if (summaryLower.includes('amtrak') || 
       descriptionLower.includes('[rail]')) {
     return 'TRAIN';
   }
   ```

3. **Test thoroughly**
   - Create test events in TripIt
   - Verify detection works
   - Check emoji appears correctly

4. **Update documentation**
   - Add to README.md
   - Include examples
   - Update the customization section

## Commit Messages

Write clear, descriptive commit messages:

- **Good:** `Add support for train event detection`
- **Good:** `Fix: Emoji not appearing on multi-line summaries`
- **Good:** `Docs: Add instructions for Google Calendar`
- **Bad:** `fix stuff`
- **Bad:** `updates`

## Questions?

Feel free to open an issue with the label `question` if you need help!

## Code of Conduct

- Be respectful and considerate
- Welcome newcomers
- Focus on constructive feedback
- Keep discussions on-topic

Thank you for contributing! 🙌
