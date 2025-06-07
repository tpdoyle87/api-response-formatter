// Content script for Chrome Extension

let autoFormatEnabled = true;
let originalPageContent = null;
let isFormatted = false;

// Load saved settings
chrome.storage.local.get(['autoFormat'], (result) => {
  autoFormatEnabled = result.autoFormat !== false; // Default to true
  if (autoFormatEnabled) {
    detectAndFormatJSON();
  }
});

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
  } else if (request.action === 'toggleAutoFormat') {
    autoFormatEnabled = request.enabled;
    if (autoFormatEnabled) {
      detectAndFormatJSON();
    } else {
      // Remove any auto-formatted content
      const existingModal = document.getElementById('json-formatter-modal');
      if (existingModal) {
        existingModal.remove();
      }
    }
  }
  return true;
});

// Function to apply syntax highlighting with depth-based coloring
function highlightJSON(json, depth = 0) {
  const colors = [
    '#e06c75', // depth 0 - red
    '#d19a66', // depth 1 - orange
    '#e5c07b', // depth 2 - yellow
    '#98c379', // depth 3 - green
    '#61afef', // depth 4 - blue
    '#c678dd', // depth 5 - purple
    '#56b6c2', // depth 6 - cyan
  ];
  
  const getColor = (d) => colors[d % colors.length];
  
  return json
    .replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, (match) => {
      const color = getColor(depth);
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          // Key
          return `<span style="color: ${color}; font-weight: bold;">${match}</span>`;
        } else {
          // String value
          return `<span style="color: #98c379;">${match}</span>`;
        }
      } else if (/true|false/.test(match)) {
        // Boolean
        return `<span style="color: #d19a66;">${match}</span>`;
      } else if (/null/.test(match)) {
        // Null
        return `<span style="color: #c678dd;">${match}</span>`;
      } else {
        // Number
        return `<span style="color: #e5c07b;">${match}</span>`;
      }
    })
    .replace(/[{}]/g, (match) => `<span style="color: ${getColor(depth)}; font-weight: bold;">${match}</span>`)
    .replace(/[\[\]]/g, (match) => `<span style="color: ${getColor(depth)};">${match}</span>`);
}

// Function to display formatted JSON in a modal
function showFormattedJSON(formattedJSON, isAutoFormat = false) {
  // Remove any existing modal
  const existingModal = document.getElementById('json-formatter-modal');
  if (existingModal) {
    existingModal.remove();
  }

  // Store search state
  let searchTerm = '';
  let currentMatchIndex = 0;
  let matches = [];
  let originalHighlightedJSON = '';

  // Parse and re-format with proper indentation for highlighting
  let highlightedJSON;
  try {
    const parsed = JSON.parse(formattedJSON);
    highlightedJSON = JSON.stringify(parsed, null, 2);
    
    // Apply syntax highlighting line by line with depth tracking
    const lines = highlightedJSON.split('\n');
    let depth = 0;
    highlightedJSON = lines.map(line => {
      const trimmed = line.trim();
      if (trimmed.endsWith('{') || trimmed.endsWith('[')) {
        const highlighted = highlightJSON(line, depth);
        depth++;
        return highlighted;
      } else if (trimmed.startsWith('}') || trimmed.startsWith(']')) {
        depth--;
        return highlightJSON(line, depth);
      }
      return highlightJSON(line, depth);
    }).join('\n');
    
    originalHighlightedJSON = highlightedJSON;
  } catch (e) {
    highlightedJSON = formattedJSON;
  }

  // Create modal container
  const modal = document.createElement('div');
  modal.id = 'json-formatter-modal';
  modal.style.cssText = `
    position: fixed;
    top: ${isAutoFormat ? '10px' : '50%'};
    left: ${isAutoFormat ? '10px' : '50%'};
    ${isAutoFormat ? '' : 'transform: translate(-50%, -50%);'}
    background: #1e1e1e;
    border: 1px solid #333;
    border-radius: 8px;
    padding: 20px;
    ${isAutoFormat ? 'width: calc(100% - 40px);' : 'max-width: 80%;'}
    ${isAutoFormat ? 'height: calc(100% - 40px);' : 'max-height: 80%;'}
    overflow: auto;
    z-index: 10000;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
  `;

  // Create header
  const header = document.createElement('div');
  header.style.cssText = `
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
    padding-bottom: 10px;
    border-bottom: 1px solid #333;
  `;

  const title = document.createElement('h3');
  title.textContent = 'Formatted JSON';
  title.style.cssText = `
    margin: 0;
    color: #e0e0e0;
    font-size: 16px;
  `;

  const buttonContainer = document.createElement('div');
  buttonContainer.style.cssText = `
    display: flex;
    gap: 10px;
  `;

  // Create toggle button (only for auto-formatted pages)
  if (isAutoFormat && originalPageContent) {
    const toggleButton = document.createElement('button');
    toggleButton.textContent = 'Show Raw';
    toggleButton.style.cssText = `
      border: none;
      background: #6c757d;
      color: white;
      padding: 6px 12px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      transition: background 0.2s;
    `;
    toggleButton.onmouseover = () => toggleButton.style.background = '#5a6268';
    toggleButton.onmouseout = () => toggleButton.style.background = '#6c757d';
    toggleButton.onclick = () => {
      toggleView();
    };
    buttonContainer.appendChild(toggleButton);
  }

  // Create copy button
  const copyButton = document.createElement('button');
  copyButton.textContent = 'Copy';
  copyButton.style.cssText = `
    border: none;
    background: #007bff;
    color: white;
    padding: 6px 12px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    transition: background 0.2s;
  `;
  copyButton.onmouseover = () => copyButton.style.background = '#0056b3';
  copyButton.onmouseout = () => copyButton.style.background = '#007bff';
  copyButton.onclick = () => {
    navigator.clipboard.writeText(formattedJSON);
    copyButton.textContent = 'Copied!';
    copyButton.style.background = '#28a745';
    setTimeout(() => {
      copyButton.textContent = 'Copy';
      copyButton.style.background = '#007bff';
    }, 2000);
  };

  // Create close button
  const closeButton = document.createElement('button');
  closeButton.textContent = '×';
  closeButton.style.cssText = `
    border: none;
    background: transparent;
    font-size: 24px;
    cursor: pointer;
    color: #999;
    padding: 0;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    transition: all 0.2s;
  `;
  closeButton.onmouseover = () => {
    closeButton.style.background = '#333';
    closeButton.style.color = '#fff';
  };
  closeButton.onmouseout = () => {
    closeButton.style.background = 'transparent';
    closeButton.style.color = '#999';
  };
  closeButton.onclick = () => modal.remove();

  // Create search bar
  const searchContainer = document.createElement('div');
  searchContainer.style.cssText = `
    display: flex;
    gap: 10px;
    margin-bottom: 15px;
    align-items: center;
  `;

  const searchInput = document.createElement('input');
  searchInput.type = 'text';
  searchInput.placeholder = 'Search keys or values...';
  searchInput.style.cssText = `
    flex: 1;
    padding: 8px 12px;
    background: #2d2d2d;
    border: 1px solid #444;
    border-radius: 4px;
    color: #e0e0e0;
    font-size: 14px;
    font-family: inherit;
    outline: none;
    transition: border-color 0.2s;
  `;
  searchInput.onfocus = () => searchInput.style.borderColor = '#007bff';
  searchInput.onblur = () => searchInput.style.borderColor = '#444';

  const searchInfo = document.createElement('div');
  searchInfo.style.cssText = `
    color: #999;
    font-size: 12px;
    min-width: 100px;
    text-align: right;
  `;

  const prevButton = document.createElement('button');
  prevButton.innerHTML = '↑';
  prevButton.style.cssText = `
    padding: 6px 10px;
    background: #444;
    border: none;
    border-radius: 4px;
    color: #e0e0e0;
    cursor: pointer;
    font-size: 14px;
    transition: background 0.2s;
  `;
  prevButton.onmouseover = () => prevButton.style.background = '#555';
  prevButton.onmouseout = () => prevButton.style.background = '#444';

  const nextButton = document.createElement('button');
  nextButton.innerHTML = '↓';
  nextButton.style.cssText = prevButton.style.cssText;
  nextButton.onmouseover = () => nextButton.style.background = '#555';
  nextButton.onmouseout = () => nextButton.style.background = '#444';

  // Search functionality
  const performSearch = (term) => {
    if (!term) {
      pre.innerHTML = originalHighlightedJSON;
      searchInfo.textContent = '';
      matches = [];
      currentMatchIndex = 0;
      return;
    }

    // Create regex for search term (escape special regex characters)
    const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    // Create a temporary div to work with the HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = originalHighlightedJSON;
    
    // Function to search and mark text nodes
    matches = [];
    let matchIndex = 0;
    
    const searchAndMark = (node) => {
      if (node.nodeType === 3) { // Text node
        const text = node.textContent;
        const regex = new RegExp(escapedTerm, 'gi');
        let match;
        const newHTML = [];
        let lastIndex = 0;
        
        while ((match = regex.exec(text)) !== null) {
          // Add text before match
          if (match.index > lastIndex) {
            newHTML.push(document.createTextNode(text.substring(lastIndex, match.index)));
          }
          
          // Add marked match
          const mark = document.createElement('mark');
          mark.style.cssText = 'background: #ffeb3b; color: #000; padding: 2px; border-radius: 2px;';
          mark.textContent = match[0];
          mark.dataset.matchIndex = matchIndex++;
          newHTML.push(mark);
          matches.push(mark);
          
          lastIndex = match.index + match[0].length;
        }
        
        // Add remaining text
        if (lastIndex < text.length) {
          newHTML.push(document.createTextNode(text.substring(lastIndex)));
        }
        
        // Replace the text node with new nodes
        if (newHTML.length > 0) {
          const parent = node.parentNode;
          newHTML.forEach(newNode => {
            parent.insertBefore(newNode, node);
          });
          parent.removeChild(node);
        }
      } else if (node.nodeType === 1 && node.nodeName !== 'MARK') { // Element node
        // Recursively search child nodes
        Array.from(node.childNodes).forEach(child => searchAndMark(child));
      }
    };
    
    searchAndMark(tempDiv);
    pre.innerHTML = tempDiv.innerHTML;

    // Update search info
    if (matches.length > 0) {
      searchInfo.textContent = `${currentMatchIndex + 1} / ${matches.length}`;
      // Re-get marks from the actual pre element
      matches = Array.from(pre.querySelectorAll('mark'));
      scrollToMatch(currentMatchIndex);
    } else {
      searchInfo.textContent = 'No matches';
    }
  };

  const scrollToMatch = (index) => {
    const marks = pre.querySelectorAll('mark');
    if (marks[index]) {
      marks.forEach((mark, i) => {
        if (i === index) {
          mark.style.background = '#ff9800';
          mark.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
          mark.style.background = '#ffeb3b';
        }
      });
    }
  };

  // Search event handlers
  let searchTimeout;
  searchInput.oninput = (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      searchTerm = e.target.value;
      currentMatchIndex = 0;
      performSearch(searchTerm);
    }, 300);
  };

  searchInput.onkeydown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (e.shiftKey) {
        prevButton.click();
      } else {
        nextButton.click();
      }
    }
  };

  prevButton.onclick = () => {
    if (matches.length > 0) {
      currentMatchIndex = (currentMatchIndex - 1 + matches.length) % matches.length;
      searchInfo.textContent = `${currentMatchIndex + 1} / ${matches.length}`;
      scrollToMatch(currentMatchIndex);
    }
  };

  nextButton.onclick = () => {
    if (matches.length > 0) {
      currentMatchIndex = (currentMatchIndex + 1) % matches.length;
      searchInfo.textContent = `${currentMatchIndex + 1} / ${matches.length}`;
      scrollToMatch(currentMatchIndex);
    }
  };

  // Create pre element for formatted JSON
  const pre = document.createElement('pre');
  pre.style.cssText = `
    margin: 0;
    padding: 20px;
    background: #2d2d2d;
    border-radius: 6px;
    overflow: auto;
    font-size: 14px;
    line-height: 1.6;
    color: #abb2bf;
    max-height: calc(100vh - 250px);
  `;
  pre.innerHTML = highlightedJSON;

  // Append elements
  header.appendChild(title);
  buttonContainer.appendChild(copyButton);
  buttonContainer.appendChild(closeButton);
  header.appendChild(buttonContainer);
  
  searchContainer.appendChild(searchInput);
  searchContainer.appendChild(searchInfo);
  searchContainer.appendChild(prevButton);
  searchContainer.appendChild(nextButton);
  
  modal.appendChild(header);
  modal.appendChild(searchContainer);
  modal.appendChild(pre);
  document.body.appendChild(modal);

  // Focus search input
  setTimeout(() => searchInput.focus(), 100);

  // Keyboard shortcuts
  const handleKeyboard = (e) => {
    if (e.key === 'Escape') {
      if (searchInput.value) {
        // Clear search first
        searchInput.value = '';
        performSearch('');
        searchInput.focus();
      } else {
        // Close modal
        modal.remove();
        document.removeEventListener('keydown', handleKeyboard);
      }
    } else if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
      e.preventDefault();
      searchInput.focus();
      searchInput.select();
    }
  };
  document.addEventListener('keydown', handleKeyboard);
}

// Function to detect and format JSON on the page
function detectAndFormatJSON() {
  // Check if the page content is JSON
  const contentType = document.contentType;
  const body = document.body;
  
  if (!body) return;
  
  // Check for JSON content type or if body contains only text that looks like JSON
  const isJSONContent = contentType && contentType.includes('application/json');
  const bodyText = body.textContent || '';
  const hasPreTag = body.firstChild && body.firstChild.tagName === 'PRE';
  
  if (isJSONContent || hasPreTag) {
    const textToCheck = bodyText.trim();
    
    // Try to parse as JSON
    if (textToCheck.startsWith('{') || textToCheck.startsWith('[')) {
      try {
        const parsed = JSON.parse(textToCheck);
        const formatted = JSON.stringify(parsed, null, 2);
        
        // Store original page content
        originalPageContent = document.body.cloneNode(true);
        isFormatted = true;
        
        // Show formatted JSON in full-page mode
        showFormattedJSON(formatted, true);
      } catch (e) {
        // Not valid JSON, ignore
      }
    }
  }
}

// Function to toggle between formatted and raw view
function toggleView() {
  const modal = document.getElementById('json-formatter-modal');
  
  if (isFormatted && originalPageContent) {
    // Show raw content
    if (modal) modal.remove();
    document.body = originalPageContent.cloneNode(true);
    isFormatted = false;
    
    // Add a small indicator that we can format this
    const indicator = document.createElement('div');
    indicator.id = 'json-format-indicator';
    indicator.innerHTML = '{ } Format JSON';
    indicator.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      background: #007bff;
      color: white;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      z-index: 10000;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      transition: all 0.2s;
    `;
    indicator.onmouseover = () => indicator.style.background = '#0056b3';
    indicator.onmouseout = () => indicator.style.background = '#007bff';
    indicator.onclick = () => {
      indicator.remove();
      const bodyText = document.body.textContent || '';
      try {
        const parsed = JSON.parse(bodyText.trim());
        const formatted = JSON.stringify(parsed, null, 2);
        isFormatted = true;
        showFormattedJSON(formatted, true);
      } catch (e) {
        console.error('Failed to format JSON:', e);
      }
    };
    document.body.appendChild(indicator);
  } else {
    // Format JSON
    const bodyText = document.body.textContent || '';
    try {
      const parsed = JSON.parse(bodyText.trim());
      const formatted = JSON.stringify(parsed, null, 2);
      isFormatted = true;
      showFormattedJSON(formatted, true);
    } catch (e) {
      console.error('Failed to format JSON:', e);
    }
  }
}