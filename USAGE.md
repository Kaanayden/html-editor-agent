# Usage Guide - HTML Editor Agent

## Quick Start

### 1. Install the Extension
Follow the installation instructions in the [README.md](README.md)

### 2. Configure Your API Key
1. Click the extension icon in your Chrome toolbar
2. Click the settings gear (⚙️) icon
3. Enter your OpenAI API key
4. Click "Save"

### 3. Start Editing!
Navigate to any webpage and start making changes using natural language.

## Example Commands

### Basic Styling
- **"Change the main heading to red"**
  - Modifies the color of the h1 element
  
- **"Make all paragraph text larger"**
  - Increases font size of all p elements

- **"Change the background color to light blue"**
  - Updates body background color

- **"Add a border to all images"**
  - Adds CSS border to img elements

### Adding Elements
- **"Add a button below the title that says 'Click Me'"**
  - Creates a new button element with specified text

- **"Add a search input field at the top of the page"**
  - Inserts an input element

- **"Add a footer with copyright text"**
  - Creates a footer element with content

### Removing Elements
- **"Remove the sidebar"**
  - Deletes elements matching the sidebar selector

- **"Remove all advertisements"**
  - Removes elements that appear to be ads

### Modifying Content
- **"Change the title text to 'Welcome to My Site'"**
  - Updates the text content of an element

- **"Replace all 'Lorem ipsum' text with real content"**
  - Finds and replaces text

## Tips for Best Results

### Be Specific
❌ "Change the color"
✅ "Change the main heading color to blue"

### Use Visual Descriptors
- Reference elements by their appearance or position
- Example: "the sidebar on the left", "the main navigation bar"

### Break Down Complex Changes
Instead of: "Redesign the entire header with a new layout and colors"
Try:
1. "Change the header background to dark blue"
2. "Make the logo larger"
3. "Align the navigation menu to the right"

### Common Element References
- **Headings**: "the main heading", "h1", "page title"
- **Navigation**: "the menu", "navigation bar", "nav"
- **Content**: "all paragraphs", "the main content", "article text"
- **Sidebars**: "the sidebar", "side panel"
- **Buttons**: "the submit button", "all buttons"

## Advanced Usage

### CSS Properties
You can request specific CSS property changes:
- "Set the header padding to 20 pixels"
- "Change the font family to Arial"
- "Add a box shadow to the card"

### Multiple Changes
The AI can handle multiple changes in one request:
- "Change the header to blue, make the title larger, and add a border to the footer"

### Positioning
- "Move the sidebar to the right"
- "Center the main content"
- "Make the navigation bar sticky"

## Troubleshooting

### Changes Not Applying?
1. **Refresh the page** and try again
2. **Be more specific** about which element to modify
3. **Check the console** (F12) for error messages
4. **Verify your API key** is correct and has credits

### Wrong Element Modified?
- Use more specific selectors in your request
- Reference the element's location or appearance
- Try viewing the page source to find the correct selector

### API Errors?
- Check your OpenAI account has available credits
- Verify your API key is entered correctly
- Check [OpenAI Status page](https://status.openai.com) for service issues

## Limitations

### Temporary Changes
- All modifications are **temporary**
- Changes are lost when you refresh the page
- For permanent changes, save the HTML or implement changes in your code

### JavaScript Conflicts
- Some websites with heavy JavaScript may override changes
- Single Page Applications (SPAs) might revert changes
- Try making changes after the page fully loads

### Complex Sites
- Works best on static HTML content
- Dynamic content loaded via JavaScript may be challenging
- Some elements may be protected by the site's JavaScript

## Use Cases

### 1. Design Mockups
Create quick visual mockups by modifying existing sites to test design ideas.

### 2. Learning HTML/CSS
Experiment with different styles and layouts to learn web development.

### 3. Testing Changes
Preview design changes before implementing them in code.

### 4. Accessibility Testing
Quickly modify colors, sizes, and contrasts to test accessibility.

### 5. Client Presentations
Show clients potential design changes on their live site.

## Privacy & Security

- Your API key is stored **locally** in your browser
- No data is sent to any server except OpenAI
- Changes are only visible to you
- Original website is never modified permanently

## Getting Help

If you encounter issues:
1. Check the browser console (F12) for errors
2. Review the [README.md](README.md) for setup instructions
3. Open an issue on [GitHub](https://github.com/Kaanayden/html-editor-agent/issues)
