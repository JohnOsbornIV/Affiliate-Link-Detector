# Affiliate Link Detector

A Firefox extension that detects and highlights affiliate links on web pages and search results.

## Features

- **Comprehensive Detection**: Accurately identifies Amazon, Georiot, CNA.st, and other common affiliate link patterns
- **Search Engine Integration**: Scan Google and DuckDuckGo search results for affiliate links
- **Visual Indicators**: Red highlighting and hover tooltips for affiliate links
- **Search Result Filtering**: Hide search results that contain affiliate links
- **Clean UI**: Orange-themed popup with easy-to-use controls

## Supported Affiliate Networks

### High-Accuracy Detection
- **Amazon**: Associates tags, shortened links (amzn.to, a.co), ref parameters
- **Georiot**: Direct domains and geni.us short links
- **CNA.st**: All redirect patterns
- **Major Networks**: ShareASale, CJ, ClickBank, LinkSynergy, and 20+ others

### General Detection
- Common affiliate parameters (utm_*, ref, affiliate, partner, etc.)
- Shortened link services (bit.ly, tinyurl, etc.)
- Retailer-specific patterns (eBay, Best Buy, Walmart, Target, etc.)

## Installation

1. Open Firefox and navigate to `about:debugging`
2. Click "This Firefox"
3. Click "Load Temporary Add-on"
4. Select the `manifest.json` file from this directory

## Usage

### Basic Scanning
1. Click the orange extension button in the toolbar
2. Click "Scan Current Page" to detect affiliate links on the current page
3. Use "Highlight Links" to visually mark detected affiliate links

### Search Result Scanning
1. Perform a search on Google or DuckDuckGo
2. Click the extension button and use "Scan Search Results"
3. Results with affiliate links will show warning icons
4. Use "Hide Affiliate Results" to filter them out

### Auto-Highlighting
Enable "Auto-highlight on page load" in the popup to automatically scan and highlight affiliate links on every page.

## Privacy

This extension:
- Only analyzes URLs and page content locally
- Does not send any data to external servers
- Does not track your browsing activity
- Stores minimal settings locally

## Development

### Project Structure
```
affiliate-link-detector/
├── manifest.json          # Extension manifest
├── popup/
│   ├── popup.html         # Extension popup UI
│   └── popup.js           # Popup functionality
├── content/
│   ├── detector.js        # Main affiliate detection logic
│   ├── search-scanner.js  # Search results scanning
│   ├── styles.css         # Link highlighting styles
│   └── search-styles.css  # Search page styles
├── background/
│   └── background.js      # Background script
└── icons/
    ├── icon-16.png        # Extension icons
    ├── icon-48.png
    └── icon-128.png
```

### Key Components

- **detector.js**: Core affiliate link detection with comprehensive regex patterns
- **search-scanner.js**: Handles Google/DuckDuckGo search result analysis
- **popup.js**: Extension popup interface and controls
- **background.js**: URL scanning and cross-page functionality

## License

MIT License - feel free to modify and distribute.