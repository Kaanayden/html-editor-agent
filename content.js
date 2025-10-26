// Content script - runs on web pages
// This script provides additional functionality for HTML manipulation

(function() {
  'use strict';

  // Mark that content script is loaded
  if (window.htmlEditorAgentLoaded) {
    return;
  }
  window.htmlEditorAgentLoaded = true;

  // Listen for messages from background script
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'GET_PAGE_INFO') {
      sendResponse({
        title: document.title,
        url: window.location.href,
        bodyHTML: document.body.innerHTML.substring(0, 5000)
      });
    }
    return true;
  });

  // Helper function to highlight modified elements
  function highlightElement(element, duration = 2000) {
    const originalOutline = element.style.outline;
    element.style.outline = '3px solid #667eea';
    element.style.transition = 'outline 0.3s';
    
    setTimeout(() => {
      element.style.outline = originalOutline;
    }, duration);
  }

  // Observe DOM mutations for debugging
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes' || mutation.type === 'childList') {
        // Log changes made by the extension
        console.log('HTML Editor Agent: DOM modified', mutation);
      }
    });
  });

  // Start observing
  observer.observe(document.body, {
    attributes: true,
    childList: true,
    subtree: true,
    attributeOldValue: true
  });

  console.log('HTML Editor Agent: Content script loaded');
})();
