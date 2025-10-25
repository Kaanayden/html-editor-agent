# HTML Editor Agent 🤖

An AI-powered Chrome extension that uses OpenAI to modify HTML on web pages through natural language chat interface. Perfect for creating mockups and experimenting with UI changes on existing projects.

## Features

- 💬 **Natural Language Interface**: Chat with an AI to modify web pages
- 🎨 **HTML Manipulation**: Add, remove, or modify HTML elements
- 🎯 **CSS Styling**: Change colors, fonts, and other styles on the fly
- 🚀 **Real-time Changes**: See modifications applied instantly to the current page
- 🔒 **Secure**: API key stored locally in browser storage

## Installation

### Prerequisites
- Google Chrome or any Chromium-based browser
- OpenAI API key (get one from [OpenAI Platform](https://platform.openai.com/api-keys))

### Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/Kaanayden/html-editor-agent.git
   cd html-editor-agent
   ```

2. **Load the extension in Chrome**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in the top-right corner)
   - Click "Load unpacked"
   - Select the `html-editor-agent` directory

3. **Configure your OpenAI API key**
   - Click the extension icon in your browser toolbar
   - Click the settings (⚙️) icon
   - Enter your OpenAI API key
   - Click "Save"

## Usage

### Basic Examples

1. **Open any webpage** you want to modify
2. **Click the extension icon** to open the chat interface
3. **Type your request** in natural language:

#### Example Commands:
- "Change the main heading to red"
- "Add a blue button below the title that says 'Click Me'"
- "Make all paragraph text larger"
- "Remove the sidebar"
- "Change the background color to light blue"
- "Add a search input field at the top of the page"

### How It Works

1. You describe what you want to change
2. The AI analyzes the current page structure
3. It generates the appropriate HTML/CSS modifications
4. Changes are applied instantly to the page

### Tips for Best Results

- Be specific about what you want to change (e.g., "the main heading" vs "h1")
- Mention colors, sizes, and positions clearly
- Start with simple requests to see how it works
- You can make multiple changes in sequence

## Architecture

The extension consists of:

- **popup.html/css/js**: User interface for the chat
- **background.js**: Service worker handling OpenAI API calls and coordination
- **content.js**: Content script for page manipulation
- **manifest.json**: Extension configuration

### Communication Flow

```
User Input (popup.js)
    ↓
Background Service Worker (background.js)
    ↓
OpenAI API
    ↓
Parse Modifications
    ↓
Content Script (content.js) → Modify Page DOM
```

## Development

### File Structure
```
html-editor-agent/
├── manifest.json       # Extension manifest
├── popup.html         # Popup UI
├── popup.css          # Popup styles
├── popup.js           # Popup logic
├── background.js      # Service worker
├── content.js         # Content script
├── icons/             # Extension icons
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md          # This file
```

### Modifying the Extension

1. Make your changes to the files
2. Go to `chrome://extensions/`
3. Click the refresh icon on the extension card
4. Test your changes

## Privacy & Security

- Your OpenAI API key is stored locally in your browser using Chrome's storage API
- No data is sent to any server except OpenAI's API
- The extension only modifies pages you explicitly request
- All modifications are temporary and lost on page reload

## Limitations

- Changes are temporary (page refresh will revert them)
- Works best with standard HTML/CSS structures
- Complex JavaScript-heavy sites may have limitations
- API usage is subject to OpenAI's rate limits and pricing

## Troubleshooting

### Extension not working?
- Check if you've entered a valid OpenAI API key
- Ensure the page has loaded completely
- Check the browser console for errors (F12)

### API errors?
- Verify your API key is correct
- Check your OpenAI account has available credits
- Review OpenAI API status page

### Changes not applying?
- Try refreshing the page and trying again
- Check if the selector in the request is correct
- Some pages may have restrictions on modifications

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## License

MIT License - feel free to use this project for any purpose.

## Credits

Built with:
- OpenAI GPT-3.5-turbo
- Chrome Extensions Manifest V3
- Vanilla JavaScript

## Support

If you encounter any issues or have questions, please open an issue on GitHub.