// Popup UI controller
class PopupController {
  constructor() {
    this.apiKey = null;
    this.chatMessages = [];
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

    // Show loading
    const loadingMsg = this.addMessage('assistant', 'Thinking<span class="loading"></span>');

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

      // Remove loading message
      loadingMsg.remove();

      if (response.success) {
        this.addMessage('assistant', response.reply);
        
        // If there are HTML modifications, show confirmation
        if (response.modifications) {
          this.addMessage('system', 'Modifications applied to the page!');
        }
      } else {
        this.addMessage('error', `Error: ${response.error}`);
      }
    } catch (error) {
      loadingMsg.remove();
      this.addMessage('error', `Error: ${error.message}`);
    }
  }

  addMessage(type, text) {
    const messagesDiv = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.innerHTML = text;
    messagesDiv.appendChild(messageDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
    return messageDiv;
  }
}

// Initialize popup
document.addEventListener('DOMContentLoaded', () => {
  new PopupController();
});
