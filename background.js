// Background service worker for Chrome extension

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'CHAT_REQUEST') {
    handleChatRequest(request, sendResponse);
    return true; // Will respond asynchronously
  }
});

async function handleChatRequest(request, sendResponse) {
  try {
    const { message, tabId, apiKey } = request;

    // Get current page context
    const pageContext = await getPageContext(tabId);

    // Call OpenAI API
    const aiResponse = await callOpenAI(message, pageContext, apiKey);

    // Parse AI response for HTML modifications
    const modifications = parseModifications(aiResponse);

    // Apply modifications if any
    if (modifications && modifications.length > 0) {
      await applyModifications(tabId, modifications);
    }

    sendResponse({
      success: true,
      reply: aiResponse,
      modifications: modifications
    });
  } catch (error) {
    console.error('Error in handleChatRequest:', error);
    sendResponse({
      success: false,
      error: error.message
    });
  }
}

async function getPageContext(tabId) {
  try {
    // Inject content script if not already injected
    await chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ['content.js']
    });

    // Get page HTML structure
    const results = await chrome.scripting.executeScript({
      target: { tabId: tabId },
      func: () => {
        // Get simplified HTML structure
        const body = document.body;
        return {
          title: document.title,
          url: window.location.href,
          bodyHTML: body.innerHTML.substring(0, 5000) // Limit to first 5000 chars
        };
      }
    });

    return results[0].result;
  } catch (error) {
    console.error('Error getting page context:', error);
    return { title: '', url: '', bodyHTML: '' };
  }
}

async function callOpenAI(userMessage, pageContext, apiKey) {
  const systemPrompt = `You are an HTML editor assistant. The user will ask you to modify HTML on a web page.
  
Current page context:
- Title: ${pageContext.title}
- URL: ${pageContext.url}

When the user asks to modify the page, provide:
1. A friendly response explaining what you'll do
2. The specific modifications in a special format

For HTML modifications, use this format at the end of your response:
[MODIFY]
{
  "action": "modify|add|remove|style",
  "selector": "CSS selector for target element",
  "content": "new HTML content or CSS properties",
  "property": "for style changes, the CSS property name",
  "value": "for style changes, the CSS property value"
}
[/MODIFY]

You can include multiple [MODIFY] blocks for multiple changes.

Examples:
- To change text color: action="style", selector="h1", property="color", value="red"
- To add an element: action="add", selector="body", content="<button>Click me</button>"
- To modify content: action="modify", selector=".title", content="New Title"
- To remove element: action="remove", selector=".old-element"

Keep responses concise and friendly.`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      temperature: 0.7,
      max_tokens: 500
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'OpenAI API request failed');
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

function parseModifications(aiResponse) {
  const modifications = [];
  const modifyRegex = /\[MODIFY\]([\s\S]*?)\[\/MODIFY\]/g;
  let match;

  while ((match = modifyRegex.exec(aiResponse)) !== null) {
    try {
      const modData = JSON.parse(match[1].trim());
      modifications.push(modData);
    } catch (e) {
      console.error('Failed to parse modification:', e);
    }
  }

  return modifications;
}

async function applyModifications(tabId, modifications) {
  for (const mod of modifications) {
    await chrome.scripting.executeScript({
      target: { tabId: tabId },
      func: (modification) => {
        const element = document.querySelector(modification.selector);
        if (!element) {
          console.warn('Element not found:', modification.selector);
          return;
        }

        switch (modification.action) {
          case 'style':
            element.style[modification.property] = modification.value;
            break;
          case 'modify':
            element.innerHTML = modification.content;
            break;
          case 'add':
            element.insertAdjacentHTML('beforeend', modification.content);
            break;
          case 'remove':
            element.remove();
            break;
        }
      },
      args: [mod]
    });
  }
}

// Installation handler
chrome.runtime.onInstalled.addListener(() => {
  console.log('HTML Editor Agent installed');
});
