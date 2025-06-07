import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import CodeMirror from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json';
import { oneDark } from '@codemirror/theme-one-dark';

function App() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');

  const formatJSON = () => {
    try {
      const parsed = JSON.parse(input);
      const formatted = JSON.stringify(parsed, null, 2);
      setOutput(formatted);
      setError('');
    } catch (e) {
      setError(`Invalid JSON: ${e.message}`);
      setOutput('');
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(output);
      // Show success feedback
    } catch (e) {
      console.error('Failed to copy:', e);
    }
  };

  return (
    <div style={{ padding: '10px', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <h2 style={{ fontSize: '16px', marginBottom: '10px' }}>API Response Formatter</h2>
      
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <label style={{ fontSize: '12px', marginBottom: '5px' }}>Input:</label>
          <div style={{ flex: 1, border: '1px solid #ddd', borderRadius: '4px', overflow: 'hidden' }}>
            <CodeMirror
              value={input}
              height="100%"
              theme={oneDark}
              extensions={[json()]}
              onChange={(value) => setInput(value)}
              placeholder="Paste your JSON here..."
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={formatJSON}
            style={{
              padding: '8px 16px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Format JSON
          </button>
          <button 
            onClick={copyToClipboard}
            disabled={!output}
            style={{
              padding: '8px 16px',
              backgroundColor: output ? '#28a745' : '#ccc',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: output ? 'pointer' : 'not-allowed'
            }}
          >
            Copy to Clipboard
          </button>
        </div>

        {error && (
          <div style={{ 
            padding: '8px', 
            backgroundColor: '#f8d7da', 
            color: '#721c24',
            borderRadius: '4px',
            fontSize: '12px'
          }}>
            {error}
          </div>
        )}

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <label style={{ fontSize: '12px', marginBottom: '5px' }}>Output:</label>
          <div style={{ flex: 1, border: '1px solid #ddd', borderRadius: '4px', overflow: 'hidden' }}>
            <CodeMirror
              value={output}
              height="100%"
              theme={oneDark}
              extensions={[json()]}
              readOnly={true}
              placeholder="Formatted JSON will appear here..."
            />
          </div>
        </div>
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);