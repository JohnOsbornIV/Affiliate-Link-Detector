# Affiliate Link Detector

A Firefox extension that detects and highlights affiliate links on web pages and search results for duckduckgo.com.

This project is in its infancy and likely has issues.

## Features

- **Comprehensive Detection**: Identifies Amazon, Georiot, cna.st, and other common affiliate link patterns (including sites that state they earn affiliate commissions)
- **Search Engine Integration**: Scan DuckDuckGo search results for affiliate links (Google TBD)
- **Visual Indicators**: Red highlighting and hover tooltips for affiliate links
- **Search Result Filtering**: Hide search results that contain affiliate links
- **Clean UI**: Orange-themed popup with easy-to-use controls

## Supported Affiliate Networks

### High-Accuracy Detection
- **Amazon**: Associates tags, shortened links (amzn.to, a.co), ref parameters
- **Georiot/CNA.st**: Simplified domain-only detection (any URL containing these domains)
- **Major Networks**: ShareASale, CJ, ClickBank, LinkSynergy, and 20+ others

### General Detection
- Common affiliate parameters (utm_*, ref, affiliate, partner, etc.)
- Shortened link services (bit.ly, tinyurl, etc.)
- Retailer-specific patterns (eBay, Best Buy, Walmart, Target, etc.)

## Installation
1. Clone this repository.
2. Open Firefox and navigate to `about:debugging`
3. Click "This Firefox".
4. Click "Load Temporary Add-on".
5. Select the `manifest.json` file from this repository.
6. Search and enjoy!

## Usage

### Basic Scanning
Once a duckduckgo search query is returned, an orange banner will populate and asist you in identifying search results that contain affiliate links.

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

### Key Components

- **affiliate-patterns.js**: 🆕 Configurable detection patterns (easily customizable!)
- **detector.js**: Core affiliate link detection engine
- **search-scanner.js**: Handles DuckDuckGo search result analysis  
- **popup.js**: Extension popup interface and controls
- **background.js**: URL scanning and cross-page functionality

## 🎛️ Customization

Want to add your own affiliate detection rules? Check out `PATTERNS-README.md` for a complete guide on:

- Adding custom domains to always flag
- Adding new affiliate parameters
- Customizing detection behavior
- Testing your changes

## License

GNUv3 License - feel free to modify and distribute.
