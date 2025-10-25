# Contributing to HTML Editor Agent

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## Getting Started

### Prerequisites
- Google Chrome or Chromium-based browser
- Basic knowledge of JavaScript, HTML, and CSS
- Familiarity with Chrome Extension development
- OpenAI API key for testing

### Development Setup

1. **Fork and Clone**
   ```bash
   # Fork the repository first on GitHub, then clone your fork
   git clone https://github.com/<your-username>/html-editor-agent.git
   cd html-editor-agent
   ```

2. **Load Extension**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the cloned directory

3. **Make Changes**
   - Edit the source files
   - Click the refresh icon on the extension card to reload
   - Test your changes

## Project Structure

```
html-editor-agent/
├── manifest.json       # Extension configuration
├── popup.html         # Main UI HTML
├── popup.css          # UI styles
├── popup.js           # UI logic and event handlers
├── background.js      # Service worker (OpenAI API calls)
├── content.js         # Content script (DOM manipulation)
├── icons/             # Extension icons
└── test-page.html     # Test page for development
```

## Development Guidelines

### Code Style

- Use **2 spaces** for indentation
- Use **semicolons**
- Use **single quotes** for strings
- Use **camelCase** for variables and functions
- Add **comments** for complex logic
- Keep functions **small and focused**

### JavaScript Best Practices

```javascript
// Good
async function handleRequest(data) {
  try {
    const result = await processData(data);
    return { success: true, result };
  } catch (error) {
    console.error('Error:', error);
    return { success: false, error: error.message };
  }
}

// Bad
function handleRequest(data) {
  processData(data).then(result => {
    return { success: true, result };
  }).catch(error => {
    return { success: false, error: error.message };
  });
}
```

### Testing Your Changes

1. **Test the popup UI**
   - Ensure all buttons and inputs work
   - Check responsive behavior
   - Verify error handling

2. **Test on multiple sites**
   - Simple static sites
   - Complex dynamic sites
   - Sites with heavy JavaScript

3. **Test edge cases**
   - Empty inputs
   - Invalid API keys
   - Network failures
   - Large HTML structures

## Types of Contributions

### Bug Fixes
- Check existing issues first
- Create a new issue if not already reported
- Reference the issue in your PR

### New Features
- Open an issue to discuss the feature first
- Ensure it aligns with project goals
- Update documentation

### Documentation
- Fix typos and clarify instructions
- Add examples and use cases
- Update screenshots if UI changes

### UI/UX Improvements
- Maintain consistent design language
- Ensure accessibility
- Keep the interface simple and intuitive

## Making a Pull Request

1. **Create a Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Your Changes**
   - Follow the code style guidelines
   - Test thoroughly
   - Update documentation

3. **Commit Your Changes**
   ```bash
   git add .
   git commit -m "Add: brief description of changes"
   ```
   
   Commit message format:
   - `Add:` for new features
   - `Fix:` for bug fixes
   - `Update:` for updates to existing features
   - `Docs:` for documentation changes
   - `Style:` for formatting changes

4. **Push to Your Fork**
   ```bash
   git push origin feature/your-feature-name
   ```

5. **Create Pull Request**
   - Go to the original repository
   - Click "New Pull Request"
   - Select your fork and branch
   - Provide a clear description of changes
   - Reference any related issues

## Feature Ideas

Looking for contribution ideas? Here are some features we'd love to see:

- [ ] **History/Undo**: Track changes and allow users to undo modifications
- [ ] **Save Snapshots**: Save modified HTML for later reference
- [ ] **Template Library**: Pre-built modification templates
- [ ] **Visual Element Picker**: Click on page elements to select them
- [ ] **Bulk Operations**: Apply changes to multiple elements at once
- [ ] **Dark Mode**: Theme support for the popup UI
- [ ] **Export Changes**: Export modifications as CSS or JavaScript
- [ ] **Custom Prompts**: User-defined AI prompts for specialized tasks
- [ ] **Multi-language Support**: Internationalization
- [ ] **Voice Input**: Voice commands for hands-free operation

## Code of Conduct

### Our Standards

- Be respectful and inclusive
- Welcome newcomers
- Accept constructive criticism
- Focus on what's best for the community
- Show empathy towards others

### Unacceptable Behavior

- Harassment or discriminatory language
- Trolling or insulting comments
- Personal or political attacks
- Publishing others' private information
- Other conduct inappropriate in a professional setting

## Questions?

- Open an issue for general questions
- Tag issues with `question` label
- Join discussions in existing issues

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Acknowledgments

Thank you to all contributors who help make this project better! 🎉
