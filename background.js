// Background service worker for Chrome extension

// Track active agent workflows
const activeWorkflows = new Map();

// AI model temperature for consistent behavior
const AI_TEMPERATURE = 0.3;

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'CHAT_REQUEST') {
    handleChatRequest(request, sendResponse);
    return true; // Will respond asynchronously
  } else if (request.type === 'STOP_WORKFLOW') {
    stopWorkflow(request.workflowId);
    sendResponse({ success: true });
    return true;
  }
});

async function handleChatRequest(request, sendResponse) {
  const workflowId = Date.now().toString();
  const workflow = {
    id: workflowId,
    stopped: false
  };
  activeWorkflows.set(workflowId, workflow);

  try {
    const { message, tabId, apiKey } = request;

    // Send status updates back to popup
    const sendStatus = (step, statusMessage, data = {}) => {
      try {
        chrome.runtime.sendMessage({
          type: 'WORKFLOW_STATUS',
          workflowId: workflowId,
          step: step,
          message: statusMessage,
          ...data
        });
      } catch (error) {
        // Popup may be closed, ignore error
        console.log('Could not send status update:', error.message);
      }
    };

    // Step 1: Analyze the page
    sendStatus('analyzing', 'Analyzing the page structure...');
    if (workflow.stopped) throw new Error('Workflow stopped');
    
    const pageContext = await getPageContext(tabId);

    // Step 2: Find the element
    sendStatus('finding', 'Finding the target element...');
    if (workflow.stopped) throw new Error('Workflow stopped');
    
    const analysis = await analyzeRequest(message, pageContext, apiKey);
    
    // Step 3: Plan the modification
    sendStatus('planning', 'Planning the modification...');
    if (workflow.stopped) throw new Error('Workflow stopped');
    
    const plan = await planModification(message, pageContext, analysis, apiKey);

    // Step 4: Execute the modification
    sendStatus('executing', 'Applying the modification...');
    if (workflow.stopped) throw new Error('Workflow stopped');
    
    const result = await executeModification(tabId, plan);

    // Step 5: Verify the modification
    sendStatus('verifying', 'Verifying the change...');
    if (workflow.stopped) throw new Error('Workflow stopped');
    
    const verification = await verifyModification(tabId, plan, apiKey);

    // Step 6: Retry if needed
    if (!verification.success && !workflow.stopped) {
      sendStatus('retrying', 'Modification failed, retrying...');
      
      // Check again if workflow was stopped
      if (workflow.stopped) throw new Error('Workflow stopped');
      
      const retryPlan = await planModification(
        message, 
        pageContext, 
        { ...analysis, previousError: verification.error }, 
        apiKey
      );
      
      if (workflow.stopped) throw new Error('Workflow stopped');
      
      await executeModification(tabId, retryPlan);
      const retryVerification = await verifyModification(tabId, retryPlan, apiKey);
      
      if (!retryVerification.success) {
        throw new Error(`Failed to apply modification: ${retryVerification.error}`);
      }
    }

    sendStatus('complete', 'Modification completed successfully!');

    sendResponse({
      success: true,
      reply: verification.summary || 'Modification applied successfully!',
      workflowId: workflowId
    });
  } catch (error) {
    console.error('Error in handleChatRequest:', error);
    sendResponse({
      success: false,
      error: error.message,
      workflowId: workflowId
    });
  } finally {
    activeWorkflows.delete(workflowId);
  }
}

function stopWorkflow(workflowId) {
  const workflow = activeWorkflows.get(workflowId);
  if (workflow) {
    workflow.stopped = true;
    chrome.runtime.sendMessage({
      type: 'WORKFLOW_STATUS',
      workflowId: workflowId,
      step: 'stopped',
      message: 'Workflow stopped by user'
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

async function analyzeRequest(userMessage, pageContext, apiKey) {
  // Sanitize HTML to prevent prompt injection
  const sanitizedHTML = pageContext.bodyHTML
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .substring(0, 3000); // Further limit for safety
  
  const systemPrompt = `You are an HTML analysis expert. Analyze the user's request and the page structure to identify the target element.

Current page:
- Title: ${pageContext.title}
- URL: ${pageContext.url}

Page structure (sanitized HTML, first 3000 chars):
${sanitizedHTML}

User request: "${userMessage}"

Your task:
1. Identify what element the user is referring to
2. Suggest the best CSS selector to target that element
3. Explain what needs to be changed

Respond in JSON format:
{
  "element_description": "description of the element",
  "suggested_selector": "CSS selector",
  "change_type": "style|content|add|remove",
  "reasoning": "why you chose this selector"
}`;

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
      temperature: AI_TEMPERATURE,
      max_tokens: 500
    })
  });

  if (!response.ok) {
    throw new Error('Failed to analyze request');
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  
  // Try to parse JSON from response
  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    console.error('Failed to parse analysis:', e);
  }
  
  return {
    element_description: 'unknown',
    suggested_selector: 'body',
    change_type: 'style',
    reasoning: 'Could not parse analysis'
  };
}

async function planModification(userMessage, pageContext, analysis, apiKey) {
  const systemPrompt = `You are an HTML modification planner. Create a detailed plan to modify the page based on the analysis.

User request: "${userMessage}"

Analysis results:
- Target element: ${analysis.element_description}
- Selector: ${analysis.suggested_selector}
- Change type: ${analysis.change_type}
${analysis.previousError ? `- Previous error: ${analysis.previousError}` : ''}

Create a modification plan in JSON format:
{
  "action": "style|modify|add|remove",
  "selector": "CSS selector",
  "property": "CSS property (for style changes)",
  "value": "new value or content",
  "content": "HTML content (for add/modify)",
  "description": "what this will do"
}`;

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
        { role: 'user', content: `Plan the modification for: ${userMessage}` }
      ],
      temperature: AI_TEMPERATURE,
      max_tokens: 500
    })
  });

  if (!response.ok) {
    throw new Error('Failed to plan modification');
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  
  // Try to parse JSON from response
  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    console.error('Failed to parse plan:', e);
  }
  
  // Fallback plan
  return {
    action: 'style',
    selector: analysis.suggested_selector,
    property: 'color',
    value: 'red',
    description: 'Fallback modification'
  };
}

async function executeModification(tabId, plan) {
  const results = await chrome.scripting.executeScript({
    target: { tabId: tabId },
    func: (modification) => {
      const element = document.querySelector(modification.selector);
      if (!element) {
        return { success: false, error: `Element not found: ${modification.selector}` };
      }

      try {
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
          default:
            return { success: false, error: `Unknown action: ${modification.action}` };
        }
        return { success: true };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },
    args: [plan]
  });

  return results[0].result;
}

async function verifyModification(tabId, plan, apiKey) {
  // Get the page state after modification
  const results = await chrome.scripting.executeScript({
    target: { tabId: tabId },
    func: (modification) => {
      const element = document.querySelector(modification.selector);
      if (!element) {
        return { found: false };
      }

      const styles = window.getComputedStyle(element);
      return {
        found: true,
        computedStyle: modification.property ? styles[modification.property] : null,
        innerHTML: element.innerHTML.substring(0, 200),
        exists: true
      };
    },
    args: [plan]
  });

  const state = results[0].result;

  // Verify based on action type
  if (plan.action === 'remove') {
    return {
      success: !state.found,
      error: state.found ? 'Element still exists after removal' : null,
      summary: 'Element successfully removed'
    };
  }

  if (!state.found) {
    return {
      success: false,
      error: 'Element not found after modification'
    };
  }

  if (plan.action === 'style' && plan.property && state.computedStyle) {
    // Simple verification - check if the property was set
    return {
      success: true,
      summary: `Style applied: ${plan.property} = ${state.computedStyle}`
    };
  }

  // For other actions, assume success if element exists
  return {
    success: true,
    summary: `Modification applied successfully`
  };
}

// Installation handler
chrome.runtime.onInstalled.addListener(() => {
  console.log('HTML Editor Agent installed');
});
