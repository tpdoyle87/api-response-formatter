# API Response Formatter - Chrome Extension

A powerful Chrome extension for formatting and beautifying JSON, XML, and YAML data with syntax highlighting, validation, and advanced developer tools.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Chrome Web Store](https://img.shields.io/badge/Chrome-Extension-yellow)

## ✨ Features

- 🎨 **Instant JSON Formatting** - Beautiful syntax highlighting with CodeMirror
- ✅ **Smart Validation** - Real-time error detection and helpful error messages
- 🖱️ **Multiple Access Methods**:
  - Extension popup interface
  - Right-click context menu
  - Keyboard shortcut (Ctrl+Shift+F / Cmd+Shift+F)
- 📋 **One-Click Copy** - Copy formatted output to clipboard instantly
- 🌙 **Dark Theme** - Easy on the eyes with One Dark theme
- 🔒 **Privacy First** - All processing done locally, no data sent anywhere

## 🚀 Installation

### From Chrome Web Store (Coming Soon)
The extension will be available on the Chrome Web Store shortly.

### Development Installation
1. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/api-response-formatter.git
   cd api-response-formatter
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the extension:
   ```bash
   npm run build
   ```

4. Load in Chrome:
   - Open `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist` folder

## 🛠️ Development

### Setup
```bash
npm install
npm run dev  # Watch mode for development
```

### Build
```bash
npm run build  # Production build
npm run build:icons  # Generate icons only
```

### Project Structure
```
├── src/
│   ├── background/    # Background service worker
│   ├── content/       # Content scripts
│   ├── popup/         # Popup UI (React)
│   └── utils/         # Utility functions
├── scripts/           # Build scripts
├── dist/             # Built extension (git ignored)
└── manifest.json     # Extension manifest
```

## 📸 Screenshots

### JSON Formatting
Format messy JSON with beautiful syntax highlighting and proper indentation.

### Error Handling
Clear error messages help you fix invalid JSON quickly.

### Context Menu
Right-click any selected text to format it instantly.

## 🗺️ Roadmap

### Phase 1: MVP (Complete ✅)
- [x] Basic JSON formatting
- [x] Syntax highlighting
- [x] Context menu integration
- [x] Keyboard shortcuts

### Phase 2: Enhanced Features
- [ ] XML formatting
- [ ] YAML support
- [ ] CSV to JSON conversion
- [ ] JSON Schema validation

### Phase 3: AI-Powered Features
- [ ] Smart structure analysis
- [ ] Mock data generation
- [ ] Natural language queries
- [ ] API documentation generation

See [tasks.md](tasks.md) for the complete development roadmap.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 Privacy Policy

We take your privacy seriously. This extension:
- Processes all data locally in your browser
- Does not collect or transmit any user data
- Does not use analytics or tracking
- Does not require any account or sign-in

See [PRIVACY_POLICY.md](PRIVACY_POLICY.md) for details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [React](https://reactjs.org/)
- Code editing powered by [CodeMirror](https://codemirror.net/)
- Icons generated with [Canvas](https://www.npmjs.com/package/canvas)
- Build tooling by [Vite](https://vitejs.dev/)

---

Made with ❤️ by developers, for developers