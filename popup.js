// Popup UI controller
class PopupController {
  constructor() {
    this.apiKey = null;
    this.chatMessages = [];
    this.currentWorkflowId = null;
    this.init();
  }

  async init() {
    // Load API key from storage
    const result = await chrome.storage.local.get(['openaiApiKey']);
    this.apiKey = result.openaiApiKey;

    // Set up event listeners
    this.setupEventListeners();

    // Show welcome message
    this.addMessage('assistant', 'Hello! I can help you modify HTML on the current page. What would you like to change?');

    // Check if API key is set
    if (!this.apiKey) {
      this.addMessage('system', 'Please set your OpenAI API key in settings (click the gear icon)');
    }

    // Listen for workflow status updates
    chrome.runtime.onMessage.addListener((message) => {
      if (message.type === 'WORKFLOW_STATUS') {
        this.handleWorkflowStatus(message);
      }
    });
  }

  setupEventListeners() {
    // Settings button
    document.getElementById('settingsBtn').addEventListener('click', () => {
      this.toggleSettings();
    });

    // Close settings
    document.getElementById('closeSettings').addEventListener('click', () => {
      this.toggleSettings();
    });

    // Save API key
    document.getElementById('saveApiKey').addEventListener('click', () => {
      this.saveApiKey();
    });

    // Send message
    document.getElementById('sendBtn').addEventListener('click', () => {
      this.sendMessage();
    });

    // Stop button
    document.getElementById('stopBtn').addEventListener('click', () => {
      this.stopWorkflow();
    });

    // Enter to send (Ctrl+Enter for new line)
    document.getElementById('userInput').addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });
  }

  toggleSettings() {
    const settingsPanel = document.getElementById('settingsPanel');
    const chatInterface = document.getElementById('chatInterface');
    
    if (settingsPanel.classList.contains('hidden')) {
      settingsPanel.classList.remove('hidden');
      chatInterface.style.display = 'none';
      // Load current API key
      if (this.apiKey) {
        document.getElementById('apiKeyInput').value = this.apiKey;
      }
    } else {
      settingsPanel.classList.add('hidden');
      chatInterface.style.display = 'flex';
    }
  }

  async saveApiKey() {
    const apiKeyInput = document.getElementById('apiKeyInput');
    const apiKey = apiKeyInput.value.trim();
    const statusDiv = document.getElementById('apiKeyStatus');

    if (!apiKey) {
      statusDiv.textContent = 'Please enter an API key';
      statusDiv.className = 'status-message error';
      return;
    }

    // Save to storage
    await chrome.storage.local.set({ openaiApiKey: apiKey });
    this.apiKey = apiKey;

    statusDiv.textContent = 'API key saved successfully!';
    statusDiv.className = 'status-message success';

    setTimeout(() => {
      this.toggleSettings();
      statusDiv.textContent = '';
    }, 1500);
  }


  handleWorkflowStatus(message) {
    const { step, message: statusMsg, workflowId } = message;
    
    if (workflowId !== this.currentWorkflowId) {
      return;
    }

    // Update or add status message
    if (this.statusMessageElement) {
      this.statusMessageElement.textContent = statusMsg;
    } else {
      this.statusMessageElement = this.addMessage('system', statusMsg);
    }

    // If workflow is complete or stopped, clear the status and enable buttons
    if (step === 'complete' || step === 'stopped') {
      setTimeout(() => {
        if (this.statusMessageElement) {
          this.statusMessageElement.remove();
          this.statusMessageElement = null;
        }
        this.currentWorkflowId = null;
        this.toggleWorkflowButtons(false);
      }, 2000);
    }
  }

  toggleWorkflowButtons(isRunning) {
    const sendBtn = document.getElementById('sendBtn');
    const stopBtn = document.getElementById('stopBtn');
    const userInput = document.getElementById('userInput');

    if (isRunning) {
      sendBtn.disabled = true;
      sendBtn.style.opacity = '0.5';
      stopBtn.classList.remove('hidden');
      userInput.disabled = true;
    } else {
      sendBtn.disabled = false;
      sendBtn.style.opacity = '1';
      stopBtn.classList.add('hidden');
      userInput.disabled = false;
    }
  }

  async stopWorkflow() {
    if (this.currentWorkflowId) {
      await chrome.runtime.sendMessage({
        type: 'STOP_WORKFLOW',
        workflowId: this.currentWorkflowId
      });
      this.addMessage('system', 'Stopping workflow...');
    }
  }

  async sendMessage() {
    const input = document.getElementById('userInput');
    const message = input.value.trim();

    if (!message) return;

    if (!this.apiKey) {
      this.addMessage('error', 'Please set your OpenAI API key first');
      return;
    }

    // Add user message
    this.addMessage('user', message);
    input.value = '';

    // Enable workflow controls
    this.toggleWorkflowButtons(true);

    try {
      // Get current page HTML
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      // Send message to background script
      const response = await chrome.runtime.sendMessage({
        type: 'CHAT_REQUEST',
        message: message,
        tabId: tab.id,
        apiKey: this.apiKey
      });

      if (response.success) {
        // Store workflow ID only on success
        this.currentWorkflowId = response.workflowId;
        this.addMessage('assistant', response.reply);
      } else {
        this.addMessage('error', `Error: ${response.error}`);
      }
    } catch (error) {
      this.addMessage('error', `Error: ${error.message}`);
    } finally {
      // Always disable workflow controls
      this.toggleWorkflowButtons(false);
    }
  }

  addMessage(type, text, allowHTML = false) {
    const messagesDiv = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    
    // Only use innerHTML for specific trusted content (like loading animation)
    // Otherwise use textContent to prevent XSS
    if (allowHTML) {
      messageDiv.innerHTML = text;
    } else {
      messageDiv.textContent = text;
    }
    
    messagesDiv.appendChild(messageDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
    return messageDiv;
  }
}

// Initialize popup
document.addEventListener('DOMContentLoaded', () => {
  new PopupController();
});
