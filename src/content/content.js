// Content script for Chrome Extension

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'formatSelection') {
    const selectedText = request.text || window.getSelection().toString();
    if (selectedText) {
      try {
        const parsed = JSON.parse(selectedText);
        const formatted = JSON.stringify(parsed, null, 2);
        
        // Create a temporary element to show formatted JSON
        showFormattedJSON(formatted);
        sendResponse({ success: true });
      } catch (e) {
        console.error('Invalid JSON:', e);
        sendResponse({ success: false, error: e.message });
      }
    }
  } else if (request.action === 'getSelection') {
    const selectedText = window.getSelection().toString();
    sendResponse({ text: selectedText });
  }
  return true;
});

// Function to display formatted JSON in a modal
function showFormattedJSON(formattedJSON) {
  // Remove any existing modal
  const existingModal = document.getElementById('json-formatter-modal');
  if (existingModal) {
    existingModal.remove();
  }

  // Create modal container
  const modal = document.createElement('div');
  modal.id = 'json-formatter-modal';
  modal.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: white;
    border: 1px solid #ccc;
    border-radius: 8px;
    padding: 20px;
    max-width: 80%;
    max-height: 80%;
    overflow: auto;
    z-index: 10000;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  `;

  // Create close button
  const closeButton = document.createElement('button');
  closeButton.textContent = '×';
  closeButton.style.cssText = `
    position: absolute;
    top: 10px;
    right: 10px;
    border: none;
    background: none;
    font-size: 24px;
    cursor: pointer;
    color: #666;
  `;
  closeButton.onclick = () => modal.remove();

  // Create copy button
  const copyButton = document.createElement('button');
  copyButton.textContent = 'Copy';
  copyButton.style.cssText = `
    position: absolute;
    top: 10px;
    right: 40px;
    border: none;
    background: #007bff;
    color: white;
    padding: 5px 10px;
    border-radius: 4px;
    cursor: pointer;
  `;
  copyButton.onclick = () => {
    navigator.clipboard.writeText(formattedJSON);
    copyButton.textContent = 'Copied!';
    setTimeout(() => {
      copyButton.textContent = 'Copy';
    }, 2000);
  };

  // Create pre element for formatted JSON
  const pre = document.createElement('pre');
  pre.style.cssText = `
    margin: 0;
    padding: 10px;
    background: #f5f5f5;
    border-radius: 4px;
    overflow: auto;
    font-family: 'Courier New', Courier, monospace;
    font-size: 14px;
    line-height: 1.5;
  `;
  pre.textContent = formattedJSON;

  // Append elements
  modal.appendChild(closeButton);
  modal.appendChild(copyButton);
  modal.appendChild(pre);
  document.body.appendChild(modal);

  // Close on Escape key
  const handleEscape = (e) => {
    if (e.key === 'Escape') {
      modal.remove();
      document.removeEventListener('keydown', handleEscape);
    }
  };
  document.addEventListener('keydown', handleEscape);
}