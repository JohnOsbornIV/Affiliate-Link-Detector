const SearchScanner = {
  searchResults: new Map(),
  filteredResults: new Set(),
  
  getSearchResultElements() {
    const isGoogle = window.location.hostname.includes('google.com');
    const isDuckDuckGo = window.location.hostname.includes('duckduckgo.com');
    
    if (isGoogle) {
      // Try multiple selectors for different Google layouts
      let results = document.querySelectorAll('div.g, div.MjjYud, div[data-hveid], .yuRUbf, .tF2Cxc, .hlcw0c');
      if (results.length === 0) {
        // Fallback to any div containing h3 elements (search results)
        results = document.querySelectorAll('div:has(h3), div:has(.LC20lb)');
      }
      return results;
    } else if (isDuckDuckGo) {
      let results = document.querySelectorAll('article[data-testid="result"], div.result, li[data-layout="organic"], .result__body');
      if (results.length === 0) {
        // Fallback for different DDG layouts
        results = document.querySelectorAll('.results .result, [data-testid*="result"]');
      }
      return results;
    }
    return [];
  },
  
  extractResultUrl(element) {
    const isGoogle = window.location.hostname.includes('google.com');
    const isDuckDuckGo = window.location.hostname.includes('duckduckgo.com');
    
    if (isGoogle) {
      // Try multiple selectors for Google results
      let link = element.querySelector('h3 a, h3 a[href], .LC20lb a, a[data-ved], a[jsname]:not([href^="#"]):not([href^="javascript"])');
      if (link && link.href) return link.href;
      
      // Try to find any valid link in the result
      const links = element.querySelectorAll('a[href]:not([href^="#"]):not([href^="javascript"]):not([href*="google.com"]):not([href*="webcache"])');
      if (links.length > 0) return links[0].href;
      
      // Fallback to cite element
      const cite = element.querySelector('cite');
      if (cite) {
        const text = cite.textContent.trim();
        if (text.startsWith('http')) return text;
        if (!text.includes('://') && text.length > 0) return 'https://' + text;
        return text;
      }
    } else if (isDuckDuckGo) {
      let link = element.querySelector('a[data-testid="result-title-a"], h2 a, .result__title a, a.result__a, a.result-link');
      if (link && link.href) return link.href;
      
      // Try any link in the result
      const links = element.querySelectorAll('a[href]:not([href^="#"]):not([href^="javascript"])');
      if (links.length > 0) return links[0].href;
    }
    
    return null;
  },
  
  async scanSearchResult(element, url) {
    try {
      console.log('Scanning URL:', url);
      
      // First check if the URL itself is an affiliate link
      const urlResult = AffiliateDetector.isAffiliateLink(url);
      if (urlResult && urlResult.confidence !== 'low') {
        console.log('Direct affiliate URL detected:', urlResult);
        this.markResultWithAffiliateLinks(element, 1);
        this.searchResults.set(element, {
          url: url,
          hasAffiliateLinks: true,
          count: 1,
          types: [urlResult.type]
        });
        return true;
      }
      
      // Now fetch the page content to analyze links inside
      try {
        const response = await fetch(url, {
          method: 'GET',
          mode: 'cors',
          credentials: 'omit',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });
        
        if (response.ok) {
          const html = await response.text();
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, 'text/html');
          const links = doc.querySelectorAll('a[href]');
          
          let affiliateCount = 0;
          const types = new Set();
          
          // Check links for affiliate patterns
          links.forEach(link => {
            const linkResult = AffiliateDetector.isAffiliateLink(link.href);
            if (linkResult && linkResult.confidence !== 'low') {
              affiliateCount++;
              types.add(linkResult.type);
            }
          });
          
          // Check page text for affiliate disclosures
          const pageText = doc.body ? doc.body.textContent.toLowerCase() : html.toLowerCase();
          const affiliateDisclosures = [
            'we may earn commission',
            'we may earn commissions', 
            'affiliate commission',
            'affiliate commissions',
            'earn commission from',
            'may receive commission',
            'compensated for purchases',
            'affiliate link',
            'affiliate links',
            'affiliate disclosure',
            'paid partnership',
            'sponsored content',
            'commission from qualifying purchases'
          ];
          
          let hasAffiliateDisclosure = false;
          for (const disclosure of affiliateDisclosures) {
            if (pageText.includes(disclosure)) {
              hasAffiliateDisclosure = true;
              types.add('disclosure');
              break;
            }
          }
          
          if (hasAffiliateDisclosure && affiliateCount === 0) {
            affiliateCount = 1; // Count disclosure as one affiliate indicator
          }
          
          console.log(`Found ${affiliateCount} affiliate links on ${url}${hasAffiliateDisclosure ? ' (includes affiliate disclosure)' : ''}`);
          
          if (affiliateCount > 0) {
            this.markResultWithAffiliateLinks(element, affiliateCount);
            this.searchResults.set(element, {
              url: url,
              hasAffiliateLinks: true,
              count: affiliateCount,
              types: Array.from(types)
            });
            return true;
          }
        }
      } catch (fetchError) {
        console.log('Could not fetch page, trying JSONP approach:', fetchError.message);
        
        // Fallback: Try to use background script to fetch
        return new Promise((resolve) => {
          chrome.runtime.sendMessage({
            action: 'scanUrlContent',
            url: url
          }, (response) => {
            if (response && response.hasAffiliateLinks) {
              console.log(`Background scan found ${response.count} affiliate links`);
              this.markResultWithAffiliateLinks(element, response.count);
              this.searchResults.set(element, {
                url: url,
                hasAffiliateLinks: true,
                count: response.count,
                types: response.types
              });
              resolve(true);
            } else {
              this.searchResults.set(element, {
                url: url,
                hasAffiliateLinks: false
              });
              resolve(false);
            }
          });
        });
      }
      
      // No affiliate links found
      this.searchResults.set(element, {
        url: url,
        hasAffiliateLinks: false
      });
      return false;
      
    } catch (error) {
      console.error('Error scanning URL:', url, error);
      this.searchResults.set(element, {
        url: url,
        hasAffiliateLinks: false
      });
      return false;
    }
  },
  
  markResultWithAffiliateLinks(element, count) {
    if (element.querySelector('.affiliate-warning-icon')) return;
    
    const icon = document.createElement('div');
    icon.className = 'affiliate-warning-icon';
    icon.title = `⚠️ This page contains ${count} affiliate link${count > 1 ? 's' : ''}`;
    icon.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" fill="#ff6b35"/>
        <path d="M12 8v4m0 4h.01" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <span class="affiliate-count">${count}</span>
    `;
    
    // Make sure element has relative positioning for absolute positioned icon
    const computedStyle = window.getComputedStyle(element);
    if (computedStyle.position === 'static') {
      element.style.position = 'relative';
    }
    
    element.appendChild(icon);
    element.classList.add('has-affiliate-links');
    
    // Add animation
    setTimeout(() => {
      icon.style.opacity = '1';
      icon.style.transform = 'scale(1)';
    }, 10);
    
    console.log('Marked search result with affiliate links:', element, count);
  },
  
  async scanAllResults() {
    const results = this.getSearchResultElements();
    console.log('Found', results.length, 'search results to analyze');
    
    const statusElement = document.querySelector('.scan-status');
    let affiliateCount = 0;
    let scannedCount = 0;
    
    // Process results sequentially to avoid overwhelming servers
    for (const element of results) {
      const url = this.extractResultUrl(element);
      if (url && !this.searchResults.has(element)) {
        console.log('Processing result:', url);
        
        if (statusElement) {
          statusElement.textContent = `Scanning ${scannedCount + 1} of ${results.length}...`;
        }
        
        try {
          const hasAffiliate = await this.scanSearchResult(element, url);
          if (hasAffiliate) {
            affiliateCount++;
          }
        } catch (error) {
          console.error('Error scanning result:', error);
        }
        
        scannedCount++;
        
        // Small delay to be respectful to servers
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    console.log('Scan complete:', affiliateCount, 'results with affiliate links');
    
    if (statusElement) {
      statusElement.textContent = `Found ${affiliateCount} results with affiliate links`;
    }
    
    return {
      total: results.length,
      scanned: scannedCount,
      withAffiliateLinks: affiliateCount
    };
  },
  
  filterResults(hideAffiliates) {
    const results = this.getSearchResultElements();
    
    results.forEach(element => {
      const data = this.searchResults.get(element);
      
      if (hideAffiliates && data && data.hasAffiliateLinks) {
        element.style.display = 'none';
        this.filteredResults.add(element);
      } else if (this.filteredResults.has(element)) {
        element.style.display = '';
        this.filteredResults.delete(element);
      }
    });
    
    return this.filteredResults.size;
  },
  
  showAllResults() {
    this.filteredResults.forEach(element => {
      element.style.display = '';
    });
    this.filteredResults.clear();
  },
  
  addScanButton() {
    if (document.querySelector('.affiliate-scan-controls')) return;
    
    const controls = document.createElement('div');
    controls.className = 'affiliate-scan-controls';
    controls.innerHTML = `
      <button id="scan-results-btn" class="scan-button">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Scan for Affiliate Links
      </button>
      <button id="filter-results-btn" class="filter-button" style="display: none;">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M22 3H2L10 12.46V19L14 21V12.46L22 3Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Hide Affiliate Results
      </button>
      <div class="scan-status"></div>
    `;
    
    const isGoogle = window.location.hostname.includes('google.com');
    const isDuckDuckGo = window.location.hostname.includes('duckduckgo.com');
    
    if (isGoogle) {
      const searchForm = document.querySelector('form[role="search"], #searchform');
      if (searchForm) {
        searchForm.parentElement.appendChild(controls);
      }
    } else if (isDuckDuckGo) {
      const header = document.querySelector('.header__search-wrap, .search-filters-wrap');
      if (header) {
        header.appendChild(controls);
      }
    }
    
    document.getElementById('scan-results-btn').addEventListener('click', async () => {
      const btn = document.getElementById('scan-results-btn');
      const filterBtn = document.getElementById('filter-results-btn');
      const status = document.querySelector('.scan-status');
      
      btn.disabled = true;
      btn.textContent = 'Scanning...';
      
      const results = await this.scanAllResults();
      
      btn.textContent = 'Scan Complete';
      status.textContent = `Found ${results.withAffiliateLinks} results with affiliate links`;
      
      if (results.withAffiliateLinks > 0) {
        filterBtn.style.display = 'inline-flex';
      }
      
      setTimeout(() => {
        btn.disabled = false;
        btn.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Rescan Results
        `;
      }, 2000);
    });
    
    document.getElementById('filter-results-btn').addEventListener('click', () => {
      const btn = document.getElementById('filter-results-btn');
      const isFiltered = btn.classList.contains('active');
      
      if (isFiltered) {
        this.showAllResults();
        btn.classList.remove('active');
        btn.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22 3H2L10 12.46V19L14 21V12.46L22 3Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Hide Affiliate Results
        `;
      } else {
        const hidden = this.filterResults(true);
        btn.classList.add('active');
        btn.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22 3H2L10 12.46V19L14 21V12.46L22 3Z" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Show All Results (${hidden} hidden)
        `;
      }
    });
  }
};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'scanSearchResults') {
    SearchScanner.scanAllResults().then(results => {
      sendResponse(results);
    });
    return true;
  } else if (request.action === 'filterSearchResults') {
    const hidden = SearchScanner.filterResults(request.hideAffiliates);
    sendResponse({ hidden: hidden });
  } else if (request.action === 'showAllSearchResults') {
    SearchScanner.showAllResults();
    sendResponse({ success: true });
  }
});

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => SearchScanner.addScanButton(), 500);
  });
} else {
  setTimeout(() => SearchScanner.addScanButton(), 500);
}

const searchObserver = new MutationObserver(() => {
  if (!document.querySelector('.affiliate-scan-controls')) {
    SearchScanner.addScanButton();
  }
});

searchObserver.observe(document.body, {
  childList: true,
  subtree: true
});