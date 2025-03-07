# SnapShot X

A powerful Google Chrome extension that allows you to capture, annotate, and share screenshots directly from your browser. SnapShot X provides a seamless screenshot experience with advanced editing capabilities and instant sharing options.

## Features

- **Quick Capture**: 
  - Full page screenshots
  - Visible area capture
  - Custom selection capture
  - Delayed capture with countdown timer

- **Advanced Editing Tools**:
  - Draw, highlight, and add shapes
  - Add text annotations with custom fonts
  - Blur sensitive information
  - Crop and resize capabilities
  - Color picker and brush size options

- **Smart Organization**:
  - Auto-save screenshots locally
  - Custom naming conventions
  - Organize captures in collections
  - Search through your screenshot history

- **Instant Sharing**:
  - Direct upload to cloud storage
  - Copy to clipboard
  - Share via email
  - Generate shareable links
  - Export in multiple formats (PNG, JPG, PDF)

## How to Use

1. Click the SnapShot X icon in your Chrome toolbar
2. Select your preferred capture mode:
   - Full page
   - Visible area
   - Custom selection
3. Edit your screenshot using the built-in tools
4. Save or share your capture with one click

## Installation

1. Open Google Chrome
2. Navigate to `chrome://extensions`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked"
5. Select the project directory containing the `manifest.json` file

## Development

### Prerequisites

- Google Chrome Browser
- Node.js (recommended version 14+)

### Setup

1. Clone the repository:
```bash
git clone https://github.com/SagorIslamOfficial/snap-shot-x
cd snap-shot-x
```

2. Install dependencies:
```bash
npm install
```

3. Run in development mode:
```bash
npm run dev
```

### Technologies Used

- JavaScript/TypeScript
- HTML5 Canvas for editing
- Chrome Extension APIs
- WebRTC for screen capture
- IndexedDB for local storage

### Configuration

The extension can be configured through:
- Extension options page
- Right-click context menu
- Keyboard shortcuts (customizable)

Default keyboard shortcuts:
- Full page capture: `Ctrl/Cmd + Shift + F`
- Visible area: `Ctrl/Cmd + Shift + V`
- Custom selection: `Ctrl/Cmd + Shift + S`

## Project Structure

```
snap-shot-x/
├── src/           # Source files
├── dist/          # Distribution files
├── manifest.json  # Extension manifest
└── README.md      # This file
```

## Privacy & Security

- All screenshots are processed locally
- No data is sent to external servers without user consent
- Optional cloud backup with end-to-end encryption
- Full control over data storage and deletion

## Troubleshooting

Common issues and solutions:
1. **Capture not working**: Enable screen capture permissions in Chrome
2. **Extension not responding**: Refresh the page or restart Chrome
3. **Save failed**: Check storage permissions and available disk space

## License

MIT License

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
